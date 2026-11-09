import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IndianRupee, CheckCircle, Clock, Loader2, CreditCard, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import InvoiceModal from '../../components/InvoiceModal';
import { API_BASE } from '../../config/api';

export default function SupplierPayments() {
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['supplierPayments'],
    queryFn: () => axios.get(API_BASE + '/supplier/payments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data)
  });

  const computeGrandTotal = (payment) => {
    return parseFloat(payment?.total_amount || 0);
  };

  const totalPaid = payments
    .filter(p => p.payment_status === 'Paid' || parseFloat(p.amount_paid || 0) >= parseFloat(p.total_amount || 0))
    .reduce((s, p) => s + computeGrandTotal(p), 0);

  // Rock-solid calculation for Awaiting Payment
  const totalPending = payments.reduce((sum, p) => {
    const total = parseFloat(p.total_amount || 0);
    const paid = parseFloat(p.amount_paid || 0);
    if (p.payment_status === 'Paid' || (paid >= total && total > 0)) {
      return sum;
    }
    const pending = Math.max(0, total - paid);
    return sum + (pending > 0 ? pending : total);
  }, 0);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-slate-400 font-medium">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
        <span>Loading payment tracking...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/20 flex items-center justify-center font-bold">
              <IndianRupee size={18} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Payment Tracking</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 ml-1">
            MONITOR INVOICE SETTLEMENTS, PAYOUTS & DISBURSEMENTS
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-50 via-fuchsia-50/60 to-violet-50 rounded-2xl border border-purple-200/90 shadow-xs p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-bold uppercase text-purple-900 tracking-wider mb-1">Total Received</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Settled purchase orders</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl text-white shadow-md shadow-purple-500/20 flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-amber-50/30 rounded-2xl border border-amber-200/90 shadow-xs p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-[10px] font-bold uppercase text-amber-900 tracking-wider mb-1">Awaiting Payment</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">₹{totalPending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">Pending payout disbursements</p>
          </div>
          <div className="w-10 h-10 bg-amber-500 rounded-xl text-white shadow-md shadow-amber-500/20 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
        </motion.div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200/80 bg-purple-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <CreditCard size={16} />
            </div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Order Payment History</h3>
          </div>
          <span className="text-xs font-bold text-purple-900 bg-purple-100/70 border border-purple-200 px-2.5 py-0.5 rounded-lg">
            {payments.length} Invoices
          </span>
        </div>

        {payments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium">No payment records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider text-left">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Order Date</th>
                  <th className="px-5 py-3">Fulfillment Status</th>
                  <th className="px-5 py-3 text-right">Order Amount</th>
                  <th className="px-5 py-3 text-center">Payment Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {payments.map(p => (
                  <tr key={p.po_id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-900 text-sm">#PO-{p.po_id}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs font-medium">
                      {new Date(p.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        p.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        p.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900 text-sm">
                      ₹{computeGrandTotal(p).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 flex justify-center">
                      {p.payment_status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                          <CheckCircle size={13} className="text-purple-600" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={13} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => setSelectedInvoice(p)}
                        className="px-3 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs border border-purple-200 transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <FileText size={13} /> Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Official InventoryPro Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
}
