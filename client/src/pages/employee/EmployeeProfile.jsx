import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { User, Mail, Phone, Lock, Save, Loader2, CheckCircle2, MapPin } from 'lucide-react';

export default function EmployeeProfile() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    employee_name: '',
    email: '',
    phone_number: '',
    pincode: '',
    city: '',
    state: '',
    password: ''
  });
  const [success, setSuccess] = useState(false);

  // Fetch current employee details
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['employeeProfile'],
    queryFn: () => axios.get('/employees/profile').then(r => r.data),
  });

  // Fetch available addresses (pincodes)
  const { data: addresses = [] } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => axios.get('/employees/addresses').then(r => r.data),
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        employee_name: profile.employee_name || '',
        email: profile.email || '',
        phone_number: profile.phone_number || '',
        pincode: profile.pincode || '',
        city: '',
        state: '',
        password: ''
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data) => axios.put('/employees/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['employeeProfile']);
      setSuccess(true);
      setFormData(prev => ({ ...prev, password: '' }));
      setTimeout(() => setSuccess(false), 3000);
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedAddress = addresses.find(a => a.pincode === formData.pincode);

  useEffect(() => {
    if (selectedAddress) {
      setFormData(prev => ({ ...prev, city: selectedAddress.city, state: selectedAddress.state }));
    }
  }, [selectedAddress]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (isProfileLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <User className="text-blue-600" /> My Profile
          </h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Update your personal information and account security.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 dark:border-emerald-800 animate-in slide-in-from-top duration-300">
              <CheckCircle2 size={20} className="text-emerald-500" />
              <p className="font-bold text-sm">Profile updated successfully!</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="employee_name"
                  value={formData.employee_name}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="tel" 
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                Pincode
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  placeholder="Enter Pincode"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                City
              </label>
              <input 
                type="text" 
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                State
              </label>
              <input 
                type="text" 
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
              Change Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                name="password"
                placeholder="Leave blank to keep unchanged"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              />
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              disabled={updateProfile.isPending}
              className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-3.5 rounded-xl font-black flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50 uppercase tracking-widest text-xs"
            >
              {updateProfile.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-start gap-4">
        <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm shrink-0 border dark:border-slate-700">
          <User size={20} className="text-blue-500" />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 dark:text-white">Role & Access</h4>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            Your account is registered as a <span className="font-black text-blue-600 uppercase tracking-tighter">{profile?.role}</span>. 
            Role-based permissions are managed by the Administrator and cannot be changed here.
          </p>
        </div>
      </div>
    </div>
  );
}
