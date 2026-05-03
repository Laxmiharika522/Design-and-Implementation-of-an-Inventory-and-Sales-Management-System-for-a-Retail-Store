import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User, ShoppingBag, TrendingUp, CreditCard, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['employeeStats'],
    queryFn: async () => {
      const { data } = await axios.get(import.meta.env.VITE_API_URL + '/reports/employee-stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants} 
      initial="hidden" 
      animate="show" 
      className="max-w-[1500px] w-full mx-auto space-y-10 p-6 xl:p-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Welcome, {stats?.name}!</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Here is your performance snapshot for today.</p>
        </div>
        <Link to="/pos" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-95 text-sm uppercase tracking-wider">
          <ShoppingBag size={18} /> Process New Sale
        </Link>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role Card */}
        <motion.div variants={itemVariants} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">
            <User size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-400 text-xs font-black uppercase tracking-[0.2em] mb-2">Current Designation</p>
            <h3 className="text-5xl font-black tracking-tighter mt-2">{stats?.role}</h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Session</span>
            </div>
          </div>
        </motion.div>

        {/* Transactions Card */}
        <motion.div variants={itemVariants} className="bg-indigo-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
            <TrendingUp size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-200 text-xs font-black uppercase tracking-[0.2em] mb-2">Lifetime Sales Activity</p>
            <h3 className="text-6xl font-black tracking-tighter mt-2">{stats?.transactionCount}</h3>
            <p className="mt-2 text-indigo-100 font-bold opacity-80 uppercase text-[10px] tracking-widest">Total Transactions Processed</p>
          </div>
        </motion.div>

        {/* Value Card */}
        <motion.div variants={itemVariants} className="bg-emerald-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">
            <CreditCard size={120} />
          </div>
          <div className="relative z-10">
            <p className="text-emerald-100 text-xs font-black uppercase tracking-[0.2em] mb-2">Revenue Contribution</p>
            <h3 className="text-5xl font-black tracking-tighter mt-2">₹{Number(stats?.totalSalesValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            <p className="mt-2 text-emerald-500 bg-white/10 self-start px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">Total Sales Value</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
           <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
               <Clock className="text-indigo-500" /> Recent Activity Log
             </h3>
             <Link to="/admin/sales" className="text-xs font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-1 group">
               View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </Link>
           </div>
           
           <div className="space-y-4">
             {stats?.recentTransactions?.map(tx => (
               <div key={tx.transaction_id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-500/30 transition-all group">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-indigo-600 group-hover:scale-110 transition-transform">
                      {String(tx.transaction_id).padStart(2, '0')}
                   </div>
                   <div>
                     <p className="font-black text-slate-900 dark:text-white">Transaction Updated</p>
                     <p className="text-xs font-bold text-slate-500 mt-0.5">{new Date(tx.transaction_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-lg text-slate-900 dark:text-white">₹{Number(tx.grand_total).toFixed(2)}</p>
                   <span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">Settled</span>
                 </div>
               </div>
             ))}
             {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
               <div className="py-12 text-center text-slate-400">
                 <p className="font-bold">No transactions processed yet.</p>
                 <Link to="/pos" className="text-indigo-500 hover:underline text-sm mt-2 block">Start your first sale</Link>
               </div>
             )}
           </div>
        </motion.div>

        {/* Quick Tips / Design Filler */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 text-white flex-1 relative overflow-hidden">
             <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/5 rounded-full blur-3xl"></div>
             <h4 className="text-lg font-black mb-4 leading-tight">Professional Performance Insight</h4>
             <p className="text-sm text-slate-400 font-bold leading-relaxed">
               Your transaction accuracy is currently at <span className="text-emerald-400">{stats?.accuracyRate}%</span>. 
               {stats?.accuracyRate >= 95 ? " Maintaining this high standard ensures a seamless inventory audit process." : " We recommend double-checking payment confirmations to improve your accuracy rating."}
             </p>
             <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Shift Progress</p>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest">
                    {stats?.transactionsToday} / {stats?.dailyTarget} Transactions
                  </p>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats?.transactionsToday / stats?.dailyTarget) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-indigo-500 rounded-full"
                   ></motion.div>
                </div>
                {stats?.transactionsToday >= stats?.dailyTarget && (
                  <p className="text-[9px] font-black text-emerald-400 mt-2 uppercase tracking-tighter animate-pulse">🔥 Daily Target Achieved!</p>
                )}
             </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
             <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Quick Links</h4>
             <div className="grid grid-cols-1 gap-3">
                <Link to="/pos" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">🚀 Launch Terminal</Link>
                <Link to="/customers" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">👥 Customer CRM</Link>
                <Link to="/admin/profile" className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors">⚙️ Account Settings</Link>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
