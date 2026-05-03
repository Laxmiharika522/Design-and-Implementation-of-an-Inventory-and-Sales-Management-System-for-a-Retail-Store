import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function CustomerProfile() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [success, setSuccess] = useState(false);

  // Fetch current user details
  const { data: profile, isLoading } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => axios.get(import.meta.env.VITE_API_URL + '/customer/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        customer_name: profile.customer_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        password: '' // Don't pre-fill password
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data) => axios.put(import.meta.env.VITE_API_URL + '/customer/profile', data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['customerProfile']);
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-6 border-b border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                <User size={20} className="text-emerald-400" />
              </div>
              My Profile
            </h2>
            <p className="text-sm font-medium text-slate-400 mt-2 ml-13">Update your delivery address, contact info, and security credentials.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 size={16} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-sm">Profile updated successfully!</p>
                <p className="text-xs text-emerald-600/80">Your changes have been saved to the system.</p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={14} className="text-emerald-600" /> Full Name
              </label>
              <input 
                type="text" 
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Phone size={14} className="text-emerald-600" /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Mail size={14} className="text-emerald-600" /> Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-600" /> Delivery Address
            </label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete delivery address for orders..."
              rows="3"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all shadow-sm resize-none"
            />
          </div>

          <div className="pt-6 border-t border-slate-200/80 space-y-1.5">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Lock size={14} className="text-slate-400" /> Security
            </label>
            <input 
              type="password" 
              name="password"
              placeholder="Enter a new password (leave blank to keep unchanged)"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all shadow-sm"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white px-8 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 active:scale-95 hover:-translate-y-0.5 text-base"
            >
              {updateProfile.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
