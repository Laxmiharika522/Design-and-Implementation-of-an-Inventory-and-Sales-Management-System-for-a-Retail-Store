import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Receipt, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Customers() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  const isAdmin = user?.role === 'Admin';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Customers CRM</h2>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="th-base">Name</th>
                <th className="th-base">Email</th>
                <th className="th-base">Phone</th>
                <th className="th-base">Total Spent</th>
                <th className="th-base text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan="5" className="td-base text-center text-slate-500">Loading customers...</td></tr>
              ) : customers?.map(customer => (
                <tr key={customer.customer_id} className="tr-base">
                  <td className="td-base font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-blue-600 font-bold">
                       {customer.customer_name.charAt(0)}
                    </div>
                    {customer.customer_name}
                  </td>
                  <td className="td-base">{customer.email || 'N/A'}</td>
                  <td className="td-base">{customer.phone}</td>
                  <td className="td-base font-bold text-slate-900 dark:text-white">
                    ₹{Number(customer.total_spent || 0).toFixed(2)}
                  </td>

                  <td className="td-base text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => navigate('/admin/sales', { state: { customerId: customer.customer_id } })}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors rounded-lg flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
                      >
                        <Receipt size={14} /> Invoices
                      </button>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(customer.customer_id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors rounded-lg flex items-center gap-2 font-bold text-xs uppercase tracking-wider"
                          title="Delete Customer"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
