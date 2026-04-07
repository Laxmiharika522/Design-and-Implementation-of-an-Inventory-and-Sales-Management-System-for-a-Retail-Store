import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  Package, Clock, Truck, CheckCircle, TrendingUp,
  ClipboardList, IndianRupee, XCircle, ChevronRight,
  Calendar, ShoppingBag, ArrowUpRight, User
} from 'lucide-react';

export default function SupplierDashboard() {
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['supplierStats'],
    queryFn: () => axios.get('http://localhost:5000/api/supplier/stats').then(r => r.data)
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['supplierOrders'],
    queryFn: () => axios.get('http://localhost:5000/api/supplier/orders').then(r => r.data)
  });

  const recentOrders = orders.slice(0, 5);

  const computeGrandTotal = (order) => {
    if (!order?.PurchaseOrderDetails || order.PurchaseOrderDetails.length === 0) {
      return parseFloat(order?.total_amount || 0);
    }

    return order.PurchaseOrderDetails.reduce((sum, d) => {
      const qty = d.quantity_ordered || 0;
      const unitPrice = parseFloat(d.Product?.unit_price || 0);
      const baseTotal = unitPrice * qty;
      const catName = d.Product?.Category?.category_name || '';

      let gstRate = 0.05;
      if (['Fruits & Vegetables'].includes(catName)) gstRate = 0.00;
      else if (['Dairy Products', 'Bakery & Bread', 'Grocery & Staples'].includes(catName)) gstRate = 0.05;
      else if (['Beverages', 'Snacks & Packaged Foods'].includes(catName)) gstRate = 0.12;
      else if (['Personal Care', 'Household & Cleaning', 'Health & Wellness', 'Baby & Kids Products'].includes(catName)) gstRate = 0.18;

      return sum + (baseTotal + (baseTotal * gstRate));
    }, 0);
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
    { label: 'Total Orders', value: stats?.total ?? '0', icon: Package, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
    { label: 'Pending', value: stats?.pending ?? '0', icon: Clock, color: 'from-amber-500 to-amber-600', shadow: 'shadow-amber-500/20' },
    { label: 'Shipped', value: stats?.shipped ?? '0', icon: Truck, color: 'from-indigo-500 to-indigo-600', shadow: 'shadow-indigo-500/20' },
    { label: 'Delivered', value: stats?.delivered ?? '0', icon: CheckCircle, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
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
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Supplier Dashboard</h2>
          <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-wider italic">Streamline your supply chain & logistics</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
           <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
             <Calendar size={20} />
           </div>
           <div className="pr-4">
             <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Current Date</p>
             <p className="text-sm font-black text-slate-700 leading-none">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
           </div>
        </div>
      </div>

      {/* Main Stats and Earnings Group */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Earnings Card */}
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-purple-500/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 transform translate-x-4 -translate-y-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
            <IndianRupee size={200} />
          </div>
          <div className="relative z-10 w-full h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                <TrendingUp size={24} className="text-white" />
              </div>
              <p className="text-purple-100 font-black text-xs uppercase tracking-[0.2em] mb-2">Total Revenue Earned</p>
              <h3 className="text-5xl font-black tracking-tighter">
                ₹{Number.parseFloat(stats?.totalEarned ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                <span className="text-2xl opacity-60">.{Number.parseFloat(stats?.totalEarned ?? 0).toFixed(2).split('.')[1]}</span>
              </h3>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
               <p className="text-xs font-bold text-purple-100/70 italic">Calculated with GST tiers</p>
               <div className="flex items-center gap-1 text-emerald-300 font-black text-xs bg-emerald-500/20 px-2 py-1 rounded-lg">
                 <ArrowUpRight size={14} />
                 <span>GROWING</span>
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
                className="bg-white rounded-[2rem] border border-slate-200 p-6 hover:shadow-xl hover:border-purple-200 transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${s.color} opacity-[0.03] rounded-bl-[4rem]`}></div>
                <div className={`w-14 h-14 bg-gradient-to-br ${s.color} ${s.shadow} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} className="text-white" />
                </div>
                <div className="relative z-10">
                  <p className="text-4xl font-black text-slate-900 tracking-tight mb-1">{s.value}</p>
                  <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Recent Orders</h3>
            </div>
            <button onClick={() => navigate('/supplier/orders')} className="text-xs text-blue-600 font-black uppercase tracking-widest hover:text-blue-700 flex items-center gap-1 group">
              View All Orders <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex-1">
            {recentOrders.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic font-bold">
                <Package size={48} className="mb-4 opacity-20" />
                <p>No recent order activity</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {recentOrders.map(order => (
                  <div key={order.po_id} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                        <p className="font-black text-xs text-slate-500 group-hover:text-purple-600">#{order.po_id}</p>
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-none mb-1 text-sm uppercase">Purchase Order</p>
                        <p className="text-[11px] font-bold text-slate-400 capitalize flex items-center gap-1">
                          <Clock size={10} />
                          {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="font-black text-slate-900 leading-none mb-1">₹{computeGrandTotal(order).toLocaleString('en-IN', { minimumFractionDigits: 0 })}</p>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tighter">Gross Amount</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusColors[order.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Access Tiles - Redesigned as bold tiles */}
        <div className="space-y-4">
          <h3 className="font-black text-slate-900 px-2 uppercase tracking-widest text-sm italic">Operations Hub</h3>
          <div className="grid grid-cols-1 gap-3">
             {[
               { label: 'Orders', desc: 'Accept & manage requests', icon: ClipboardList, path: '/supplier/orders', color: 'from-blue-500 to-blue-600' },
               { label: 'Shipments', desc: 'Real-time delivery tracking', icon: Truck, path: '/supplier/delivery', color: 'from-purple-500 to-purple-600' },
               { label: 'Payments', desc: 'Invoices & payout status', icon: IndianRupee, path: '/supplier/payments', color: 'from-emerald-500 to-emerald-600' },
               { label: 'Account', desc: 'Manage your profile data', icon: User, path: '/supplier/profile', color: 'from-slate-700 to-slate-800' },
             ].map(link => {
               const Icon = link.icon;
               return (
                 <motion.button 
                   variants={itemVariants}
                   key={link.path} 
                   onClick={() => navigate(link.path)}
                   className="bg-white group p-5 rounded-3xl border border-slate-200 text-left hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/10 transition-all flex items-center gap-4"
                 >
                   <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                     <Icon size={20} className="text-white" />
                   </div>
                   <div className="flex-1">
                     <p className="font-black text-slate-900 text-sm leading-none mb-1 uppercase tracking-tight">{link.label}</p>
                     <p className="text-[11px] font-bold text-slate-400 line-clamp-1 italic">{link.desc}</p>
                   </div>
                   <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors">
                     <ChevronRight size={16} />
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
