import { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ShoppingBag, ClipboardList, User, ChevronLeft, ChevronRight, ShoppingCart, Star, Menu } from 'lucide-react';
import clsx from 'clsx';

export const CustomerProtectedRoute = () => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (user?.userType !== 'customer') return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [cartCount] = useState(0);

  // Force light mode in Customer Portal as requested
  useState(() => {
    document.documentElement.classList.remove('dark');
  });

  const navItems = [
    { name: 'Shop Products', path: '/customer/shop', icon: ShoppingBag },
    { name: 'My Orders', path: '/customer/orders', icon: ClipboardList },
    { name: 'My Profile', path: '/customer/profile', icon: User },
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
        animate={{ width: isSidebarOpen ? 280 : 72 }}
        className={clsx(
          "flex flex-col bg-white border-r border-slate-200/90 shadow-sm pt-4 z-50 overflow-hidden shrink-0",
          "fixed inset-y-0 left-0 h-screen transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 py-2 mb-3">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center shadow-xs text-white font-black text-sm shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <span className="font-extrabold text-lg text-slate-900 tracking-tight whitespace-nowrap">
                  Inventory<span className="text-emerald-600 font-black">Pro</span>
                </span>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-xs text-white text-base">
                  <ShoppingBag size={18} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Card (Soft Light Airy Design) */}
        {isSidebarOpen && (
          <div className="mx-3.5 mb-4 p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 shadow-xs">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-800">Welcome Back</p>
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Customer'}</p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md mt-1 border border-emerald-200/60">
              Verified Member
            </span>
          </div>
        )}

        {/* Navigation Items */}
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
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/80 shadow-xs"
                    : "hover:bg-slate-100/80 text-slate-700 font-medium"
                )}
              >
                {isActive && <motion.div layoutId="customer-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-emerald-600 rounded-r-full" />}
                <Icon size={18} className={clsx("shrink-0", isActive ? "text-emerald-600" : "text-slate-500 group-hover:text-emerald-600")} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="whitespace-nowrap text-sm">
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions (Sign Out at Very Bottom) */}
        <div className="p-3 space-y-2 mt-auto hidden md:block border-t border-slate-200/80">
          <button 
            onClick={logout} 
            className={clsx(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all border border-red-200 text-sm shadow-xs", 
              !isSidebarOpen && "justify-center"
            )}
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut size={17} className="shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>

          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="w-full p-2 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={17} /> : <ChevronRight size={17} />}
          </button>
        </div>

        {/* Mobile bottom buttons */}
        <div className="p-3 space-y-2 mt-auto md:hidden border-t border-slate-200">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold border border-red-200">
            <LogOut size={18} className="shrink-0" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-100/70">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-200 shadow-xs sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMobileSidebarOpen(true)}
               className="md:hidden p-2 -ml-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
             >
               <Menu size={24} />
             </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-black text-sm shadow-sm">
                <ShoppingBag size={18} />
              </div>
              <h2 className="font-extrabold text-base md:text-lg tracking-tight text-slate-900">
                Customer Portal
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm border border-emerald-200">
              {user?.name?.charAt(0) || 'C'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold leading-none text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">Customer Member</p>
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
