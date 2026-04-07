import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { UserPlus, Edit2, Shield, Trash2, X } from 'lucide-react';

export default function Employees() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    employee_name: '', email: '', password: '', phone_number: '', pincode: '', role: 'Cashier'
  });

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
        password: '', // Don't show password
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Employee Directory</h2>
        <button onClick={() => openModal()} className="btn btn-primary px-4 py-2 flex items-center gap-2">
          <UserPlus size={18} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Phone</th>
                <th className="px-6 py-4 font-semibold">Pincode</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Loading employees...</td></tr>
              ) : employees?.map(emp => (
                <tr key={emp.employee_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium flex items-center gap-3 text-slate-800">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold border border-slate-200">
                       {(emp.employee_name || 'U').charAt(0)}
                    </div>
                    {emp.employee_name}
                  </td>
                  <td className="px-6 py-4">
                     <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                       emp.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'
                     }`}>
                        <Shield size={12} /> {emp.role}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{emp.email}</td>
                  <td className="px-6 py-4 text-slate-500">{emp.phone_number || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-500">{emp.pincode || 'N/A'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openModal(emp)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                       <button onClick={() => { if(confirm('Are you sure you want to delete this employee?')) deleteMutation.mutate(emp.employee_id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
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
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{editingEmployee ? `Update Role: ${editingEmployee.employee_name}` : 'Add New Employee'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {!editingEmployee ? (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input required type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.employee_name} onChange={e => setFormData({...formData, employee_name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                      <input required type="email" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Role</label>
                      <select className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 bg-white" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="Cashier">Cashier</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                    <input required type="password" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                      <input type="tel" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.phone_number} onChange={e => setFormData({...formData, phone_number: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
                      <input type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                  <label className="block text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider">Assign New Role</label>
                  <select className="w-full px-4 py-3 rounded-xl border-2 border-blue-200 outline-none focus:ring-4 focus:ring-blue-500/10 bg-white font-semibold text-blue-900 shadow-sm" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Cashier">Cashier</option>
                    <option value="Admin">Admin</option>
                  </select>
                  <p className="mt-3 text-xs text-blue-600 font-medium">Changing the role will instantly update this employee's access level within the system.</p>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                  {saveMutation.isPending ? 'Saving...' : (editingEmployee ? 'Update Role' : 'Save Employee')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
