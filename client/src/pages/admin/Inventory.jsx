import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Activity, ArrowDownUp, X, Save, AlertCircle, Search } from 'lucide-react';

export default function Inventory() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [reorderItem, setReorderItem] = useState(null);
  const [adjustData, setAdjustData] = useState({ type: 'IN', quantity: '', reason: '' });
  const [reorderValue, setReorderValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

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
      warehouse_id: reorderItem.warehouse_id,
      reorder_level: parseInt(reorderValue)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Inventory Status</h2>
        
        <div className="relative w-full md:w-72 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search products or barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm font-medium"
          />
        </div>
      </div>

      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="th-base">Barcode</th>
                <th className="th-base">Product Name</th>
                <th className="th-base text-right">Total In</th>
                <th className="th-base text-right">Total Out</th>
                <th className="th-base text-right">Current Stock</th>
                <th className="th-base text-right">Reorder Level</th>
                <th className="th-base">Warehouse</th>
                <th className="th-base text-right px-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700">
              {isLoading ? (
                <tr><td colSpan="8" className="td-base text-center text-slate-500 py-12">Loading inventory...</td></tr>
              ) : filteredInventory && filteredInventory.length > 0 ? (
                filteredInventory.map(item => {
                  const isLow = item.current_stock <= item.reorder_level;
                  return (
                    <tr key={item.inventory_id} className="tr-base">
                      <td className="td-base font-mono text-slate-500">{item.Product?.barcode || 'N/A'}</td>
                      <td className="td-base font-medium">{item.Product?.product_name}</td>
                      <td className="td-base text-right text-green-600 font-medium">{item.stock_in}</td>
                      <td className="td-base text-right text-orange-600 font-medium">{item.stock_out}</td>
                      <td className="td-base text-right font-bold text-lg">
                        <div className="flex flex-col items-end">
                          <span>{item.current_stock}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${isLow ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {isLow ? 'Low Stock' : 'Optimal'}
                          </span>
                        </div>
                      </td>
                      <td className="td-base text-right">
                         <button 
                           onClick={() => { setReorderItem(item); setReorderValue(item.reorder_level); }}
                           className="hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors group"
                         >
                           <span className="font-mono font-bold text-blue-600 group-hover:underline">{item.reorder_level}</span>
                         </button>
                      </td>
                      <td className="td-base text-slate-500 font-medium text-center">WH-{item.warehouse_id}</td>
                      <td className="td-base text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedItem(item)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl transition-all"
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
                  <td colSpan="8" className="td-base text-center text-slate-400 py-12 font-medium italic">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Adjust Stock</h3>
              <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAdjust} className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Product Name</p>
                  <p className="font-bold">{selectedItem.Product?.product_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Type</label>
                  <select 
                    value={adjustData.type}
                    onChange={(e) => setAdjustData(prev => ({ ...prev, type: e.target.value }))}
                    className="input-base h-11"
                  >
                    <option value="IN">Stock In (+)</option>
                    <option value="OUT">Stock Out (-)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Quantity</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    placeholder="0"
                    value={adjustData.quantity}
                    onChange={(e) => setAdjustData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="input-base h-11"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Reason</label>
                <textarea 
                  required
                  rows="3"
                  placeholder="e.g. Returned by customer, Expired stock removal..."
                  value={adjustData.reason}
                  onChange={(e) => setAdjustData(prev => ({ ...prev, reason: e.target.value }))}
                  className="input-base py-3"
                ></textarea>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="flex-1 py-3 px-4 rounded-xl border dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={adjustMutation.isPending}
                  className="flex-2 btn btn-primary flex items-center justify-center gap-2 py-3 px-8"
                >
                  <Save size={18} />
                  {adjustMutation.isPending ? 'Saving...' : 'Adjust Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reorder Level Modal */}
      {reorderItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Update Reorder Level</h3>
              <button onClick={() => setReorderItem(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleReorderUpdate} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">Low Stock Threshold</label>
                <div className="relative">
                  <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                  <input 
                    type="number" 
                    required 
                    min="1"
                    value={reorderValue}
                    onChange={(e) => setReorderValue(e.target.value)}
                    className="input-base h-12 pl-10 text-lg font-bold"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">The system will flag this product as "Low Stock" when current stock falls below this number.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setReorderItem(null)}
                  className="flex-1 py-3 px-4 rounded-xl border dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={reorderMutation.isPending}
                  className="flex-2 btn btn-primary flex items-center justify-center gap-2 py-3 px-8 text-white bg-blue-600 rounded-xl font-bold hover:bg-blue-700 transition-colors"
                >
                  <Save size={18} />
                  {reorderMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
