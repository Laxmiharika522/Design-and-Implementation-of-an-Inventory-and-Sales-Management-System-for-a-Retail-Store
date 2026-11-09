import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User, Mail, Phone, MapPin, Lock, Save, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../../config/api';

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

  const { data: profile, isLoading } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => axios.get(API_BASE + '/customer/profile', {
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
        password: ''
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data) => axios.put(API_BASE + '/customer/profile', data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['customerProfile']);
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '' }));
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

  if (isLoading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
      <p className="text-slate-500 font-bold text-sm">Loading profile details...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <User className="text-emerald-600" size={26} />
            <span>My Profile & Account</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Manage your delivery address, personal details, and account credentials.</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200">
          <ShieldCheck size={16} /> Verified Account
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-md p-6 md:p-8 space-y-6">
        {success && (
          <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center gap-3 border border-emerald-200 shadow-sm">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={18} className="text-emerald-700" />
            </div>
            <div>
              <p className="font-bold text-sm">Profile updated successfully!</p>
              <p className="text-xs text-emerald-700 font-medium">Your address and details have been saved.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User size={14} className="text-emerald-600" /> Full Name
              </label>
              <input 
                type="text" 
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Phone size={14} className="text-emerald-600" /> Phone Number
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Mail size={14} className="text-emerald-600" /> Email Address
            </label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <MapPin size={14} className="text-emerald-600" /> Delivery Address
            </label>
            <textarea 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter your complete home/delivery address..."
              rows="3"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all text-sm resize-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 space-y-1.5">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <Lock size={14} className="text-slate-500" /> Update Password (Optional)
            </label>
            <input 
              type="password" 
              name="password"
              placeholder="Enter new password (leave blank to keep current password)"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500 transition-all text-sm"
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 active:scale-95 text-sm"
            >
              {updateProfile.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
