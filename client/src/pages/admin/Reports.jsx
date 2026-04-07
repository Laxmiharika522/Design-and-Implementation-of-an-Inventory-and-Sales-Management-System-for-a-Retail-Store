import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  User, 
  Calendar, 
  IndianRupee, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Globe
} from 'lucide-react';
import { useState, Fragment } from 'react';

export default function Reports() {
  const [expandedRow, setExpandedRow] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['adminReportsSales'],
    queryFn: async () => {
      const { data } = await axios.get('/reports/detailed-sales');
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { sales = [], totalStoreEarnings = 0 } = data || {};

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header & Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Sales Analytics</h2>
          <p className="text-slate-500 mt-2 font-medium">Comprehensive breakdown of all store and online transactions.</p>
        </div>
        <div className="card bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 shadow-xl shadow-blue-500/20 border-0 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-blue-100 text-sm font-bold uppercase tracking-wider">Total Store Earnings</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-4xl font-black italic">₹{totalStoreEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="mt-4 flex items-center gap-2 text-blue-100 text-xs font-bold">
            <TrendingUp size={14} />
            <span>Cumulative across all channels</span>
          </div>
        </div>
      </div>

      {/* Detailed Sales Table */}
      <div className="card border dark:border-slate-700 overflow-hidden shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b dark:border-slate-700">
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">ID & Date</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">Source & Channel</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px]">Details</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] text-right">Financing</th>
                <th className="px-6 py-4 font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[10px] text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {sales.map((sale) => (
                <Fragment key={sale.transaction_id}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === sale.transaction_id ? null : sale.transaction_id)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-900 dark:text-white">#{sale.transaction_id.toString().padStart(6, '0')}</div>
                      <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                        <Calendar size={12} /> {new Date(sale.transaction_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {sale.is_online ? (
                        <div className="flex flex-col gap-1">
                          <span className="badge bg-green-100 text-green-700 border-green-200 self-start flex items-center gap-1">
                            <Globe size={10} /> Online Purchase
                          </span>
                          <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{sale.customer?.name}</div>
                          <div className="text-[10px] text-slate-400 lowercase">{sale.customer?.email}</div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="badge bg-blue-100 text-blue-700 border-blue-200 self-start flex items-center gap-1">
                            <ShoppingBag size={10} /> POS In-Store
                          </span>
                          <div className="text-xs font-bold text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{sale.employee?.name}</div>
                          <div className="text-[10px] text-slate-400">{sale.employee?.role}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-600 dark:text-slate-400">
                          {sale.items?.length || 0} {sale.items?.length === 1 ? 'Item' : 'Items'}
                        </span>
                        {expandedRow === sale.transaction_id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right font-medium">
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <p>Subtotal: ₹{Number(sale.subtotal || 0).toFixed(2)}</p>
                        <p>Tax: ₹{Number(sale.tax_amount || 0).toFixed(2)}</p>
                        <p>Fees: ₹{Number(sale.processing_fee || 0).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">₹{Number(sale.grand_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </td>
                  </tr>
                  
                  {expandedRow === sale.transaction_id && (
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <td colSpan="5" className="px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Breakdown</h4>
                            <div className="divide-y dark:divide-slate-700 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm overflow-hidden">
                              {sale.items?.map((item, idx) => (
                                <div key={idx} className="p-3 flex justify-between items-center text-xs">
                                  <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{item.product_name}</p>
                                    <p className="text-[10px] text-slate-400 font-medium">
                                      {item.quantity} x ₹{Number(item.unit_price || 0).toFixed(2)} (+{item.tax_rate}% Tax)
                                    </p>
                                  </div>
                                  <p className="font-black text-slate-900 dark:text-white">₹{Number(item.line_total || 0).toFixed(2)}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tax & Fees Summary</h4>
                            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 shadow-sm space-y-3 text-xs">
                              <div className="flex justify-between font-medium">
                                <span className="text-slate-500">Subtotal</span>
                                <span className="text-slate-900 dark:text-white">₹{Number(sale.subtotal || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-slate-500">Calculated GST</span>
                                <span className="text-slate-900 dark:text-white">₹{Number(sale.tax_amount || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-medium">
                                <span className="text-slate-500">Processing Fee</span>
                                <span className="text-slate-900 dark:text-white">₹{Number(sale.processing_fee || 0).toFixed(2)}</span>
                              </div>
                              <div className="pt-3 border-t dark:border-slate-700 flex justify-between font-black text-sm">
                                <span className="text-slate-800 dark:text-white">Total Amount</span>
                                <span className="text-blue-600">₹{Number(sale.grand_total || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium">
                    No transactions found in the database.
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
