import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, Package, CreditCard, CheckCircle, MapPin } from 'lucide-react';

const paymentColors = {
  Cash: 'bg-green-100 text-green-700',
  Card: 'bg-blue-100 text-blue-700',
  UPI: 'bg-purple-100 text-purple-700',
};

export default function CustomerOrders() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customerOrders'],
    queryFn: () => axios.get(import.meta.env.VITE_API_URL + '/customer/orders').then(r => r.data)
  });

  const { data: profile } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => axios.get(import.meta.env.VITE_API_URL + '/customer/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data),
  });

  if (isLoading) return <div className="p-8 text-center text-slate-400">Loading your orders...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">My Orders</h2>
        <p className="text-slate-500 text-sm mt-1">Track all your purchases and payment history.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <ClipboardList size={56} className="mx-auto text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-400">No orders yet</h3>
          <p className="text-slate-400 mt-2 text-sm">Visit the Shop to place your first order!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const payment = Array.isArray(order.Payments) ? order.Payments[0] : order.Payment;
            return (
              <div key={order.transaction_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-[1rem] flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-inner">
                      <CheckCircle size={24} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-extrabold text-white text-lg tracking-wide">Order #{order.transaction_id}</p>
                      <p className="text-sm font-medium text-slate-400">{new Date(order.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {payment && (
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm ${paymentColors[payment.payment_method] || 'bg-slate-700 text-slate-200'}`}>
                        <CreditCard size={14} /> {payment.payment_method}
                      </span>
                    )}
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black text-emerald-400 leading-none drop-shadow-sm">₹{parseFloat(order.grand_total).toLocaleString('en-IN')}</span>
                      {payment && <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1.5">Includes {payment.payment_method} Fee</span>}
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-500 shrink-0" />
                  {profile?.address ? (
                    <span className="text-xs text-slate-500 truncate max-w-sm">{profile.address}</span>
                  ) : (
                    <span className="text-xs text-red-400 italic">No delivery address set</span>
                  )}
                </div>

                {/* Order Items */}
                <div className="p-4 space-y-2">
                  {(order.SalesTransactionDetails || []).map(detail => {
                    const price = parseFloat(detail.unit_price) || 0;
                    const qty = parseInt(detail.quantity_sold) || 0;
                    const taxAmt = parseFloat(detail.tax) || 0;
                    const lineTotalWithTax = parseFloat(detail.line_total) || (price * qty + taxAmt);

                    return (
                      <div key={detail.product_id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
                            <Package size={16} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-800">{detail.Product?.product_name || 'Unknown Product'}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-500">Qty: {qty} × ₹{price.toLocaleString('en-IN')}</p>
                              {taxAmt > 0 && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded border border-orange-100">
                                  GST ₹{taxAmt.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="font-bold text-sm text-slate-700">₹{lineTotalWithTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Bill Summary */}
                <div className="mx-5 mb-5 rounded-[1.25rem] bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 p-4 space-y-2 text-sm shadow-sm">
                  <div className="flex justify-between font-medium text-slate-500">
                    <span>Item Subtotal</span>
                    <span className="text-slate-700">₹{(order.SalesTransactionDetails || []).reduce((s, d) => s + (parseFloat(d.unit_price) || 0) * (parseInt(d.quantity_sold) || 0), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-orange-600">
                    <span>🧾 GST</span>
                    <span>+ ₹{(order.gst_total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-blue-600">
                    <span className="flex items-center">
                      💳 Transaction Fee
                      <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                        {payment?.payment_method || 'N/A'} · {((order.fee_rate || 0) * 100).toFixed(1)}%
                      </span>
                    </span>
                    <span>+ ₹{(order.processing_fee || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200/80 pt-3 mt-1 flex justify-between items-center text-slate-900">
                    <span className="font-bold text-base uppercase tracking-wide">Grand Total</span>
                    <span className="text-2xl font-black tracking-tight text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">₹{parseFloat(order.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
