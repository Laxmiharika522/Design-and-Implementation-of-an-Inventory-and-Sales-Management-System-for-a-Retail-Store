import { useState, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Receipt, Search, Calendar, User, ShoppingBag, 
  ChevronRight, ChevronDown, Filter, Download,
  ExternalLink, CreditCard, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function SalesTransaction() {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
  const [customerIdFilter, setCustomerIdFilter] = useState(location.state?.customerId || null);
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [paymentFilter, setPaymentFilter] = useState('All Payments');
  const [expandedId, setExpandedId] = useState(null);
  const navigate = useNavigate();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ['detailedSales'],
    queryFn: async () => {
      const { data } = await axios.get('/reports/detailed-sales');
      return data.sales; // Align with controller's "sales" key
    },
    staleTime: 0,
    refetchOnMount: 'always'
  });

  const filteredTransactions = transactions?.filter(t => {
    // If we navigated directly from the CRM, strict filter by that specific customer ID
    if (customerIdFilter) {
      if (!t.customer?.id || parseInt(t.customer.id) !== parseInt(customerIdFilter)) {
        return false;
      }
    }

    const matchesSearch = (t.transaction_id?.toString() || '').includes(searchTerm || '') ||
      (t.employee?.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (t.customer?.name || 'Guest').toLowerCase().includes((searchTerm || '').toLowerCase());
      
    let matchesDate = true;
    const txnDate = new Date(t.transaction_date || Date.now());
    const today = new Date();
    if (dateFilter === 'Today') {
      matchesDate = txnDate.toDateString() === today.toDateString();
    } else if (dateFilter === 'This Week') {
      const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
      matchesDate = txnDate >= firstDayOfWeek;
    } else if (dateFilter === 'This Month') {
      matchesDate = txnDate.getMonth() === today.getMonth() && txnDate.getFullYear() === today.getFullYear();
    }

    let matchesPayment = true;
    if (paymentFilter !== 'All Payments') {
       matchesPayment = (t.payment_method || '').toLowerCase() === paymentFilter.toLowerCase();
    }
    return matchesSearch && matchesDate && matchesPayment;
  })?.sort((a, b) => (b.transaction_id || 0) - (a.transaction_id || 0)) || [];

  const handleExportCSV = () => {
    if (!filteredTransactions || filteredTransactions.length === 0) return;
    
    // Create CSV header
    const headers = ['ID', 'Date', 'Salesperson', 'Customer', 'Items', 'Subtotal', 'Tax Aggregate', 'Processing Fee', 'Grand Total'];
    
    // Create CSV rows
    const rows = filteredTransactions.map(t => [
      t.transaction_id,
      `"${new Date(t.transaction_date).toLocaleString()}"`,
      `"${t.employee?.name || 'System'}"`,
      `"${t.customer?.name || 'Guest'}"`,
      t.items?.length || 0,
      t.subtotal.toFixed(2),
      t.tax_amount.toFixed(2),
      t.processing_fee.toFixed(2),
      t.grand_total.toFixed(2)
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
        
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading transaction history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Sales Transactions</h1>
          <p className="text-slate-500 text-sm mt-1">View and manage all processed store transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/pos')}
            className="btn btn-primary px-4 py-2 text-sm flex items-center gap-2 group transition-all"
          >
            <ShoppingBag size={16} className="group-hover:scale-110 transition-transform" />
            Process New Sale
          </button>
          <button onClick={handleExportCSV} className="btn bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm flex items-center gap-2">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by ID, salesperson, or customer..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-base pl-10 h-11"
          />
        </div>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="input-base pl-10 h-11 appearance-none"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option>All Dates</option>
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="input-base pl-10 h-11 appearance-none"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option>All Payments</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Debit Card</option>
            <option>Credit Card</option>
          </select>
        </div>
      </div>

      {customerIdFilter && (
        <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600">
              <User size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-1">Filtered by CRM Customer</p>
              <p className="font-bold text-slate-900 dark:text-white">Showing transactions for {filteredTransactions?.[0]?.customer?.name || 'Selected Customer'}</p>
            </div>
          </div>
          <button 
            onClick={() => setCustomerIdFilter(null)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-colors"
          >
            <X size={14} /> Clear Filter
          </button>
        </div>
      )}

      {/* Transactions Table */}
      <div className="card overflow-hidden border-none shadow-sm bg-white dark:bg-slate-800/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b dark:border-slate-700/50">
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 w-12 text-center">ID</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Date & Time</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Salesperson</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Customer</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500">Items</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 text-right">Amount</th>
                <th className="p-4 text-xs font-black uppercase tracking-wider text-slate-500 w-12 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-700/50">
              {filteredTransactions?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <ShoppingBag size={48} className="mb-4" />
                      <p className="font-bold">No transactions found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions?.map(txn => (
                <Fragment key={txn.transaction_id}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === txn.transaction_id ? null : txn.transaction_id)}
                    className={clsx(
                      "group hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer",
                      expandedId === txn.transaction_id && "bg-blue-50/30 dark:bg-blue-900/10"
                    )}
                  >
                    <td className="p-4 font-mono text-sm text-slate-400 text-center">#{String(txn.transaction_id || 0).padStart(4, '0')}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          {new Date(txn.transaction_date || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(txn.transaction_date || Date.now()).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300">
                          {txn.employee?.name?.charAt(0) || <User size={12}/>}
                        </div>
                        <span className="text-sm font-semibold">{txn.employee?.name || 'System'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{txn.customer?.name || 'Guest Customer'}</span>
                        {txn.is_online && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Online</span>}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 border dark:border-slate-700">
                        {txn.items?.length || 0} items
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                      ₹{Number(txn.grand_total || 0).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-all">
                        {expandedId === txn.transaction_id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                      </div>
                    </td>
                  </tr>
                  
                  <AnimatePresence>
                    {expandedId === txn.transaction_id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan="7" className="p-0 border-none">
                          <div className="px-12 py-6 bg-slate-50/50 dark:bg-slate-900/30 border-y dark:border-slate-700/50 shadow-inner">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              {/* Left: Items List */}
                              <div>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center gap-2">
                                  <Receipt size={14} className="text-blue-500" /> Transaction Item List
                                </h4>
                                <div className="space-y-2">
                                  {txn.items?.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border dark:border-slate-700 shadow-sm">
                                      <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tighter">{item?.product_name || 'Unknown'}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] text-slate-500 font-bold">{item?.quantity || 0} × ₹{Number(item?.unit_price || 0).toFixed(2)}</span>
                                          <span className="text-[10px] bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded font-black">GST ₹{Number(item?.tax_amount || 0).toFixed(2)}</span>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-black text-slate-900 dark:text-white">₹{Number(item?.line_total || 0).toFixed(2)}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Right: Summary Card */}
                              <div className="flex flex-col gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border dark:border-slate-700 shadow-lg relative overflow-hidden">
                                  <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                    <CreditCard size={140} />
                                  </div>
                                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Tax & Fee Summary</h4>
                                  <div className="space-y-3">
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                      <span>Original Subtotal</span>
                                      <span className="text-slate-900 dark:text-white">₹{Number(txn.subtotal || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                      <span>GST Tax Aggregate</span>
                                      <span className="text-blue-600">₹{Number(txn.tax_amount || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-500">
                                      <span>Payment Processing Fee</span>
                                      <span className="text-slate-900 dark:text-white">₹{Number(txn.processing_fee || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-4 border-t dark:border-slate-700 flex justify-between items-end">
                                      <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Total Recorded Paid</p>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white leading-tight">₹{Number(txn.grand_total || 0).toFixed(2)}</p>
                                      </div>
                                      <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] text-blue-600 hover:text-blue-700 transition-all translate-y-[-4px]">
                                        Print Invoice <ExternalLink size={12} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {txn.customer && (
                                  <div className="bg-slate-100 dark:bg-slate-800/80 p-4 rounded-xl border dark:border-slate-700 flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white dark:bg-slate-900 shadow-sm rounded-full flex items-center justify-center text-slate-400">
                                      <User size={20} />
                                    </div>
                                    <div>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Authenticated Customer</p>
                                      <p className="font-bold text-sm text-slate-900 dark:text-white leading-none">{txn.customer.name}</p>
                                      <p className="text-[10px] text-slate-500 mt-1 font-medium">{txn.customer.email}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Placeholder */}
        <div className="p-4 border-t dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/80 flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">History Log • {filteredTransactions?.length || 0} Transactions</p>
          <div className="flex gap-2 text-bold">
            <button disabled className="px-3 py-1 bg-white border dark:bg-slate-700 dark:border-slate-600 rounded text-[10px] font-black uppercase text-slate-300">Previous</button>
            <button disabled className="px-3 py-1 bg-white border dark:bg-slate-700 dark:border-slate-600 rounded text-[10px] font-black uppercase text-slate-300">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
