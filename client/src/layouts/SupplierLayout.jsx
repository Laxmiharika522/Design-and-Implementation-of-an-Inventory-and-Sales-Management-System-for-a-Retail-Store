import { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Truck, ClipboardList, User, ChevronLeft, ChevronRight, Package, BarChart3, IndianRupee, Phone, Building2, Hash, MapPin, Menu } from 'lucide-react';
import clsx from 'clsx';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { API_BASE } from '../config/api';

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Force light mode in Supplier Portal as requested
  useState(() => {
    document.documentElement.classList.remove('dark');
  });

  const { data: profile } = useQuery({
    queryKey: ['supplierProfile'],
    queryFn: () =>
      axios
        .get(API_BASE + '/supplier/profile', {
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
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 230 : 70 }}
        className={clsx(
          "flex flex-col bg-white border-r border-slate-200/90 shadow-sm pt-4 z-50 overflow-hidden shrink-0",
          "fixed inset-y-0 left-0 h-screen transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 mb-1">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20 text-white text-sm font-bold shrink-0">
                  <Truck size={17} />
                </div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight whitespace-nowrap">
                  Inventory<span className="text-purple-600 font-black">Pro</span>
                </span>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/20 text-white text-sm font-bold">
                  <Truck size={17} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Card */}
        {isSidebarOpen && (
          <div className="mx-3 mb-3 p-3 bg-purple-50/60 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">Logged In As</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" title="Online" />
              </div>
              <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{user?.name || 'Supplier'}</p>
            </div>

            <div className="pt-2 border-t border-purple-200/60 space-y-1 text-xs text-slate-700">
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 font-medium text-[11px] shrink-0">Email</span>
                <span className="font-semibold text-slate-800 truncate text-[11px]" title={user?.email || profile?.email || profile?.contact_email}>
                  {user?.email || profile?.email || profile?.contact_email || 'supplier@hub.com'}
                </span>
              </div>
              
              <div className="flex items-center justify-between gap-1">
                <span className="text-slate-500 font-medium text-[11px] shrink-0">Phone</span>
                <span className="font-semibold text-slate-800 text-[11px]">
                  {profile?.SupplierContacts?.[0]?.phone || user?.phone || '8309799537'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
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
                  "flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 group relative text-xs md:text-sm tracking-tight",
                  isActive
                    ? "bg-purple-50 text-purple-700 font-bold border border-purple-200/90 shadow-2xs"
                    : "hover:bg-purple-50/50 text-slate-700 hover:text-purple-700 font-medium"
                )}
              >
                {isActive && <motion.div layoutId="supplier-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-purple-600 rounded-r-full" />}
                <Icon size={17} className={clsx("shrink-0", isActive ? "text-purple-600" : "text-slate-400 group-hover:text-purple-600")} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="whitespace-nowrap font-semibold">
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions (Sign Out in Purple Theme) */}
        <div className="p-3 space-y-2 mt-auto hidden md:block border-t border-slate-200/80">
          <button 
            onClick={logout} 
            className={clsx(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 font-bold transition-all shadow-md shadow-purple-500/20 text-xs md:text-sm", 
              !isSidebarOpen && "justify-center"
            )}
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut size={16} className="shrink-0 text-white" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="w-full p-2 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-500 hover:text-slate-800 transition-colors font-medium"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
          </button>
        </div>
        {/* Mobile bottom buttons */}
        <div className="p-3 space-y-2 mt-auto md:hidden border-t border-slate-200">
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 font-bold text-xs md:text-sm shadow-md shadow-purple-500/20">
            <LogOut size={16} className="shrink-0 text-white" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <button 
               onClick={() => setIsMobileSidebarOpen(true)}
               className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
             >
               <Menu size={22} />
             </button>
            <Package size={18} className="text-purple-600 hidden md:block" />
            <h2 className="font-extrabold text-slate-900 text-base md:text-lg tracking-tight truncate">Supplier Portal</h2>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-extrabold text-slate-900 leading-none">{user?.name}</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Verified Supplier</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
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
