import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Package, Clock, Truck, CheckCircle, TrendingUp,
  ClipboardList, IndianRupee, XCircle, ChevronRight,
  Calendar, ShoppingBag, ArrowUpRight, User
} from 'lucide-react';
import { API_BASE } from '../../config/api';

export default function SupplierDashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['supplierStats'],
    queryFn: () => axios.get(API_BASE + '/supplier/stats').then(r => r.data)
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['supplierOrders'],
    queryFn: () => axios.get(API_BASE + '/supplier/orders').then(r => r.data)
  });

  const recentOrders = orders.slice(0, 5);

  const computeGrandTotal = (order) => {
    return parseFloat(order?.total_amount || 0);
  };

  const statusColors = {
    Pending:     'bg-amber-100 text-amber-700 border-amber-200',
    'In Progress':'bg-blue-100 text-blue-700 border-blue-200',
    Shipped:     'bg-indigo-100 text-indigo-700 border-indigo-200',
    Delivered:   'bg-emerald-100 text-emerald-700 border-emerald-200',
    Cancelled:   'bg-rose-100 text-rose-700 border-rose-200',
    Received:    'bg-teal-100 text-teal-700 border-teal-200',
  };

  const statCards = [
    { label: 'Total Orders', value: stats?.total ?? '0', icon: Package, iconBg: 'bg-purple-50 text-purple-600 border border-purple-200' },
    { label: 'Pending', value: stats?.pending ?? '0', icon: Clock, iconBg: 'bg-amber-50 text-amber-600 border border-amber-200' },
    { label: 'Shipped', value: stats?.shipped ?? '0', icon: Truck, iconBg: 'bg-violet-50 text-violet-600 border border-violet-200' },
    { label: 'Delivered', value: stats?.delivered ?? '0', icon: CheckCircle, iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-200' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">Supplier Dashboard</h2>
          <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-wider">Streamline your supply chain & logistics</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 px-3 rounded-2xl border-2 border-slate-200/90 shadow-xs">
           <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
             <Calendar size={18} />
           </div>
           <div className="pr-2">
             <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Current Date</p>
             <p className="text-xs font-extrabold text-slate-900 leading-none">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>
      </div>

      {/* Main Stats and Earnings Group */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Card (Light Purple/Violet Theme) */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-gradient-to-br from-purple-50 via-fuchsia-50/70 to-violet-50 rounded-3xl p-7 text-slate-900 border-2 border-purple-200 shadow-xs relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 transform translate-x-4 -translate-y-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-purple-900">
            <IndianRupee size={180} />
          </div>
          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white rounded-2xl flex items-center justify-center mb-5 shadow-md shadow-purple-500/20">
                <TrendingUp size={22} />
              </div>
              <p className="text-purple-900 font-extrabold text-xs uppercase tracking-wider mb-1.5">Total Revenue Earned</p>
              <h3 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight">
                ₹{Number.parseFloat(stats?.totalEarned ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                <span className="text-xl text-slate-500 font-bold">.{Number.parseFloat(stats?.totalEarned ?? 0).toFixed(2).split('.')[1]}</span>
              </h3>
            </div>
            <div className="mt-6 pt-4 border-t border-purple-200/80 flex items-center justify-between">
               <p className="text-xs font-bold text-slate-600">Total Supply Payout</p>
               <div className="flex items-center gap-1 text-purple-800 font-extrabold text-xs bg-purple-100/90 px-2.5 py-1 rounded-lg border border-purple-200">
                 <ArrowUpRight size={14} />
                 <span>ACTIVE</span>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {statCards.map(s => {
            const Icon = s.icon;
            return (
              <motion.div 
                variants={itemVariants}
                key={s.label} 
                className="bg-white rounded-3xl border-2 border-slate-200/90 p-5 hover:border-purple-300 transition-all shadow-xs group relative overflow-hidden"
              >
                <div className={`w-12 h-12 ${s.iconBg} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}>
                  <Icon size={22} />
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-black text-slate-950 tracking-tight mb-0.5">{s.value}</p>
                  <p className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-200/90 overflow-hidden shadow-xs flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag size={16} />
              </div>
              <h3 className="font-extrabold text-slate-950 text-base">Recent Orders</h3>
            </div>
            <button onClick={() => navigate('/supplier/orders')} className="text-xs text-purple-600 font-extrabold hover:text-purple-700 flex items-center gap-1 group">
              View All Orders <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex-1">
            {recentOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic font-bold">
                <Package size={48} className="mb-4 opacity-20 text-slate-400" />
                <p className="text-slate-400 font-bold text-sm">No recent order activity</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map(order => (
                  <div key={order.po_id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                        <p className="font-extrabold text-xs text-slate-600">#{order.po_id}</p>
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 leading-none mb-1 text-sm">Purchase Order #{order.po_id}</p>
                        <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                          <Clock size={11} className="text-slate-400" />
                          {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-5">
                      <div className="text-right hidden sm:block">
                        <p className="font-extrabold text-slate-900 leading-none mb-1">₹{computeGrandTotal(order).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Gross Amount</p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border transition-all ${statusColors[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Access Tiles - Clean Purple Theme */}
        <div className="space-y-3">
          <h3 className="font-extrabold text-slate-900 px-1 uppercase tracking-wider text-xs">Operations Hub</h3>
          <div className="grid grid-cols-1 gap-2.5">
             {[
               { label: 'Orders', desc: 'Accept & manage requests', icon: ClipboardList, path: '/supplier/orders', iconBg: 'bg-purple-50 text-purple-600 border border-purple-200' },
               { label: 'Shipments', desc: 'Real-time delivery tracking', icon: Truck, path: '/supplier/delivery', iconBg: 'bg-violet-50 text-violet-600 border border-violet-200' },
               { label: 'Payments', desc: 'Invoices & payout status', icon: IndianRupee, path: '/supplier/payments', iconBg: 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-200' },
               { label: 'Account', desc: 'Manage your profile data', icon: User, path: '/supplier/profile', iconBg: 'bg-purple-50 text-purple-600 border border-purple-200' },
             ].map(link => {
               const Icon = link.icon;
               return (
                 <motion.button 
                   variants={itemVariants}
                   key={link.path} 
                   onClick={() => navigate(link.path)}
                   className="bg-white group p-4 rounded-2xl border-2 border-slate-200/90 text-left hover:border-purple-300 hover:bg-purple-50/20 hover:shadow-xs transition-all flex items-center gap-3.5"
                 >
                   <div className={`w-10 h-10 rounded-xl ${link.iconBg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                     <Icon size={18} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <p className="font-extrabold text-slate-900 text-sm leading-none mb-1">{link.label}</p>
                     <p className="text-[11px] font-medium text-slate-500 truncate">{link.desc}</p>
                   </div>
                   <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-colors">
                     <ChevronRight size={14} />
                   </div>
                 </motion.button>
               );
             })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
