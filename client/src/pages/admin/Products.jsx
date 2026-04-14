import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, X, Image as ImageIcon, Calendar } from 'lucide-react';

export default function Products() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '', barcode: '', unit_price: '', hsn_code: '',
    category_id: '', supplier_id: '', image_url: '', expiry_date: ''
  });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  // Fetch Queries
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => (await axios.get('http://localhost:5000/api/products', getHeaders())).data
  });
  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: async () => (await axios.get('http://localhost:5000/api/categories', getHeaders())).data });
  const { data: suppliers } = useQuery({ queryKey: ['suppliers'], queryFn: async () => (await axios.get('http://localhost:5000/api/suppliers', getHeaders())).data });
  const { data: hsnCodes } = useQuery({ queryKey: ['hsnCodes'], queryFn: async () => (await axios.get('http://localhost:5000/api/products/hsn-codes', getHeaders())).data });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (newProduct) => {
      if (editingProduct) {
        return await axios.put(`http://localhost:5000/api/products/${editingProduct.product_id}`, newProduct, getHeaders());
      }
      return await axios.post('http://localhost:5000/api/products', newProduct, getHeaders());
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
    mutationFn: async (id) => await axios.delete(`http://localhost:5000/api/products/${id}`, getHeaders()),
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
        hsn_code: product.hsn_code || '',
        category_id: product.category_id || '',
        supplier_id: product.supplier_id || '',
        image_url: product.image_url || '',
        expiry_date: product.Inventory?.expiry_date ? new Date(product.Inventory.expiry_date).toISOString().split('T')[0] : ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        product_name: '', barcode: '', unit_price: '', hsn_code: '',
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
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Product Management</h2>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search products..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
             />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap">
             <Plus size={18} /> Add Product
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 font-semibold">Image</th>
                <th className="px-6 py-4 font-semibold">Barcode</th>
                <th className="px-6 py-4 font-semibold">HSN Code</th>
                <th className="px-6 py-4 font-semibold">Product Name</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Supplier</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold">Expiry</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="10" className="px-6 py-8 text-center text-slate-500">Loading products...</td></tr>
              ) : filteredProducts?.map(product => (
                <tr key={product.product_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.product_name} className="w-10 h-10 object-contain p-0.5 bg-slate-50 dark:bg-slate-900/40 rounded-lg border border-slate-200" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <ImageIcon size={18} />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 font-mono text-slate-500 text-xs">{product.barcode || 'N/A'}</td>
                  <td className="px-6 py-3 font-mono font-bold text-blue-600 text-xs">{product.hsn_code || 'N/A'}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">{product.product_name}</td>
                  <td className="px-6 py-3 text-slate-600">{product.Category?.category_name || 'N/A'}</td>
                  <td className="px-6 py-3 text-slate-600">{product.Supplier?.supplier_name || 'N/A'}</td>
                  <td className="px-6 py-3 font-semibold text-slate-800">₹{Number(product.unit_price).toFixed(2)}</td>
                  <td className="px-6 py-3">
                     <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                       product.Inventory?.current_stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                     }`}>
                        {product.Inventory?.current_stock || 0}
                     </span>
                  </td>
                  <td className="px-6 py-3">
                    {product.Inventory?.expiry_date ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-100">
                        <Calendar size={10} /> {new Date(product.Inventory.expiry_date).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px] italic">Not Set</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openModal(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                       <button onClick={() => { if(confirm('Delete product?')) deleteMutation.mutate(product.product_id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredProducts?.length === 0 && (
                <tr><td colSpan="10" className="px-6 py-8 text-center text-slate-500">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={formData.product_name} onChange={e => setFormData({...formData, product_name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Barcode</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm" value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Image URL</label>
                  <input type="url" placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories?.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Supplier</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white" value={formData.supplier_id} onChange={e => setFormData({...formData, supplier_id: e.target.value})}>
                    <option value="">Select Supplier</option>
                    {suppliers?.map(s => <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">HSN Code</label>
                  <select required className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white" value={formData.hsn_code} onChange={e => setFormData({...formData, hsn_code: e.target.value})}>
                    <option value="">Select HSN Code</option>
                    {hsnCodes?.map(h => (
                      <option key={h.hsn_code} value={h.hsn_code}>
                        {h.hsn_code} ({parseFloat(h.gst_rate)}% GST)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Selling Price (₹)</label>
                  <input required type="number" step="0.01" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Expiry Date</label>
                  <input type="date" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} />
                </div>

              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" form="productForm" disabled={saveMutation.isPending} className="px-5 py-2.5 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2">
                {saveMutation.isPending ? 'Saving...' : 'Save Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
