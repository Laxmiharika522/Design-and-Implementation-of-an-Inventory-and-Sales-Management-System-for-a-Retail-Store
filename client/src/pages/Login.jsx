import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Truck, Users, Building2, Shield } from 'lucide-react';

const PORTAL_TYPES = [
  { id: 'admin', label: 'Admin', icon: Shield, desc: 'Store Manager', color: 'red' },
  { id: 'employee', label: 'Employee', icon: Building2, desc: 'Cashier', color: 'blue' },
  { id: 'supplier', label: 'Supplier', icon: Truck, desc: 'View orders', color: 'purple' },
  { id: 'customer', label: 'Customer', icon: ShoppingBag, desc: 'Shop & track', color: 'emerald' },
];

const getButtonGradient = (color) => {
  switch (color) {
    case 'red': return 'from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 shadow-red-500/20';
    case 'purple': return 'from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 shadow-purple-500/20';
    case 'emerald': return 'from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20';
    case 'blue':
    default: return 'from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-500/20';
  }
};

const getPortalBorderClasses = (color) => {
  switch (color) {
    case 'red': return 'border-red-500 bg-red-500/20 text-red-300';
    case 'purple': return 'border-purple-500 bg-purple-500/20 text-purple-300';
    case 'emerald': return 'border-emerald-500 bg-emerald-500/20 text-emerald-300';
    case 'blue':
    default: return 'border-blue-500 bg-blue-500/20 text-blue-300';
  }
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('employee');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password, userType);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedPortal = PORTAL_TYPES.find(p => p.id === userType);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative px-4 overflow-hidden">
      {/* Animated Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none animate-pulse delay-1000" style={{ animationDuration: '5s' }} />

      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <span className="text-white font-black text-3xl leading-none">I</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">InventoryPro</h1>
            <p className="text-slate-400 text-sm mt-1">Enterprise Retail Management Platform</p>
          </div>

          {/* Portal Type Selector */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Select your portal</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
            {PORTAL_TYPES.map(portal => {
              const Icon = portal.icon;
              const isSelected = userType === portal.id;
              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => setUserType(portal.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200 ${isSelected
                      ? getPortalBorderClasses(portal.color)
                      : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-semibold">{portal.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected portal info */}
          <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 mb-6 flex items-center gap-3">
            {selectedPortal && <selectedPortal.icon size={16} className="text-blue-400 shrink-0" />}
            <span className="text-sm text-slate-300">{selectedPortal?.desc}</span>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 mt-2 bg-gradient-to-r disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${getButtonGradient(selectedPortal?.color)}`}
            >
              {isLoading ? 'Signing in...' : `Sign in as ${selectedPortal?.label}`}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 space-y-2 text-center">
            <p className="text-sm text-slate-400">
              New customer? <Link to="/register" className="text-blue-400 font-semibold hover:text-blue-300">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
