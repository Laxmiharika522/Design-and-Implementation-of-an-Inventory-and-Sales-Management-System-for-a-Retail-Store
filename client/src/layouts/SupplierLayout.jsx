import { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Truck, ClipboardList, User, ChevronLeft, ChevronRight, Package, BarChart3, IndianRupee, Phone, Building2, Hash, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const SupplierProtectedRoute = () => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.userType !== 'supplier') return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const SupplierLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Force light mode in Supplier Portal as requested
  useState(() => {
    document.documentElement.classList.remove('dark');
  });

  const { data: profile } = useQuery({
    queryKey: ['supplierProfile'],
    queryFn: () =>
      axios
        .get('http://localhost:5000/api/supplier/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        })
        .then(r => r.data),
    enabled: !!localStorage.getItem('token'),
  });

  const navItems = [
    { name: 'Dashboard', path: '/supplier/dashboard', icon: BarChart3 },
    { name: 'Purchase Orders', path: '/supplier/orders', icon: ClipboardList },
    { name: 'Delivery', path: '/supplier/delivery', icon: Truck },
    { name: 'Payments', path: '/supplier/payments', icon: IndianRupee },
    { name: 'My Profile', path: '/supplier/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 240 : 72 }}
        className="flex flex-col bg-white border-r border-slate-200/60 shadow-sm pt-2 relative z-20 overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 mb-2">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Truck size={16} className="text-white" />
                </div>
                <span className="font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-violet-600 whitespace-nowrap">Supplier Hub</span>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Truck size={18} className="text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isSidebarOpen && (
          <div className="mx-4 mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100 space-y-2">
            <p className="text-xs text-purple-500 font-black uppercase tracking-widest">Logged in as</p>
            <p className="text-sm font-black font-black text-purple-700 uppercase truncate">{user?.name}</p>

            {profile && (
              <div className="pt-1 border-t border-purple-100 space-y-1.5">
                {/* ID */}
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Hash size={11} className="text-purple-400 shrink-0" />
                  <span className="text-slate-400">ID:</span>
                  <span className="font-black truncate">{profile.supplier_id ?? profile.id ?? '—'}</span>
                </div>
                {/* Pincode */}
                {profile.pincode && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <MapPin size={11} className="text-purple-400 shrink-0" />
                    <span className="text-slate-400">Pincode:</span>
                    <span className="font-black">{profile.pincode}</span>
                  </div>
                )}
                {/* Phone numbers */}
                {(profile.SupplierContacts || []).length > 0 && (
                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <Phone size={11} className="text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400">Phone:</span>
                      {(profile.SupplierContacts || []).map(c => (
                        <div key={c.phone} className="font-black">{c.phone}</div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Bank */}
                {profile.bank_account_number && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Building2 size={11} className="text-purple-400 shrink-0" />
                    <span className="text-slate-400">Bank A/C:</span>
                    <span className="font-black truncate">{profile.bank_account_number}</span>
                  </div>
                )}
                {profile.bankDetails?.bank_name && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 pl-4">
                    <span className="text-slate-400 truncate">{profile.bankDetails.bank_name}</span>
                    {profile.bankDetails.ifsc_code && <span className="font-black truncate">· {profile.bankDetails.ifsc_code}</span>}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={!isSidebarOpen ? item.name : undefined}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-purple-50 text-purple-700 font-black"
                    : "hover:bg-slate-100 text-slate-600"
                )}
              >
                {isActive && <motion.div layoutId="supplier-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-purple-600 rounded-r-full" />}
                <Icon size={20} className={clsx("shrink-0", isActive ? "text-purple-600" : "text-slate-400")} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="whitespace-nowrap text-sm font-bold">
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-2 mt-auto">
          <button onClick={logout} className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors", !isSidebarOpen && "justify-center")}>
            <LogOut size={18} className="shrink-0" />
            {isSidebarOpen && <span className="text-sm font-black font-black uppercase tracking-widest">Sign Out</span>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full p-2 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 px-8 flex items-center justify-between bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Package size={20} className="text-purple-500" />
            <h2 className="font-black text-xl">Supplier Portal</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm font-black">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-black font-black leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Supplier</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
