import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { IndianRupee, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function SupplierPayments() {
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['supplierPayments'],
    queryFn: () => axios.get('http://localhost:5000/api/supplier/payments', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data)
  });

  const computeGrandTotal = (payment) => {
    // Match SupplierOrders/SupplierDelivery GST tier logic (GST-only; no processing fee).
    if (!payment?.PurchaseOrderDetails || payment.PurchaseOrderDetails.length === 0) {
      return parseFloat(payment?.total_amount || 0);
    }

    return payment.PurchaseOrderDetails.reduce((sum, d) => {
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

  const totalPaid = payments
    .filter(p => p.payment_status === 'Paid')
    .reduce((s, p) => s + computeGrandTotal(p), 0);

  const totalPending = payments
    .filter(p => p.payment_status === 'Pending')
    .reduce((s, p) => s + computeGrandTotal(p), 0);

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-green-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Payment Tracking</h2>
        <p className="text-slate-500 text-sm mt-1">Track payment status for all your purchase orders.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">₹{totalPaid.toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-1">Total Received</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-3">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <p className="text-2xl font-black text-slate-800">₹{totalPending.toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-500 mt-1">Awaiting Payment</p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-2">
          <IndianRupee size={18} className="text-green-500" />
          <h3 className="font-bold text-slate-800">Order Payment History</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">No payment records found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 text-left">
                  <th className="px-6 py-3 font-semibold">Order</th>
                  <th className="px-6 py-3 font-semibold">Order Date</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Amount</th>
                  <th className="px-6 py-3 font-semibold">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.po_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-800">PO #{p.po_id}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {new Date(p.order_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${p.status === 'Delivered' ? 'bg-green-100 text-green-700' : p.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-3 text-right font-bold text-slate-800">
                      ₹{computeGrandTotal(p).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-3">
                      {p.payment_status === 'Paid' ? (
                        <span className="flex items-center gap-1.5 text-green-600 font-semibold text-xs">
                          <CheckCircle size={14} /> Paid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-yellow-600 font-semibold text-xs">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
