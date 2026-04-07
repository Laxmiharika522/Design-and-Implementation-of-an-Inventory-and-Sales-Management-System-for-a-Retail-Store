import { useState } from 'react';
import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, LayoutDashboard, Package, Users, ShoppingCart, 
  Activity, FileText, Settings, UserSquare2, 
  Menu, Bell, ChevronLeft, ChevronRight, User, Warehouse as WarehouseIcon, Tag
} from 'lucide-react';
import clsx from 'clsx';

export const ProtectedRoute = ({ roles, children }) => {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  // Block non-employees from the employee portal
  if (user?.userType && user.userType !== 'employee') return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  if (children) return children;
  return <Outlet />;
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const { data: alertsData } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async () => (await axios.get('http://localhost:5000/api/reports/alerts')).data,
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
    { name: 'Warehouses', path: '/warehouse', icon: WarehouseIcon, roles: ['Admin'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['Admin'] },
    { name: 'Sales Transactions', path: '/admin/sales', icon: FileText, roles: ['Admin', 'Cashier'] },
  ];

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // Ensure dark mode is active on mount
  useState(() => {
    document.documentElement.classList.add('dark');
  });

  const currentRouteName = navItems.find(i => i.path === location.pathname)?.name || 'Application';

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      
      {/* Collapsible Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
        className="flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 shadow-[4px_0_24px_rgba(0,0,0,0.02)] pt-2 relative z-20"
      >
        <div className="flex items-center justify-between p-4 mb-2">
          <AnimatePresence mode="wait">
            {isSidebarOpen ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                  <span className="text-white font-bold text-lg leading-none">I</span>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight whitespace-nowrap">
                  InventoryPro
                </h1>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="w-full flex justify-center"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-xl leading-none">I</span>
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
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 border border-transparent rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold" 
                    : "hover:bg-slate-100 hover:border-slate-200 dark:hover:bg-slate-800/50 dark:hover:border-slate-700/50 text-slate-600 dark:text-slate-400"
                )}
                title={!isSidebarOpen ? item.name : undefined}
              >
                {isActive && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1/2 bg-blue-600 rounded-r-full" />
                )}
                <Icon size={20} className={clsx("shrink-0", isActive ? "text-blue-600" : "text-slate-500 group-hover:text-blue-500")} />
                
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -10 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="w-full p-2 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Navbar */}
        <header className="glass h-16 px-8 flex items-center justify-between z-10 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
             <h2 className="text-xl font-bold tracking-tight">{currentRouteName}</h2>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">

            <div className="relative border-l border-slate-200 dark:border-slate-700 pl-4 ml-2">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold relative overflow-hidden ring-2 ring-white dark:ring-slate-900">
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
        <div className="flex-1 overflow-auto p-6 md:p-8">
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
