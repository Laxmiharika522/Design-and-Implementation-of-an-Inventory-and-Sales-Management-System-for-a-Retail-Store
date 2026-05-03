import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, MapPin, Phone, Building2, Save, Plus, Trash2, CheckCircle2, Loader2 } from 'lucide-react';

export default function SupplierProfile() {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const [form, setForm] = useState({ 
    supplier_name: '', 
    email: '', 
    pincode: '',
    city: '',
    state: '',
    bank_account_number: '',
    bank_name: '',
    ifsc_code: '',
    branch_name: ''
  });
  const [newPhone, setNewPhone] = useState('');
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [phoneErrorMsg, setPhoneErrorMsg] = useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['supplierProfile'],
    queryFn: () =>
      axios
        .get(import.meta.env.VITE_API_URL + '/supplier/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(r => r.data)
  });

  useEffect(() => {
    if (profile) {
      setForm({
        supplier_name: profile.supplier_name || '',
        email: profile.email || '',
        pincode: profile.pincode || '',
        city: profile.city || '',
        state: profile.state || '',
        bank_account_number: profile.bank_account_number || '',
        bank_name: profile.bankDetails?.bank_name || '',
        ifsc_code: profile.bankDetails?.ifsc_code || '',
        branch_name: profile.bankDetails?.branch_name || '',
      });
    }
  }, [profile]);

  const updateProfile = useMutation({
    mutationFn: (data) => axios.put(
      import.meta.env.VITE_API_URL + '/supplier/profile',
      data,
      { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
    ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplierProfile'] });
      refreshUser(); // sync updated name into AuthContext (sidebar + header)
      setSuccess(true);
      setErrorMsg('');
      // Removed the 3s timeout to keep summary visible as requested
    },
    onError: (err) => {
      const apiMessage = err?.response?.data?.message;
      const apiError = err?.response?.data?.error;
      const status = err?.response?.status;
      const message = apiMessage || apiError || err.message || 'Failed to update profile';
      console.error('Profile update failed:', { status, apiMessage, apiError });
      setErrorMsg(message);
      alert('Error: ' + message);
      setSuccess(false);
    },
  });

  const addPhone = useMutation({
    mutationFn: (phone) =>
      axios.post(
        import.meta.env.VITE_API_URL + '/supplier/profile/phone',
        { phone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplierProfile'] });
      setSuccess(true);
      setNewPhone('');
      setPhoneErrorMsg('');
    },
    onError: (err) => {
      const apiMessage = err?.response?.data?.message;
      const message = apiMessage || err.message || 'Failed to add phone number';
      console.error('Add phone failed:', err?.response?.data || err);
      setPhoneErrorMsg(message);
    }
  });

  const removePhone = useMutation({
    mutationFn: (phone) =>
      axios.delete(
        `${import.meta.env.VITE_API_URL}/supplier/profile/phone/${phone}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['supplierProfile'] });
      setSuccess(true);
      setPhoneErrorMsg('');
    },
    onError: (err) => {
      const apiMessage = err?.response?.data?.message;
      const message = apiMessage || err.message || 'Failed to remove phone number';
      console.error('Remove phone failed:', err?.response?.data || err);
      setPhoneErrorMsg(message);
    }
  });

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Basic Info */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <User className="text-blue-500" /> Supplier Profile
          </h2>
          <p className="text-sm text-slate-500 mt-1">Update your business information</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); setSuccess(false); updateProfile.mutate(form); }} className="p-6 space-y-4">
          {success && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl flex items-center gap-2 border border-emerald-100">
              <CheckCircle2 size={18} className="text-emerald-500" /> Profile updated successfully!
            </div>
          )}
          {errorMsg && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-100">
              {errorMsg}
            </div>
          )}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><User size={12} /> Business Name</label>
              <input value={form.supplier_name} onChange={e => { setSuccess(false); setForm({...form, supplier_name: e.target.value}); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><Mail size={12} /> Email</label>
              <input type="email" value={form.email} onChange={e => { setSuccess(false); setForm({...form, email: e.target.value}); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5"><MapPin size={12} /> Pincode</label>
              <input value={form.pincode} onChange={e => { setSuccess(false); setForm({...form, pincode: e.target.value}); }}
                placeholder="6-digit pincode"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">City</label>
              <input value={form.city} onChange={e => { setSuccess(false); setForm({...form, city: e.target.value}); }}
                placeholder="City"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">State</label>
              <input value={form.state} onChange={e => { setSuccess(false); setForm({...form, state: e.target.value}); }}
                placeholder="State"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
          <button type="submit" disabled={updateProfile.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
            {updateProfile.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save Changes
          </button>
        </form>
      </div>

      {/* Phone Numbers */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Phone size={18} className="text-blue-500" />
          <h3 className="font-bold text-slate-800">Contact Numbers</h3>
        </div>
        <div className="p-5 space-y-3">
          {phoneErrorMsg && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 border border-red-100">
              {phoneErrorMsg}
            </div>
          )}
          {(profile?.SupplierContacts || []).map(c => (
            <div key={c.phone} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-200">
              <span className="text-sm font-medium text-slate-700">{c.phone}</span>
              <button onClick={() => removePhone.mutate(c.phone)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {(profile?.SupplierContacts || []).length === 0 && (
            <p className="text-sm text-slate-400 italic">No phone numbers added.</p>
          )}
          <div className="flex gap-2 pt-2">
            <input value={newPhone} onChange={e => { setSuccess(false); setNewPhone(e.target.value); }}
              placeholder="Add phone number..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            <button onClick={() => { if (newPhone) { addPhone.mutate(newPhone); } }} disabled={!newPhone || addPhone.isPending}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
              <Plus size={15} /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
          <Building2 size={18} className="text-blue-500" />
          <h3 className="font-bold text-slate-800">Bank Details</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">Account Number</label>
              <input value={form.bank_account_number} onChange={e => { setSuccess(false); setForm({...form, bank_account_number: e.target.value}); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">Bank Name</label>
              <input value={form.bank_name} onChange={e => { setSuccess(false); setForm({...form, bank_name: e.target.value}); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">IFSC Code</label>
              <input value={form.ifsc_code} onChange={e => { setSuccess(false); setForm({...form, ifsc_code: e.target.value}); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">Branch Name</label>
              <input value={form.branch_name} onChange={e => { setSuccess(false); setForm({...form, branch_name: e.target.value}); }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400" />
            </div>
          </div>
          <button type="button" onClick={() => { setSuccess(false); updateProfile.mutate(form); }} disabled={updateProfile.isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2">
            {updateProfile.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Update Bank Details
          </button>
        </div>
      </div>

      {/* Profile Summary Alert (Shown after update) */}
      {success && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <CheckCircle2 color="white" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900">Updated Profile Summary</h3>
              <p className="text-sm text-blue-600">Your details have been successfully synchronized</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-y-4 gap-x-8">
            <div className="p-3 bg-white/50 rounded-xl">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Business Name</p>
              <p className="font-semibold text-slate-800">{form.supplier_name}</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Email</p>
              <p className="font-semibold text-slate-800">{form.email}</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Address Location</p>
              <p className="font-semibold text-slate-800">
                {form.city || form.state || form.pincode ? 
                  [form.city, form.state, form.pincode].filter(Boolean).join(', ') : 
                  'Not Set'
                }
              </p>
            </div>
            {(profile?.SupplierContacts || []).length > 0 && (
              <div className="p-3 bg-white/50 rounded-xl">
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Phone Numbers</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  {(profile?.SupplierContacts || []).map((c, idx) => (
                    <span key={idx} className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{c.phone}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="p-3 bg-white/50 rounded-xl">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Bank Account</p>
              <p className="font-semibold text-slate-800">{form.bank_account_number || 'Not Set'}</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">IFSC Code</p>
              <p className="font-semibold text-slate-800">{form.ifsc_code || 'Not Set'}</p>
            </div>
            <div className="p-3 bg-white/50 rounded-xl md:col-span-2">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Bank Institution</p>
              <p className="font-semibold text-slate-800">{form.bank_name}</p>
              <p className="text-xs text-slate-500">{form.branch_name}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
