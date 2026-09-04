import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  TrendingUp, 
  ShoppingBag, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Globe,
  CreditCard,
  Search,
  Filter,
  Receipt,
  IndianRupee,
  FileText
} from 'lucide-react';
import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Reports() {
  const [expandedRow, setExpandedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState('All'); // 'All' | 'POS' | 'Online'

  const { data, isLoading } = useQuery({
    queryKey: ['adminReportsSales'],
    queryFn: async () => {
      const { data } = await axios.get('/reports/detailed-sales');
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-medium">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mb-2"></div>
        <span className="text-xs font-semibold">Loading sales analytics...</span>
      </div>
    );
  }

  const { sales = [], totalStoreEarnings = 0 } = data || {};

  // Filter sales list based on search and channel tab
  const filteredSales = sales.filter(sale => {
    const txnIdStr = sale.transaction_id.toString().padStart(6, '0');
    const nameStr = (sale.is_online ? sale.customer?.name : sale.employee?.name) || '';
    const matchesSearch = txnIdStr.includes(searchTerm) || nameStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    if (channelFilter === 'POS') return !sale.is_online;
    if (channelFilter === 'Online') return sale.is_online;
    return true;
  });

  const totalTransactionsCount = filteredSales.length;

  return (
    <div className="space-y-5 pb-8 max-w-7xl mx-auto">
      {/* Top Header & Revenue Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Title Block */}
        <div className="md:col-span-2 bg-white p-4 sm:p-5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-600 to-red-600 text-white shadow-xs flex items-center justify-center font-bold">
              <FileText size={17} />
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Sales Analytics</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 ml-10">
            Comprehensive audit & financial breakdown of all store transactions
          </p>
        </div>

        {/* Total Store Earnings Summary Card */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-rose-600 mb-0.5">Total Store Earnings</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              ₹{totalStoreEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp size={13} className="text-emerald-600" /> Cumulative revenue across all channels
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <IndianRupee size={22} />
          </div>
        </div>
      </div>

      {/* Toolbar Controls: Search & Channel Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Channel Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-lg">
          {['All', 'POS', 'Online'].map(tab => (
            <button
              key={tab}
              onClick={() => setChannelFilter(tab)}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                channelFilter === tab
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab === 'All' ? 'All Transactions' : tab === 'POS' ? 'In-Store POS' : 'Online Orders'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Txn # or Name..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Detailed Sales Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200/90 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="px-4 py-3">ID & Date</th>
                <th className="px-4 py-3">Source & Channel</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Breakdown</th>
                <th className="px-4 py-3 text-right">Grand Total</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredSales.map((sale) => {
                const isExpanded = expandedRow === sale.transaction_id;
                const formattedId = sale.transaction_id.toString().padStart(6, '0');
                const personName = sale.is_online ? sale.customer?.name : sale.employee?.name;
                const personRole = sale.is_online ? sale.customer?.email : sale.employee?.role;

                return (
                  <Fragment key={sale.transaction_id}>
                    <tr 
                      onClick={() => setExpandedRow(isExpanded ? null : sale.transaction_id)}
                      className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${isExpanded ? 'bg-slate-50/60' : ''}`}
                    >
                      {/* ID & Date */}
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900 text-xs tracking-tight">#{formattedId}</div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <Calendar size={11} className="text-slate-400" />
                          {new Date(sale.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Source & Channel */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <div className="flex items-center gap-1.5">
                            {sale.is_online ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Globe size={10} /> Online
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <ShoppingBag size={10} /> POS In-Store
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                              <CreditCard size={10} className="text-slate-400" /> {sale.payment_method || 'Cash'}
                            </span>
                          </div>

                          {personName && (
                            <div className="mt-0.5">
                              <span className="font-bold text-slate-900 text-xs capitalize">{personName}</span>
                              {personRole && (
                                <span className="text-[10px] text-slate-400 font-medium ml-1.5">({personRole})</span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Items Count Badge */}
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/70">
                          {sale.items?.length || 0} {sale.items?.length === 1 ? 'item' : 'items'}
                        </span>
                      </td>

                      {/* Financial Breakdown Sub-rows */}
                      <td className="px-4 py-3.5 text-right font-medium">
                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <div>Subtotal: <span className="font-bold text-slate-800">₹{Number(sale.subtotal || 0).toFixed(2)}</span></div>
                          {(Number(sale.tax_amount) > 0 || Number(sale.processing_fee) > 0) && (
                            <div className="text-[10px] text-slate-400">
                              Tax: ₹{Number(sale.tax_amount || 0).toFixed(2)} | Fee: ₹{Number(sale.processing_fee || 0).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Grand Total */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="text-sm font-extrabold text-slate-900">
                          ₹{Number(sale.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* Expand Toggle */}
                      <td className="px-4 py-3.5 text-center">
                        <button className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Items & Breakdown Details */}
                    {isExpanded && (
                      <tr className="bg-slate-50/80 border-b border-slate-200">
                        <td colSpan="6" className="p-4">
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {/* Purchased Items Table */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Itemized Purchase Breakdown</h4>
                              <div className="divide-y divide-slate-100 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                                {sale.items?.map((item, idx) => (
                                  <div key={idx} className="p-2.5 flex justify-between items-center text-xs">
                                    <div>
                                      <p className="font-bold text-slate-900">{item.product_name}</p>
                                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                                        {item.quantity} units × ₹{Number(item.unit_price || 0).toFixed(2)} {item.tax_rate > 0 ? `(+${item.tax_rate}% Tax)` : ''}
                                      </p>
                                    </div>
                                    <p className="font-extrabold text-slate-900 text-xs">
                                      ₹{Number(item.line_total || 0).toFixed(2)}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Tax & Payment Summary Box */}
                            <div className="space-y-2">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Payment Audit</h4>
                              <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                                <div className="flex justify-between text-slate-600 font-medium">
                                  <span>Items Subtotal:</span>
                                  <span className="font-bold text-slate-800">₹{Number(sale.subtotal || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                  <span>Tax Amount:</span>
                                  <span className="font-bold text-slate-800">₹{Number(sale.tax_amount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                  <span>Processing Fee:</span>
                                  <span className="font-bold text-slate-800">₹{Number(sale.processing_fee || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 font-medium">
                                  <span>Payment Method:</span>
                                  <span className="font-extrabold text-slate-800 px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-[10px]">
                                    {sale.payment_method || 'Cash'}
                                  </span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm">
                                  <span className="text-slate-900">Grand Total Paid:</span>
                                  <span className="text-rose-600">₹{Number(sale.grand_total || 0).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}

              {filteredSales.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-4 py-12 text-center text-slate-400 font-medium">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
