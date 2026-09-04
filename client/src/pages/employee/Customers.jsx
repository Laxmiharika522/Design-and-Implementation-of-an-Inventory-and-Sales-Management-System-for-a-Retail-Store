import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Receipt, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function Customers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'Admin';

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data } = await axios.get('/customers');
      return data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return axios.delete(`/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['customers']);
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Failed to delete customer');
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Customers CRM</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Registered customer directory & transaction metrics</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-black tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Total Spent</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 font-medium">
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400">Loading customers...</td></tr>
              ) : customers?.map(customer => (
                <tr key={customer.customer_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                    <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0", isAdmin ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700")}>
                       {customer.customer_name.charAt(0)}
                    </div>
                    {customer.customer_name}
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-semibold">{customer.email || 'N/A'}</td>
                  <td className="px-6 py-4 text-slate-600 text-xs font-mono">{customer.phone}</td>
                  <td className="px-6 py-4 font-black text-slate-900">
                    ₹{Number(customer.total_spent || 0).toFixed(2)}
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate('/admin/sales', { state: { customerId: customer.customer_id } })}
                        className={clsx(
                          "p-2 transition-colors rounded-lg flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider",
                          isAdmin ? "text-rose-600 hover:bg-rose-50" : "text-blue-600 hover:bg-blue-50"
                        )}
                      >
                        <Receipt size={14} /> Invoices
                      </button>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(customer.customer_id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-rose-600 hover:bg-rose-50 transition-colors rounded-lg flex items-center gap-1.5 font-extrabold text-xs uppercase tracking-wider"
                          title="Delete Customer"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && customers?.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">No registered customers found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
