import { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, LayoutDashboard, Package, Users, ShoppingCart, 
  Activity, FileText, Settings, UserSquare2, 
  Menu, Bell, ChevronLeft, ChevronRight, User, Truck, Tag
} from 'lucide-react';
import clsx from 'clsx';
import { API_BASE } from '../config/api';

export const ProtectedRoute = ({ roles, children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return null;
  if (!token) return <Navigate to="/login" replace />;
  // Block non-employees from the employee portal
  if (user && user.userType !== 'employee') return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  if (children) return children;
  return <Outlet />;
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: alertsData } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => (await axios.get(API_BASE + '/reports/alerts')).data,
    refetchInterval: 60000 // refresh every minute
  });

  const totalAlerts = (alertsData?.lowStockCount || 0) + (alertsData?.expiredCount || 0);

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['Admin'] },
    { name: 'Employee Dashboard', path: '/employee/dashboard', icon: LayoutDashboard, roles: ['Admin', 'Cashier', 'Employee'] },
    { name: 'Sales (POS)', path: '/pos', icon: ShoppingCart, roles: ['Admin', 'Cashier'] },
    { name: 'Products', path: '/products', icon: Package, roles: ['Admin'] },
    { name: 'Categories', path: '/categories', icon: Tag, roles: ['Admin'] },
    { name: 'Inventory', path: '/inventory', icon: Activity, roles: ['Admin'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['Admin', 'Cashier'] },
    { name: 'Employees', path: '/employees', icon: UserSquare2, roles: ['Admin'] },
    { name: 'Suppliers & Orders', path: '/suppliers', icon: Truck, roles: ['Admin'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['Admin'] },
    { name: 'Sales Transactions', path: '/admin/sales', icon: FileText, roles: ['Admin', 'Cashier'] },
  ];

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Ensure light mode is active on mount
  useState(() => {
    document.documentElement.classList.remove('dark');
  });

  const isAdmin = user?.role === 'Admin';

  const currentRouteName = navItems.find(i => i.path === location.pathname)?.name || 'Application';

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans transition-colors duration-300">
      
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

      {/* Collapsible Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 72 }}
        className={clsx(
          "flex flex-col bg-white border-r border-slate-200/90 shadow-sm pt-4 z-50 overflow-hidden shrink-0",
          "fixed inset-y-0 left-0 h-screen transform transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-4 py-2 mb-2">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center shadow-xs text-white shrink-0 font-extrabold text-base", isAdmin ? "bg-rose-600" : "bg-blue-600")}>
                  I
                </div>
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
                  Inventory<span className={isAdmin ? "text-rose-600" : "text-blue-600"}>Pro</span>
                </h1>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center shadow-xs text-white font-extrabold text-lg", isAdmin ? "bg-rose-600" : "bg-blue-600")}>
                  I
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto mt-4 overflow-x-hidden">
          {navItems.filter(item => item.roles.includes(user?.role)).map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                title={!isSidebarOpen ? item.name : undefined}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 group relative text-sm",
                  isActive
                    ? (isAdmin ? "bg-rose-50 text-rose-950 font-extrabold border border-rose-200/90 shadow-xs" : "bg-blue-50 text-blue-900 font-extrabold border border-blue-200/90 shadow-xs")
                    : (isAdmin ? "hover:bg-rose-50/50 hover:text-rose-700 text-slate-700 font-medium" : "hover:bg-blue-50/50 hover:text-blue-700 text-slate-700 font-medium")
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="emp-active" 
                    className={clsx("absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 rounded-r-full", isAdmin ? "bg-rose-600" : "bg-blue-600")} 
                  />
                )}
                <Icon size={18} className={clsx("shrink-0", isActive ? (isAdmin ? "text-rose-600" : "text-blue-600") : (isAdmin ? "text-slate-400 group-hover:text-rose-600" : "text-slate-400 group-hover:text-blue-600"))} />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="whitespace-nowrap font-bold">
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 space-y-2 mt-auto hidden md:block border-t border-slate-200/80">
          <button 
            onClick={logout} 
            className={clsx(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 font-bold transition-all border border-red-200 text-sm shadow-xs", 
              !isSidebarOpen && "justify-center"
            )}
            title={!isSidebarOpen ? "Sign Out" : undefined}
          >
            <LogOut size={18} className="shrink-0" />
            {isSidebarOpen && <span>Sign Out</span>}
          </button>

          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="w-full p-2 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
             title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Mobile Bottom Footer */}
        <div className="p-3 space-y-2 mt-auto md:hidden border-t border-slate-200">
          <button 
            onClick={logout} 
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-bold text-sm border border-red-200"
          >
            <LogOut size={18} className="shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="glass h-16 px-4 md:px-8 flex items-center justify-between z-30 sticky top-0 border-b border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-3 flex-1">
             <button 
               onClick={() => setIsMobileSidebarOpen(true)}
               className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             >
               <Menu size={24} />
             </button>
             <h2 className="text-lg md:text-xl font-bold tracking-tight truncate">{currentRouteName}</h2>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">

            <div className="relative border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className={clsx("w-9 h-9 rounded-full flex items-center justify-center font-bold relative overflow-hidden ring-2 ring-white dark:ring-slate-900", isAdmin ? "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300" : "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300")}>
                  {user?.name?.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold leading-none">{user?.name}</p>
                  <p className="text-xs text-slate-500 mt-1">{user?.role}</p>
                </div>
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div 
                     initial={{ opacity: 0, scale: 0.95, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.95, y: 10 }}
                     className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-2xl shadow-xl py-2"
                  >
                    <div className="px-4 py-2 border-b dark:border-slate-700 mb-2">
                      <p className="text-sm font-semibold">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link 
                      to="/admin/profile" 
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-slate-600 dark:text-slate-300"
                    >
                      <User size={16} /> My Profile
                    </Link>
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <Settings size={16} /> Settings
                    </button>
                    <button 
                      onClick={logout} 
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors flex items-center gap-2 mt-1"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content with Framer Motion Route Transitions */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
             <motion.div
               key={location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
               className="h-full"
             >
               <Outlet />
             </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
