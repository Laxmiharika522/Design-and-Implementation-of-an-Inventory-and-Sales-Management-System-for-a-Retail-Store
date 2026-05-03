import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, X, Tag } from 'lucide-react';

export default function Categories() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    category_name: '', description: ''
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await axios.get(import.meta.env.VITE_API_URL + '/categories')).data
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingCategory) {
        return (await axios.put(`${import.meta.env.VITE_API_URL}/categories/${editingCategory.category_id}`, data)).data;
      }
      return (await axios.post(import.meta.env.VITE_API_URL + '/categories', data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['categories']);
      closeModal();
    },
    onError: (err) => alert('Error: ' + (err.response?.data?.message || err.message))
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries(['categories']),
    onError: (err) => alert('Error: ' + (err.response?.data?.message || err.message))
  });

  const filteredCategories = categories?.filter(c => 
    c.category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (c = null) => {
    if (c) {
      setEditingCategory(c);
      setFormData({
        category_name: c.category_name || '',
        description: c.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ category_name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Category Management</h2>
        <div className="flex gap-4 items-center w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search categories..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
             />
          </div>
          <button onClick={() => openModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold transition-colors whitespace-nowrap">
             <Plus size={18} /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <th className="px-6 py-4 font-semibold">Category ID</th>
                <th className="px-6 py-4 font-semibold">Category Name</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">Loading categories...</td></tr>
              ) : filteredCategories?.map(c => (
                <tr key={c.category_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-indigo-600 font-bold">#CAT-{c.category_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <Tag size={16} />
                      </div>
                      <span className="font-medium text-slate-800">{c.category_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-md">
                    <p className="text-slate-600 line-clamp-2">{c.description || <span className="text-slate-300 italic">No description provided</span>}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button onClick={() => openModal(c)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                       <button onClick={() => { if(confirm('Delete this category?')) deleteMutation.mutate(c.category_id) }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredCategories?.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-slate-500">No categories found.</td></tr>
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
              <h3 className="text-lg font-bold text-slate-800">{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={closeModal} className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={18} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Category Name</label>
                <input required type="text" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.category_name} onChange={e => setFormData({...formData, category_name: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea rows="4" className="w-full px-4 py-2 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-5 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="px-5 py-2 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors">
                  {saveMutation.isPending ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
