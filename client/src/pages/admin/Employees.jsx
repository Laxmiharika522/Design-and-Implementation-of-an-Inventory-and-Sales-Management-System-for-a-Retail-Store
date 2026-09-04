import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserPlus, Edit2, Shield, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function Employees() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_name: '', email: '', password: '', phone_number: '', pincode: '', role: 'Cashier'
  });

  const isAdmin = user?.role === 'Admin';

  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => (await axios.get('/employees')).data
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingEmployee) {
        return (await axios.put(`/employees/${editingEmployee.employee_id}`, data)).data;
      }
      return (await axios.post('/employees', data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['employees']);
      closeModal();
    },
    onError: (err) => alert('Error: ' + (err.response?.data?.message || err.message))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['employees']),
    onError: (err) => alert('Error: ' + (err.response?.data?.message || err.message))
  });

  const openModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        employee_name: emp.employee_name || '',
        email: emp.email || '',
        password: '',
        phone_number: emp.phone_number || '',
        pincode: emp.pincode || '',
        role: emp.role || 'Cashier'
      });
    } else {
      setEditingEmployee(null);
      setFormData({
        employee_name: '', email: '', password: '', phone_number: '', pincode: '', role: 'Cashier'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      saveMutation.mutate({ role: formData.role });
    } else {
      saveMutation.mutate(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Manage store staff accounts & system roles</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className={clsx(
            "px-4 py-2.5 rounded-xl font-extrabold flex items-center gap-2 text-xs uppercase tracking-wider text-white shadow-xs transition-all",
            isAdmin ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-black tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Sales Processed</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 font-medium">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-400">Loading employees...</td></tr>
              ) : employees?.map(emp => (
                <tr key={emp.employee_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0", isAdmin ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700")}>
                      {emp.employee_name?.charAt(0)}
                    </div>
                    {emp.employee_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                      emp.role === 'Admin' 
                        ? (isAdmin ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-indigo-100 text-indigo-700') 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-semibold">{emp.email}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-mono">{emp.phone_number || 'N/A'}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate('/admin/sales', { state: { employeeId: emp.employee_id, employeeName: emp.employee_name } })}
                      className={clsx(
                        "px-2.5 py-1 rounded-lg text-xs font-extrabold border inline-flex items-center gap-1.5 transition-all shadow-2xs hover:scale-105 active:scale-95 cursor-pointer",
                        isAdmin ? "bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200" : "bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-200"
                      )}
                      title={`View sales transaction history for ${emp.employee_name}`}
                    >
                      <span>{emp.total_transactions || 0} sales</span>
                      <span className="opacity-40">•</span>
                      <span>₹{Number(emp.total_sales_value || 0).toFixed(2)}</span>
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => { if(confirm('Delete employee account?')) deleteMutation.mutate(emp.employee_id) }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col z-10 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-base font-extrabold text-slate-900">{editingEmployee ? 'Edit Role' : 'Register New Employee'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editingEmployee ? (
                <>
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">Full Name</label>
                    <input required type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold" value={formData.employee_name} onChange={e => setFormData({...formData, employee_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">Email Address</label>
                    <input required type="email" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">Password</label>
                    <input required type="password" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">Phone</label>
                      <input required type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">Pincode (Optional)</label>
                      <input type="text" className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                    </div>
                  </div>
                </>
              ) : null}

              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-700 mb-1">System Role</label>
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-extrabold bg-white"
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl font-bold text-xs uppercase text-slate-600 hover:bg-slate-100">Cancel</button>
                <button 
                  type="submit" 
                  disabled={saveMutation.isPending} 
                  className={clsx(
                    "px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase text-white shadow-xs",
                    isAdmin ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
