import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User, ShoppingBag, TrendingUp, CreditCard, Clock, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['employeeStats'],
    queryFn: async () => {
      const { data } = await axios.get(import.meta.env.VITE_API_URL + '/reports/employee-stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return data;
    }
  });

  const isAdmin = user?.role === 'Admin' || stats?.role === 'Admin';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className={clsx("animate-spin rounded-full h-12 w-12 border-b-2", isAdmin ? "border-rose-600" : "border-indigo-500")}></div>
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
      className="max-w-[1500px] w-full mx-auto space-y-8 p-6 xl:p-10"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">Welcome, {stats?.name}!</h2>
          <p className="text-slate-500 font-bold text-xs mt-1 uppercase tracking-wider">Here is your performance snapshot for today.</p>
        </div>
        <Link 
          to="/pos" 
          className={clsx(
            "px-6 py-3 rounded-2xl font-extrabold flex items-center gap-2 transition-all shadow-sm border text-xs uppercase tracking-wider text-white",
            isAdmin ? "bg-rose-600 hover:bg-rose-700 border-rose-500/30" : "bg-blue-600 hover:bg-blue-700 border-blue-500/30"
          )}
        >
          <ShoppingBag size={18} /> Process New Sale
        </Link>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Role Card */}
        <motion.div 
          variants={itemVariants} 
          className={clsx(
            "rounded-3xl p-7 text-slate-900 shadow-xs relative overflow-hidden group border-2",
            isAdmin 
              ? "bg-gradient-to-br from-rose-50/90 via-slate-50 to-red-50/60 border-rose-200/90" 
              : "bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/60 border-blue-200/90"
          )}
        >
          <div className={clsx("absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500", isAdmin ? "text-rose-900" : "text-blue-900")}>
            <User size={140} />
          </div>
          <div className="relative z-10">
            <p className={clsx("text-xs font-extrabold uppercase tracking-wider mb-1.5", isAdmin ? "text-rose-700" : "text-blue-700")}>Current Designation</p>
            <h3 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight mt-1">{stats?.role}</h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className={clsx("text-xs font-extrabold px-2.5 py-1 rounded-lg border", isAdmin ? "text-rose-900 bg-rose-100/90 border-rose-200" : "text-blue-900 bg-blue-100/90 border-blue-200")}>ACTIVE SESSION</span>
            </div>
          </div>
        </motion.div>

        {/* Transactions Card */}
        <motion.div 
          variants={itemVariants} 
          className={clsx(
            "rounded-3xl p-7 text-slate-900 shadow-xs relative overflow-hidden group border-2",
            isAdmin 
              ? "bg-gradient-to-br from-red-50/80 via-rose-50/60 to-slate-50 border-rose-200/90" 
              : "bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-slate-50 border-blue-200/90"
          )}
        >
          <div className={clsx("absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500", isAdmin ? "text-rose-900" : "text-blue-900")}>
            <TrendingUp size={140} />
          </div>
          <div className="relative z-10">
            <p className={clsx("text-xs font-extrabold uppercase tracking-wider mb-1.5", isAdmin ? "text-rose-800" : "text-blue-800")}>Lifetime Sales Activity</p>
            <h3 className="text-5xl font-black text-slate-950 tracking-tight mt-1">{stats?.transactionCount}</h3>
            <p className="mt-4 text-slate-600 font-bold text-xs uppercase tracking-wider">Total Transactions Processed</p>
          </div>
        </motion.div>

        {/* Value Card */}
        <motion.div 
          variants={itemVariants} 
          className={clsx(
            "rounded-3xl p-7 text-slate-900 shadow-xs relative overflow-hidden group border-2",
            isAdmin 
              ? "bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-slate-50 border-rose-200/90" 
              : "bg-gradient-to-br from-blue-50/70 via-teal-50/40 to-slate-50 border-blue-200/90"
          )}
        >
          <div className={clsx("absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform duration-500", isAdmin ? "text-rose-900" : "text-blue-900")}>
            <CreditCard size={140} />
          </div>
          <div className="relative z-10">
            <p className={clsx("text-xs font-extrabold uppercase tracking-wider mb-1.5", isAdmin ? "text-rose-800" : "text-blue-800")}>Revenue Contribution</p>
            <h3 className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight mt-1">₹{Number(stats?.totalSalesValue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            <div className="mt-6">
              <span className={clsx("px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wider border", isAdmin ? "text-rose-900 bg-rose-100/90 border-rose-200" : "text-blue-900 bg-blue-100/90 border-blue-200")}>Total Sales Value</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity List */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white border-2 border-slate-200/90 rounded-3xl p-7 shadow-xs">
           <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-extrabold text-slate-950 flex items-center gap-2.5">
               <div className={clsx("w-8 h-8 rounded-xl border flex items-center justify-center", isAdmin ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-blue-50 text-blue-600 border-blue-200")}>
                 <Clock size={16} />
               </div>
               Recent Activity Log
             </h3>
             <Link to="/admin/sales" className={clsx("text-xs font-extrabold uppercase tracking-wider flex items-center gap-1 group", isAdmin ? "text-rose-600 hover:text-rose-700" : "text-blue-600 hover:text-blue-700")}>
               View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </Link>
           </div>
           
           <div className="space-y-3">
             {stats?.recentTransactions?.map(tx => (
               <div key={tx.transaction_id} className={clsx("flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80 transition-all group", isAdmin ? "hover:border-rose-300 hover:bg-rose-50/30" : "hover:border-blue-300 hover:bg-blue-50/30")}>
                 <div className="flex items-center gap-3.5">
                   <div className={clsx("w-10 h-10 rounded-xl border flex items-center justify-center font-extrabold text-xs", isAdmin ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-blue-50 text-blue-700 border-blue-200")}>
                      #{String(tx.transaction_id).padStart(2, '0')}
                   </div>
                   <div>
                     <p className="font-extrabold text-slate-900 text-sm">Transaction Processed</p>
                     <p className="text-xs font-bold text-slate-500 mt-0.5">{new Date(tx.transaction_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                   </div>
                 </div>
                 <div className="text-right">
                   <p className="font-black text-slate-950 text-base">₹{Number(tx.grand_total).toFixed(2)}</p>
                   <span className={clsx("text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border", isAdmin ? "text-rose-800 bg-rose-100 border-rose-200" : "text-blue-800 bg-blue-100 border-blue-200")}>Settled</span>
                 </div>
               </div>
             ))}
             {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
               <div className="py-12 text-center text-slate-400">
                 <p className="font-bold text-sm">No transactions processed yet.</p>
                 <Link to="/pos" className={clsx("font-extrabold text-xs hover:underline mt-2 block", isAdmin ? "text-rose-600" : "text-blue-600")}>Start your first sale</Link>
               </div>
             )}
           </div>
        </motion.div>

        {/* Quick Tips / Design Filler */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6">
          <div className={clsx("border-2 rounded-3xl p-7 text-slate-900 shadow-xs relative overflow-hidden", isAdmin ? "bg-gradient-to-br from-rose-50/90 via-slate-50 to-red-50/40 border-rose-200" : "bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/40 border-blue-200")}>
             <h4 className="text-base font-extrabold text-slate-950 mb-3 leading-tight">Professional Performance Insight</h4>
             <p className="text-xs text-slate-600 font-bold leading-relaxed">
               Your transaction accuracy is currently at <span className="text-emerald-700 font-extrabold">{stats?.accuracyRate}%</span>. 
               {stats?.accuracyRate >= 95 ? " Maintaining this high standard ensures a seamless inventory audit process." : " We recommend double-checking payment confirmations to improve your accuracy rating."}
             </p>
             <div className={clsx("mt-6 pt-6 border-t", isAdmin ? "border-rose-200/80" : "border-blue-200/80")}>
                <div className="flex justify-between items-end mb-2">
                  <p className={clsx("text-[10px] font-extrabold uppercase tracking-wider", isAdmin ? "text-rose-800" : "text-blue-800")}>Shift Progress</p>
                  <p className="text-[10px] font-extrabold text-slate-900 uppercase tracking-wider">
                    {stats?.transactionsToday} / {stats?.dailyTarget} Transactions
                  </p>
                </div>
                <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((stats?.transactionsToday / stats?.dailyTarget) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={clsx("h-full rounded-full", isAdmin ? "bg-rose-600" : "bg-blue-600")}
                   ></motion.div>
                </div>
                {stats?.transactionsToday >= stats?.dailyTarget && (
                  <p className="text-[10px] font-extrabold text-emerald-700 mt-2 uppercase tracking-wider">🔥 Daily Target Achieved!</p>
                )}
             </div>
          </div>
          
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 shadow-xs">
             <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Quick Links</h4>
             <div className="grid grid-cols-1 gap-2.5">
                <Link to="/pos" className={clsx("p-3 bg-slate-50 rounded-xl font-extrabold text-xs text-slate-800 border border-slate-200/80 transition-colors flex items-center gap-2", isAdmin ? "hover:bg-rose-50 hover:text-rose-700" : "hover:bg-blue-50 hover:text-blue-700")}>🚀 Launch Terminal</Link>
                <Link to="/customers" className={clsx("p-3 bg-slate-50 rounded-xl font-extrabold text-xs text-slate-800 border border-slate-200/80 transition-colors flex items-center gap-2", isAdmin ? "hover:bg-rose-50 hover:text-rose-700" : "hover:bg-blue-50 hover:text-blue-700")}>👥 Customer CRM</Link>
                <Link to="/employee/profile" className={clsx("p-3 bg-slate-50 rounded-xl font-extrabold text-xs text-slate-800 border border-slate-200/80 transition-colors flex items-center gap-2", isAdmin ? "hover:bg-rose-50 hover:text-rose-700" : "hover:bg-blue-50 hover:text-blue-700")}>⚙️ Account Settings</Link>
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
