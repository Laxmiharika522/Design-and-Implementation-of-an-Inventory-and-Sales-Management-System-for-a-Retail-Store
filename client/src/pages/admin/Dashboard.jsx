import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { TrendingUp, ShoppingCart, AlertTriangle, Activity, CreditCard, X, Calendar, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const [activeModal, setActiveModal] = useState(null); // 'lowStock' | 'expiry' | 'expired' | null
  const [period, setPeriod] = useState('this_month');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats', period],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/reports/dashboard?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const totalRev = Number(stats?.totalRevenue || 0);
  const dailySales = Number(stats?.dailySalesCount || 0);
  const lowStock = Number(stats?.lowStockCount || 0);

  const lineChartData = {
    labels: stats?.monthlySales?.length > 0 ? stats.monthlySales.map(s => new Date(s.month).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })) : ['No Data'],
    datasets: [
      {
        label: 'Daily Revenue (₹)',
        data: stats?.monthlySales?.length > 0 ? stats.monthlySales.map(s => Number(s.total)) : [0],
        borderColor: '#4f46e5',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)');
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0.01)');
          return gradient;
        },
        borderWidth: 4,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#4f46e5',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 16,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 16, weight: '900' },
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { weight: 'bold' }, color: '#64748b' } },
      y: { grid: { color: 'rgba(100, 116, 139, 0.1)' }, ticks: { font: { weight: 'bold' }, color: '#64748b', callback: (v) => `₹${v}` } }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 20 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="p-2 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase italic">Inventory Pro</h2>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs opacity-80">Full Control • Real-time Insights • Growth Engine</p>
        </div>

        {/* Notification Symbols */}
        <div className="flex items-center gap-4 text-white">
          {stats?.lowStockCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModal('lowStock')}
              className="group relative flex items-center gap-2 bg-rose-500 px-4 py-2 rounded-2xl shadow-lg shadow-rose-500/20"
            >
              <AlertTriangle size={18} className="animate-bounce" />
              <span className="text-xs font-black uppercase tracking-tighter">{stats.lowStockCount} LOW STOCK</span>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-[10px] p-2 rounded-lg whitespace-nowrap z-50">Click to view items</div>
            </motion.button>
          )}

          {stats?.expiringSoonCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModal('expiry')}
              className="group relative flex items-center gap-2 bg-amber-500 px-4 py-2 rounded-2xl shadow-lg shadow-amber-500/20"
            >
              <Activity size={18} className="animate-pulse" />
              <span className="text-xs font-black uppercase tracking-tighter">{stats.expiringSoonCount} EXPIRY SOON</span>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-[10px] p-2 rounded-lg whitespace-nowrap z-50">Click to view items</div>
            </motion.button>
          )}

          {stats?.expiredCount > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setActiveModal('expired')}
              className="group relative flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-2xl shadow-lg shadow-slate-900/20 border border-slate-700"
            >
              <X size={18} className="text-rose-500" />
              <span className="text-xs font-black uppercase tracking-tighter text-white">{stats.expiredCount} EXPIRED</span>
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-900 text-[10px] p-2 rounded-lg whitespace-nowrap z-50">Immediate removal required</div>
            </motion.button>
          )}
        </div>
      </div>

      {/* KPI Cards Redesign */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Total Revenue */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/30">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
            <TrendingUp size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-black uppercase tracking-[0.25em] mb-4 opacity-80">Store Net Revenue</p>
            <h3 className="text-4xl font-black tracking-tighter">₹{totalRev.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg font-black uppercase tracking-widest">Gross Profitability</span>
            </div>
          </div>
        </motion.div>

        {/* Daily Sales */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-amber-500 via-orange-600 to-amber-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-orange-500/30">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
            <ShoppingCart size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-amber-100 text-xs font-black uppercase tracking-[0.25em] mb-4 opacity-80">Today's Transactions</p>
            <h3 className="text-5xl font-black tracking-tighter">{dailySales}</h3>
            <div className="mt-6 flex items-center gap-2">
              <span className="text-[10px] bg-white/20 px-2 py-1 rounded-lg font-black uppercase tracking-widest">Order Frequency: High</span>
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-rose-500 via-red-600 to-rose-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-red-500/30">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700">
            <AlertTriangle size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-rose-100 text-xs font-black uppercase tracking-[0.25em] mb-4 opacity-80">Critical Monitoring</p>
            <h3 className="text-5xl font-black tracking-tighter">{lowStock}</h3>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-white/80">Low Stock Alerts</p>
          </div>
        </motion.div>

        {/* Expiry Monitoring */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group border border-slate-700/50 shadow-2xl">
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-700">
            <Activity size={100} />
          </div>
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.25em] mb-4">Expiry Monitoring</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-5xl font-black tracking-tighter">{stats?.expiringSoonCount || 0}</h3>
              <div className={`w-2.5 h-2.5 rounded-full ${stats?.expiringSoonCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
            </div>
            <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-amber-400">Expiring within 30 days</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] scale-150 rotate-12">
            <Activity size={300} />
          </div>
           <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic">Revenue Velocity</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {period === 'this_month' ? 'Current Month Financial Overview' : 'Last Month Performance Review'}
              </p>
            </div>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
          </div>
          <div className="h-[350px] w-full relative z-10">
            <Line options={lineOptions} data={lineChartData} />
          </div>
        </motion.div>

        {/* Action Center - Transactions & Alerts */}
        <div className="flex flex-col gap-8">
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 flex-1 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Live Feed</h3>
              <span className="text-[10px] font-black bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full uppercase tracking-tighter">Recent Txns</span>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {stats?.recentTransactions?.map(tx => (
                <div key={tx.transaction_id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-indigo-600 text-xs">
                      {String(tx.transaction_id).slice(-2)}
                    </div>
                    <div>
                      <p className="font-black text-sm text-slate-900 dark:text-white leading-none">ORDER #{tx.transaction_id}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{new Date(tx.transaction_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                  <p className="font-black text-indigo-600">₹{Number(tx.grand_total).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900 border border-rose-100 dark:border-rose-900/30 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-rose-600 uppercase italic">Stock Depletion</h3>
              <AlertTriangle size={20} className="text-rose-500 animate-pulse" />
            </div>
            <div className="space-y-3">
              {stats?.lowStockItems?.slice(0, 3).map(item => (
                <div key={item.inventory_id} className="flex items-center justify-between p-4 bg-white/60 dark:bg-black/20 rounded-2xl border border-rose-100/50 dark:border-rose-900/10">
                  <p className="font-bold text-sm text-slate-700 dark:text-slate-200 truncate pr-4">{item.Product?.product_name}</p>
                  <span className="text-[10px] font-black text-rose-600 bg-rose-100 dark:bg-rose-950 px-2 py-1 rounded-lg shrink-0 uppercase tracking-tighter italic">{item.current_stock} Units</span>
                </div>
              ))}
              <Link to="/inventory" className="w-full py-4 mt-2 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all text-center block shadow-lg shadow-rose-500/20">
                Resolve Stock Issues
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Alert Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            ></motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className={`p-8 flex items-center justify-between shadow-lg ${activeModal === 'lowStock' ? 'bg-rose-500' :
                  activeModal === 'expiry' ? 'bg-amber-500' : 'bg-slate-900'
                } text-white`}>
                <div className="flex items-center gap-4">
                  {activeModal === 'lowStock' ? <Package size={32} /> :
                    activeModal === 'expiry' ? <Calendar size={32} /> : <X size={32} className="text-rose-500" />}
                  <div>
                    <h3 className="text-2xl font-black uppercase italic">
                      {activeModal === 'lowStock' ? 'Low Stock Inventory' :
                        activeModal === 'expiry' ? 'Upcoming Expirations' : 'Critical: Expired Stock'}
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">
                      {activeModal === 'lowStock' ? `${stats.lowStockCount} items requiring replenishment` :
                        activeModal === 'expiry' ? `${stats.expiringSoonCount} products expiring within 30 days` :
                          `${stats.expiredCount} products past their shelf life`}
                    </p>
                  </div>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/40">
                <div className="grid grid-cols-1 gap-4">
                  {(activeModal === 'lowStock' ? stats.lowStockItems :
                    activeModal === 'expiry' ? stats.expiringSoonItems : stats.expiredItems)?.map((item, idx) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                        key={item.inventory_id}
                        className="flex items-center justify-between p-5 bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${activeModal === 'lowStock' ? 'bg-rose-100 text-rose-600' :
                              activeModal === 'expiry' ? 'bg-amber-100 text-amber-600' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight antialiased">{item.Product?.product_name || `Product #${item.product_id}`}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">WH-REGION: {item.warehouse_id}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-black text-lg p-0 m-0 ${activeModal === 'lowStock' ? 'text-rose-600' :
                              activeModal === 'expiry' ? 'text-amber-600' : 'text-rose-600'
                            }`}>
                            {activeModal === 'lowStock' ? `${item.current_stock} Units` : new Date(item.expiry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">
                            {activeModal === 'lowStock' ? 'Current Level' : activeModal === 'expiry' ? 'Expiry Date' : 'Expired On'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              <div className="p-8 bg-white dark:bg-slate-800/30 border-t dark:border-slate-800 flex justify-end gap-4">
                <button onClick={() => setActiveModal(null)} className="px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">Close</button>
                <Link
                  to={activeModal === 'lowStock' ? "/inventory" : "/products"}
                  onClick={() => setActiveModal(null)}
                  className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-95 ${activeModal === 'lowStock' ? 'bg-rose-600 shadow-rose-500/20 hover:bg-rose-700' :
                      activeModal === 'expiry' ? 'bg-amber-600 shadow-amber-500/20 hover:bg-amber-700' : 'bg-slate-900 shadow-slate-900/20 hover:bg-black'
                    }`}
                >
                  {activeModal === 'lowStock' ? 'Manage Inventory' : 'Manage Products'}
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
