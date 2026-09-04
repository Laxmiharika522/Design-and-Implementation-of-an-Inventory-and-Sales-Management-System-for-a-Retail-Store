import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function Products() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  const isAdmin = user?.role === 'Admin';

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '', barcode: '', unit_price: '',
    category_id: '', supplier_id: '', image_url: '', expiry_date: ''
  });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  // Fetch Queries
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get(import.meta.env.VITE_API_URL + '/products', getHeaders())).data
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: async () => (await axios.get(import.meta.env.VITE_API_URL + '/categories', getHeaders())).data });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await axios.get(import.meta.env.VITE_API_URL + '/suppliers', getHeaders())).data });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (newProduct) => {
      if (editingProduct) {
        return await axios.put(`${import.meta.env.VITE_API_URL}/products/${editingProduct.product_id}`, newProduct, getHeaders());
      }
      return await axios.post(import.meta.env.VITE_API_URL + '/products', newProduct, getHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      closeModal();
    },
    onError: (error) => {
      console.error('Mutation Error:', error);
      alert('Error: ' + (error.response?.data?.message || error.message));
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`${import.meta.env.VITE_API_URL}/products/${id}`, getHeaders()),
    onSuccess: () => queryClient.invalidateQueries(['products'])
  });

  const filteredProducts = products?.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode?.includes(searchTerm)
  );

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_name: product.product_name || '',
        barcode: product.barcode || '',
        unit_price: product.unit_price || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        image_url: product.image_url || '',
        expiry_date: product.Inventory?.expiry_date ? new Date(product.Inventory.expiry_date).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_name: '', barcode: '', unit_price: '',
        category_id: '', supplier_id: '', image_url: '', expiry_date: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      unit_price: parseFloat(formData.unit_price),
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null
    });
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Products</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">View and manage retail store product catalog</p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
             <input 
               type="text" 
               placeholder="Search products or barcode..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none transition-all font-medium focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
             />
          </div>
          <button 
            onClick={() => openModal()} 
            className={clsx(
              "flex items-center gap-1.5 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-xs text-xs uppercase tracking-wider whitespace-nowrap",
              isAdmin ? "bg-rose-600 hover:bg-rose-700 border border-rose-500/30" : "bg-blue-600 hover:bg-blue-700 border border-blue-500/30"
            )}
          >
             <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

      {/* Light & Professional Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Barcode</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400">Loading products...</td></tr>
              ) : filteredProducts?.map(product => (
                <tr key={product.product_id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt=""
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=80&auto=format&fit=crop&q=60';
                          }}
                          className="w-7 h-7 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0" 
                        />
                      ) : (
                        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200/80 shrink-0">
                          <ImageIcon size={14} />
                        </div>
                      )}
                      <span className="font-bold text-slate-900 text-xs whitespace-nowrap">{product.product_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500 text-xs whitespace-nowrap">
                    {product.barcode || <span className="text-slate-300">N/A</span>}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100/80 text-slate-600 text-[11px] font-medium border border-slate-200/50">
                      {product.Category?.category_name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600 text-xs whitespace-nowrap">
                    {product.Supplier?.supplier_name || 'N/A'}
                  </td>
                  <td className="px-4 py-2.5 font-bold text-slate-900 text-xs whitespace-nowrap">
                    ₹{Number(product.unit_price).toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                     <span className={clsx(
                       "px-2 py-0.5 rounded-full text-[11px] font-bold border",
                       (product.Inventory?.current_stock || 0) > 10 
                         ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' 
                         : 'bg-rose-50 text-rose-700 border-rose-200/80'
                     )}>
                        {product.Inventory?.current_stock || 0} units
                     </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs whitespace-nowrap">
                    {product.Inventory?.expiry_date ? (
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <Calendar size={11} className="text-amber-600" />
                        {new Date(product.Inventory.expiry_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="text-slate-300 italic">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                       <button onClick={() => openModal(product)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors" title="Edit"><Edit2 size={14} /></button>
                       <button onClick={() => { if(confirm('Delete product?')) deleteMutation.mutate(product.product_id) }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Delete"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredProducts?.length === 0 && (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-slate-400 font-medium">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] z-10 border border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <h3 className="text-sm font-bold text-slate-900">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-lg transition-colors"><X size={16} /></button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form id="productForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name *</label>
                  <input required type="text" placeholder="e.g. Basmati Rice (5kg)" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs font-medium" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode</label>
                  <input type="text" placeholder="e.g. 890100000020" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 font-mono text-xs" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Selling Price (₹) *</label>
                  <input required type="number" step="0.01" placeholder="0.00" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs font-bold" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select required className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 bg-white text-xs font-medium" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories?.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
                  <select className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 bg-white text-xs font-medium" value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})}>
                    <option value="">Select Supplier</option>
                    {suppliers?.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Image URL</label>
                  <input type="url" placeholder="https://..." className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs font-medium" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input type="date" className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500/30 text-xs font-medium" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                </div>
              </form>
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl font-semibold text-xs text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button 
                type="submit" 
                form="productForm" 
                disabled={saveMutation.isPending} 
                className={clsx(
                  "px-5 py-2 rounded-xl font-bold text-xs text-white transition-all shadow-xs",
                  isAdmin ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {saveMutation.isPending ? 'Saving...' : (editingProduct ? 'Update Product' : 'Save Product')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
