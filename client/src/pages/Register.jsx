import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, ShoppingBag, Truck, ShieldCheck } from 'lucide-react';

const REGISTRATION_ROLES = [
  { id: 'admin', userType: 'admin', role: 'Admin', label: 'Admin', icon: ShieldCheck, desc: 'Store Manager', color: 'red' },
  { id: 'employee', userType: 'employee', role: 'Cashier', label: 'Employee', icon: Building2, desc: 'Point of sale access', color: 'blue' },
  { id: 'supplier', userType: 'supplier', role: 'Supplier', label: 'Supplier', icon: Truck, desc: 'View orders', color: 'purple' },
  { id: 'customer', userType: 'customer', role: 'Customer', label: 'Customer', icon: ShoppingBag, desc: 'Shop & track', color: 'emerald' },
];

const getColorMap = (color) => {
  switch(color) {
    case 'red': return { border: 'border-red-500 bg-red-500/20', icon: 'bg-red-500 text-white', text: 'text-red-200', btn: 'from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/20' };
    case 'purple': return { border: 'border-purple-500 bg-purple-500/20', icon: 'bg-purple-500 text-white', text: 'text-purple-200', btn: 'from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-500/20' };
    case 'emerald': return { border: 'border-emerald-500 bg-emerald-500/20', icon: 'bg-emerald-500 text-white', text: 'text-emerald-200', btn: 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20' };
    case 'blue':
    default: return { border: 'border-blue-500 bg-blue-500/20', icon: 'bg-blue-500 text-white', text: 'text-blue-200', btn: 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20' };
  }
};

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [selectedRoleOption, setSelectedRoleOption] = useState(REGISTRATION_ROLES[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        userType: selectedRoleOption.userType,
        role: selectedRoleOption.role
      };
      await registerUser(payload);
      // AuthContext will auto-login and App.jsx RootRedirect pushes to correct portal
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative px-4 py-8 overflow-y-auto overflow-x-hidden">
      {/* Animated Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="fixed bottom-0 right-1/4 w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse delay-1000" style={{ animationDuration: '5s' }} />

      <div className="w-full max-w-xl relative z-10 my-auto animate-in fade-in zoom-in-95 duration-700 ease-out py-8">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <span className="text-white font-black text-3xl leading-none">I</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
            <p className="text-slate-400 text-sm mt-1">Join the InventoryPro platform</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Selection Grid */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">I am registering as a...</label>
              <div className="grid grid-cols-2 gap-3">
                {REGISTRATION_ROLES.map(option => {
                  const Icon = option.icon;
                  const isSelected = selectedRoleOption.id === option.id;
                  const theme = getColorMap(option.color);
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedRoleOption(option)}
                      className={`flex items-start gap-3 p-3 rounded-2xl border-2 text-left transition-all duration-200 ${
                        isSelected
                          ? theme.border
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isSelected ? theme.icon : 'bg-white/10 text-slate-400'}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{option.label}</p>
                        <p className={`text-xs mt-0.5 ${isSelected ? theme.text : 'text-slate-500'}`}>{option.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-2 bg-gradient-to-r disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 text-lg ${getColorMap(selectedRoleOption.color).btn}`}
            >
              {isLoading ? 'Creating Account...' : `Register as ${selectedRoleOption.label}`}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Already have an account? <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
