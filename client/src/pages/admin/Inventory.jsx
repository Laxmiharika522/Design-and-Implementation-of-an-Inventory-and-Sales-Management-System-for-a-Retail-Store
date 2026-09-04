import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Activity, ArrowDownUp, X, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function Inventory() {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState(null);
  const [reorderItem, setReorderItem] = useState(null);
  const [adjustData, setAdjustData] = useState({ type: 'IN', quantity: '', reason: '' });
  const [reorderValue, setReorderValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'Admin';

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data } = await axios.get('/inventory');
      return data;
    }
  });

  const filteredInventory = inventory?.filter(item => 
    item.Product?.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.Product?.barcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const adjustMutation = useMutation({
    mutationFn: (payload) => axios.post('/inventory/adjust', payload),
    onSuccess: () => {
      setSelectedItem(null);
      setAdjustData({ type: 'IN', quantity: '', reason: '' });
      queryClient.invalidateQueries(['inventory']);
      alert('Stock adjusted successfully!');
    },
    onError: (err) => alert(err.response?.data?.message || 'Adjustment failed')
  });

  const reorderMutation = useMutation({
    mutationFn: (payload) => axios.put('/inventory/reorder-level', payload),
    onSuccess: () => {
      setReorderItem(null);
      queryClient.invalidateQueries(['inventory']);
      alert('Reorder level updated successfully!');
    },
    onError: (err) => alert(err.response?.data?.message || 'Update failed')
  });

  const handleAdjust = (e) => {
    e.preventDefault();
    adjustMutation.mutate({
      product_id: selectedItem.product_id,
      adjustment_type: adjustData.type,
      quantity_adjusted: parseInt(adjustData.quantity),
      reason: adjustData.reason
    });
  };

  const handleReorderUpdate = (e) => {
    e.preventDefault();
    reorderMutation.mutate({
      product_id: reorderItem.product_id,
      reorder_level: parseInt(reorderValue)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Inventory Status</h2>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Monitor real-time product stock & reorder levels</p>
        </div>
        
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search products or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl outline-none transition-all shadow-xs font-medium text-sm focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-400 uppercase text-[11px] font-black tracking-wider">
                <th className="px-6 py-4">Barcode</th>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4 text-right">Total In</th>
                <th className="px-6 py-4 text-right">Total Out</th>
                <th className="px-6 py-4 text-right">Current Stock</th>
                <th className="px-6 py-4 text-right">Reorder Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/80 font-medium">
              {isLoading ? (
                <tr><td colSpan="7" className="px-6 py-12 text-center text-slate-400">Loading inventory...</td></tr>
              ) : filteredInventory && filteredInventory.length > 0 ? (
                filteredInventory.map(item => {
                  const isLow = item.current_stock <= item.reorder_level;
                  return (
                    <tr key={item.inventory_id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-500 text-xs font-semibold">{item.Product?.barcode || 'N/A'}</td>
                      <td className="px-6 py-4 font-bold text-slate-900">{item.Product?.product_name}</td>
                      <td className="px-6 py-4 text-right text-emerald-600 font-bold">{item.stock_in}</td>
                      <td className="px-6 py-4 text-right text-amber-600 font-bold">{item.stock_out}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-black text-slate-900 text-base">{item.current_stock}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-extrabold uppercase tracking-wider border ${
                            isLow ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <button 
                           onClick={() => { setReorderItem(item); setReorderValue(item.reorder_level); }}
                           className="hover:bg-slate-100 p-1.5 rounded-lg transition-colors group"
                         >
                           <span className={clsx("font-mono font-extrabold text-sm group-hover:underline", isAdmin ? "text-rose-600" : "text-blue-600")}>{item.reorder_level}</span>
                         </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className={clsx("p-2 text-slate-400 rounded-xl transition-all", isAdmin ? "hover:text-rose-600 hover:bg-rose-50" : "hover:text-blue-600 hover:bg-blue-50")}
                            title="Adjust Stock"
                          >
                            <ArrowDownUp size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-400 font-medium italic">
                    {searchTerm ? `No products found matching "${searchTerm}"` : 'No inventory records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden z-10 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <h3 className="text-lg font-extrabold text-slate-900">Adjust Stock Level</h3>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-700 transition-colors"><X size={18}/></button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div className={clsx("flex items-center gap-3 p-4 rounded-2xl border", isAdmin ? "bg-rose-50/60 border-rose-200" : "bg-blue-50/60 border-blue-200")}>
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", isAdmin ? "bg-rose-100 text-rose-600 border-rose-200" : "bg-blue-100 text-blue-600 border-blue-200")}>
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Product Name</p>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedItem.Product?.product_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Type</label>
                  <select 
                    value={adjustData.type}
                    onChange={(e) => setAdjustData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-sm bg-white"
                  >
                    <option value="IN">Stock In (+)</option>
                    <option value="OUT">Stock Out (-)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Quantity</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="0"
                    value={adjustData.quantity}
                    onChange={(e) => setAdjustData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Reason</label>
                <input 
                  type="text"
                  placeholder="e.g. Shipment received / Damaged goods"
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-medium text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setSelectedItem(null)} className="px-5 py-2 rounded-xl font-bold text-xs uppercase text-slate-600 hover:bg-slate-100">Cancel</button>
                <button 
                  type="submit" 
                  disabled={adjustMutation.isPending}
                  className={clsx("px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase text-white shadow-xs", isAdmin ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700")}
                >
                  {adjustMutation.isPending ? 'Saving...' : 'Apply Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reorder Level Modal */}
      {reorderItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden z-10 border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/60">
              <h3 className="text-base font-extrabold text-slate-900">Set Reorder Threshold</h3>
              <button onClick={() => setReorderItem(null)} className="p-2 hover:bg-slate-200 rounded-xl text-slate-400 hover:text-slate-700"><X size={18}/></button>
            </div>
            <form onSubmit={handleReorderUpdate} className="p-6 space-y-4">
              <p className="text-xs text-slate-600 font-medium">Specify minimum stock quantity for <span className="font-bold text-slate-900">{reorderItem.Product?.product_name}</span> before triggering low stock alert.</p>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">Reorder Level Quantity</label>
                <input 
                  type="number" 
                  required 
                  min="0"
                  value={reorderValue}
                  onChange={(e) => setReorderValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 font-extrabold text-base"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setReorderItem(null)} className="px-4 py-2 rounded-xl font-bold text-xs uppercase text-slate-600 hover:bg-slate-100">Cancel</button>
                <button 
                  type="submit" 
                  disabled={reorderMutation.isPending}
                  className={clsx("px-5 py-2.5 rounded-xl font-extrabold text-xs uppercase text-white shadow-xs", isAdmin ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700")}
                >
                  {reorderMutation.isPending ? 'Updating...' : 'Update Reorder Level'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
