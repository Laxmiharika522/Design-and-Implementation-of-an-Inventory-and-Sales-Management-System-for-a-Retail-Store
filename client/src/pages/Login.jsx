import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, Truck, Users, Building2, Shield, ShoppingCart, Store, Package, Tag, Apple, Carrot, Beef, Milk, Fish, Croissant, Pizza, Coffee, Egg, Banana, IceCream, Barcode, Receipt, CreditCard, Boxes, BadgePercent, Calculator, ScanLine, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';

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
    case 'red': return 'border-red-500 bg-red-50 text-red-700 shadow-sm';
    case 'purple': return 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm';
    case 'emerald': return 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm';
    case 'blue':
    default: return 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm';
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
    <div className="min-h-screen flex items-center justify-center relative px-4 overflow-hidden bg-slate-50">
      {/* Dense Animated Grocery Icons Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-0">
         {/* Huge Background Icons (Far back) */}
         <motion.div animate={{ y: [0, -30, 0], rotate: [0, 10, -5, 0] }} transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} className="absolute top-[10%] left-[5%] text-green-600/5">
           <Apple size={240} />
         </motion.div>
         <motion.div animate={{ y: [0, 40, 0], x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} className="absolute bottom-[5%] right-[5%] text-orange-600/5">
           <Carrot size={280} />
         </motion.div>

         {/* Mid-sized Icons */}
         <motion.div animate={{ y: [0, -20, 0], rotate: [0, -15, 5, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} className="absolute top-[20%] right-[15%] text-red-500/10">
           <Beef size={120} />
         </motion.div>
         <motion.div animate={{ y: [0, 25, 0], x: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 9, ease: "easeInOut" }} className="absolute bottom-[20%] left-[10%] text-blue-500/10">
           <Milk size={140} />
         </motion.div>
         
         <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} className="absolute top-[40%] left-[25%] text-sky-500/10 -translate-y-1/2">
           <Fish size={80} />
         </motion.div>
         
         {/* Smaller floating elements (Foreground) */}
         <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }} className="absolute top-[15%] left-[30%] text-amber-600/15">
           <Croissant size={60} />
         </motion.div>
         <motion.div animate={{ y: [0, 15, 0], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }} className="absolute top-[30%] right-[25%] text-yellow-500/15">
           <Pizza size={64} />
         </motion.div>
         <motion.div animate={{ y: [0, -25, 0], rotate: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut" }} className="absolute bottom-[35%] left-[20%] text-stone-600/15">
           <Coffee size={70} />
         </motion.div>
         <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 8.5, ease: "easeInOut" }} className="absolute bottom-[25%] right-[25%] text-yellow-600/15">
           <Egg size={56} />
         </motion.div>
         <motion.div animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-[50%] right-[5%] text-yellow-400/10 -translate-y-1/2">
           <Banana size={90} />
         </motion.div>
         <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute bottom-[10%] left-[40%] text-pink-600/15">
           <IceCream size={50} />
         </motion.div>
         
         {/* Original Retail Business Elements */}
         <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 5.5, ease: "easeInOut" }} className="absolute top-[85%] left-[60%] text-sky-600/15">
           <Barcode size={60} />
         </motion.div>
         <motion.div animate={{ y: [0, 15, 0], rotate: [0, 45, 0] }} transition={{ repeat: Infinity, duration: 6.5, ease: "easeInOut" }} className="absolute top-[10%] right-[25%] text-amber-500/15">
           <BadgePercent size={64} />
         </motion.div>
         <motion.div animate={{ y: [0, -25, 0], rotate: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut" }} className="absolute bottom-[55%] left-[5%] text-teal-600/15">
           <Receipt size={70} />
         </motion.div>
         <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 8.5, ease: "easeInOut" }} className="absolute bottom-[10%] right-[35%] text-fuchsia-600/15">
           <CreditCard size={56} />
         </motion.div>
         <motion.div animate={{ y: [0, -10, 0], rotate: [0, 180, 360] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-[20%] right-[3%] text-orange-500/10">
           <Boxes size={90} />
         </motion.div>
         <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} className="absolute bottom-[5%] left-[80%] text-cyan-600/15">
           <Calculator size={50} />
         </motion.div>
         <motion.div animate={{ y: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 9.5, ease: "easeInOut" }} className="absolute top-[5%] left-[40%] text-pink-400/10">
           <ScanLine size={80} />
         </motion.div>
         <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} className="absolute bottom-[80%] right-[10%] text-lime-600/15">
           <Wallet size={65} />
         </motion.div>

         {/* Shopping Elements */}
         <motion.div animate={{ y: [0, -30, 0] }} transition={{ repeat: Infinity, duration: 9.5, ease: "easeInOut" }} className="absolute top-[5%] right-[40%] text-emerald-600/10">
           <ShoppingBag size={80} />
         </motion.div>
         <motion.div animate={{ x: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }} className="absolute bottom-[40%] right-[10%] text-indigo-600/15">
           <Package size={65} />
         </motion.div>

         {/* Subtle overlay gradients for depth */}
         <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-gradient-to-br from-green-400/10 to-orange-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
         <div className="absolute bottom-0 right-1/4 w-[40rem] h-[40rem] bg-gradient-to-tl from-red-400/10 to-blue-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="w-full max-w-xl relative z-10 animate-in fade-in zoom-in-95 duration-700 ease-out">
        <div className="bg-white/95 backdrop-blur-xl border-2 border-indigo-500/20 rounded-3xl p-10 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.15)] relative overflow-hidden">
          {/* Subtle colored glow inside card */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4">
              <span className="text-white font-black text-3xl leading-none">I</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">InventoryPro</h1>
            <p className="text-slate-800 text-[10px] mt-2 font-black uppercase tracking-[0.3em]">Enterprise Retail Management Platform</p>
          </div>

          {/* Portal Type Selector */}
          <p className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] mb-4">Select your portal</p>
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
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 hover:shadow-sm'
                    }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-black uppercase tracking-wider">{portal.label}</span>
                </button>
              );
            })}
          </div>

          {/* Selected portal info */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 mb-6 flex items-center gap-3 shadow-inner">
            {selectedPortal && <selectedPortal.icon size={16} className="text-blue-600 shrink-0" />}
            <span className="text-sm font-bold text-slate-900">{selectedPortal?.desc}</span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-bold"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-800 uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-bold"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 mt-2 bg-gradient-to-r disabled:opacity-50 text-white font-black uppercase tracking-wider text-sm rounded-xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${getButtonGradient(selectedPortal?.color)}`}
            >
              {isLoading ? 'Signing in...' : `Sign in as ${selectedPortal?.label}`}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-300/50 space-y-2 text-center">
            <p className="text-sm font-black text-slate-700">
              New customer? <Link to="/register" className="text-blue-700 font-black hover:text-blue-900 hover:underline">Create an account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
