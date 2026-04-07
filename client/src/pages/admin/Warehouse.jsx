import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, X, Warehouse as WarehouseIcon, MapPin } from 'lucide-react';

export default function Warehouse() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState({
    warehouse_manager: '', pincode: '', city: '', state: ''
  });

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses'],
    queryFn: async () => (await axios.get('/warehouses')).data
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingWarehouse) {
        return (await axios.put(`/warehouses/${editingWarehouse.warehouse_id}`, data)).data;
      }
      return (await axios.post('/warehouses', data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['warehouses']);
      closeModal();
    },
    onError: (err) => alert('Error: ' + (err.response?.data?.message || err.message))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`/warehouses/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['warehouses']),
    onError: (err) => alert('Error: ' + (err.response?.data?.message || err.message))
  });

  const filteredWarehouses = warehouses?.filter(w => 
    w.warehouse_manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.pincode.includes(searchTerm) ||
    w.WarehouseAddress?.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (w = null) => {
    if (w) {
      setEditingWarehouse(w);
      setFormData({
        warehouse_manager: w.warehouse_manager || '',
        pincode: w.pincode || '',
        city: w.WarehouseAddress?.city || '',
        state: w.WarehouseAddress?.state || ''
      });
    } else {
      setEditingWarehouse(null);
      setFormData({ warehouse_manager: '', pincode: '', city: '', state: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Warehouse Management</h2>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search warehouses..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
             />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap">
             <Plus size={18} /> Add Warehouse
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 font-semibold">Warehouse ID</th>
                <th className="px-6 py-4 font-semibold">Manager</th>
                <th className="px-6 py-4 font-semibold">Location</th>
                <th className="px-6 py-4 font-semibold">Pincode</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">Loading warehouses...</td></tr>
              ) : filteredWarehouses?.map(w => (
                <tr key={w.warehouse_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-indigo-600 font-bold">#WH-{w.warehouse_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <WarehouseIcon size={16} />
                      </div>
                      <span className="font-medium text-slate-800">{w.warehouse_manager}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin size={14} className="text-slate-400" />
                      {w.WarehouseAddress?.city}, {w.WarehouseAddress?.state}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">{w.pincode}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openModal(w)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                       <button onClick={() => { if(confirm('Delete this warehouse?')) deleteMutation.mutate(w.warehouse_id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredWarehouses?.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500">No warehouses found.</td></tr>
              )}
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
              <h3 className="text-lg font-bold text-slate-800">{editingWarehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Manager Name</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.warehouse_manager} onChange={e => setFormData({...formData, warehouse_manager: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                  <input required type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                  {saveMutation.isPending ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
