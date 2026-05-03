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
        animate={{ width: isSidebarOpen ? 240 : 72 }}
        className={clsx(
          "flex flex-col bg-white border-r border-slate-200/60 shadow-sm pt-2 relative z-50 overflow-hidden",
          "fixed inset-y-0 left-0 h-full transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 mb-2">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <ShoppingBag size={16} className="text-white" />
                </div>
                <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600 whitespace-nowrap">My Store</span>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <ShoppingBag size={18} className="text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isSidebarOpen && (
          <div className="mx-4 mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <p className="text-xs text-emerald-600 font-medium flex items-center gap-1"><Star size={10} /> Welcome back!</p>
            <p className="text-sm font-bold text-emerald-800 truncate">{user?.name}</p>
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
                    ? "bg-emerald-50 text-emerald-700 font-semibold"
                    : "hover:bg-slate-100 text-slate-600"
                )}
              >
                {isActive && <motion.div layoutId="customer-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-emerald-600 rounded-r-full" />}
                <Icon size={20} className={clsx("shrink-0", isActive ? "text-emerald-600" : "text-slate-400")} />
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

        <div className="p-3 space-y-2 mt-auto hidden md:block">
          <button onClick={logout} className={clsx("w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors", !isSidebarOpen && "justify-center")}>
            <LogOut size={18} className="shrink-0" />
            {isSidebarOpen && <span className="text-sm font-medium">Sign Out</span>}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="w-full p-2 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Mobile bottom buttons */}
        <div className="p-3 space-y-2 mt-auto md:hidden">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={18} className="shrink-0" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white border-b border-slate-200/60 shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3">
             <button 
               onClick={() => setIsMobileSidebarOpen(true)}
               className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
             >
               <Menu size={24} />
             </button>
            <ShoppingCart size={20} className="text-emerald-500 hidden md:block" />
            <h2 className="font-bold text-lg md:text-xl truncate">Customer Portal</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold leading-none">{user?.name}</p>
              <p className="text-xs text-slate-500 mt-0.5">Customer</p>
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
