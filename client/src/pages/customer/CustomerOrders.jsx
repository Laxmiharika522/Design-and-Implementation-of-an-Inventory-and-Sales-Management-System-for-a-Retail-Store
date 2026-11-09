import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ClipboardList, Package, CreditCard, CheckCircle2, MapPin, Receipt, ArrowLeft, ShoppingCart, ShieldCheck, Printer } from 'lucide-react';
import { API_BASE } from '../../config/api';

const paymentColors = {
  Cash: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Card: 'bg-blue-100 text-blue-800 border-blue-200',
  'Debit Card': 'bg-blue-100 text-blue-800 border-blue-200',
  'Credit Card': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  UPI: 'bg-purple-100 text-purple-800 border-purple-200',
  'Net Banking': 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function CustomerOrders() {
  const navigate = useNavigate();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['customerOrders'],
    queryFn: () => axios.get(API_BASE + '/customer/orders').then(r => r.data)
  });

  const { data: profile } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => axios.get(API_BASE + '/customer/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data),
  });

  const handlePrintInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups for this site to print invoices.');
      return;
    }

    const txnIdFormatted = `#${String(order.transaction_id || 0).padStart(4, '0')}`;
    const dateFormatted = new Date(order.transaction_date || Date.now()).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const payment = Array.isArray(order.Payments) ? order.Payments[0] : order.Payment;
    const payMethod = payment?.payment_method || 'UPI';
    let feePct = 0;

    const details = order.SalesTransactionDetails || [];
    const subtotal = details.reduce((sum, d) => sum + (parseFloat(d.unit_price) || 0) * (parseInt(d.quantity_sold) || 0), 0);
    const grandTotal = parseFloat(order.grand_total) || 0;
    const deliveryFee = Math.max(0, Math.round((grandTotal - subtotal) * 100) / 100);

    const itemsHtml = details.map((detail, idx) => `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 600; color: #1e293b;">
          ${idx + 1}. ${detail.Product?.product_name || 'Item'}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; color: #475569;">
          ${detail.quantity_sold || 1}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #475569;">
          ₹${Number(detail.unit_price || 0).toFixed(2)}
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">
          ₹${(Number(detail.unit_price || 0) * Number(detail.quantity_sold || 1)).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${txnIdFormatted} - InventoryPro</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            * { box-sizing: border-box; }
            body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 30px; color: #0f172a; background-color: #ffffff; }
            .invoice-card { max-width: 720px; margin: auto; border: 1px solid #cbd5e1; padding: 32px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #059669; padding-bottom: 18px; margin-bottom: 24px; }
            .brand { font-size: 24px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
            .brand span { color: #0f172a; }
            .tagline { font-size: 12px; color: #64748b; font-weight: 600; margin-top: 2px; }
            .invoice-title { text-align: right; }
            .invoice-title h2 { margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; }
            .invoice-number { font-family: monospace; font-size: 15px; color: #059669; font-weight: 800; margin-top: 4px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: #f0fdf4; padding: 16px 20px; border-radius: 12px; border: 1px solid #bbf7d0; }
            .meta-col label { display: block; font-size: 10px; font-weight: 900; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .meta-col p { margin: 0; font-size: 13px; color: #1e293b; font-weight: 600; }
            .meta-col .subtext { font-size: 11px; color: #475569; font-weight: 500; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background-color: #f1f5f9; color: #475569; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
            th.center { text-align: center; }
            th.right { text-align: right; }
            .totals-wrapper { display: flex; justify-content: flex-end; }
            .totals-box { width: 320px; }
            .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; font-weight: 500; }
            .totals-row.grand-total { border-top: 2px solid #0f172a; margin-top: 8px; padding-top: 10px; font-size: 18px; font-weight: 900; color: #059669; }
            .footer { margin-top: 36px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 12px; color: #64748b; }
            @media print { body { padding: 0; } .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; } }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="header">
              <div>
                <div class="brand">Inventory<span>Pro</span></div>
                <div class="tagline">Customer Order Invoice</div>
              </div>
              <div class="invoice-title">
                <h2>ORDER RECEIPT</h2>
                <div class="invoice-number">${txnIdFormatted}</div>
                <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ${dateFormatted}</div>
              </div>
            </div>

            <div class="meta-grid">
              <div class="meta-col">
                <label>Delivery Details</label>
                <p>${profile?.name || 'Customer'}</p>
                <div class="subtext">${profile?.address || 'Standard Address'}</div>
                <div class="subtext">${profile?.phone || ''}</div>
              </div>
              <div class="meta-col" style="text-align: right;">
                <label>Payment Summary</label>
                <p>Method: <strong>${payMethod}</strong></p>
                <div class="subtext">Status: Paid Online</div>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th class="center">Qty</th>
                  <th class="right">Unit Price</th>
                  <th class="right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals-wrapper">
              <div class="totals-box">
                <div class="totals-row">
                  <span>Subtotal (MRP)</span>
                  <span>₹${subtotal.toFixed(2)}</span>
                </div>
                <div class="totals-row">
                  <span>Delivery Charge</span>
                  <span>${deliveryFee > 0 ? `₹${deliveryFee.toFixed(2)}` : 'FREE'}</span>
                </div>
                <div class="totals-row grand-total">
                  <span>Total Paid</span>
                  <span>₹${grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e293b;">Thank you for shopping with InventoryPro!</p>
              <p style="margin: 0;">For queries or returns, contact support@inventorypro.com</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 250);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (isLoading) return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-slate-500 font-bold text-sm">Loading your order history...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white p-5 rounded-2xl border-2 border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardList className="text-emerald-700" size={26} />
            <span>My Orders & Billing</span>
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">Track all your past store purchases, tax details, and payment history.</p>
        </div>

        <button 
          onClick={() => navigate('/customer/shop')}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 border border-emerald-800"
        >
          <ShoppingCart size={16} /> Continue Shopping
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-slate-200 p-16 text-center shadow-sm space-y-4">
          <div className="w-20 h-20 bg-slate-100 text-slate-300 rounded-full flex items-center justify-center mx-auto border-2 border-slate-200">
            <ClipboardList size={40} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">No orders placed yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-medium">Browse our catalog and place your first fresh grocery order today!</p>
          </div>
          <button 
            onClick={() => navigate('/customer/shop')}
            className="px-6 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md hover:bg-emerald-700 transition-all border border-emerald-700"
          >
            Go to Shop
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => {
            const payment = Array.isArray(order.Payments) ? order.Payments[0] : order.Payment;
            const payMethod = payment?.payment_method || 'UPI';

            return (
              <div key={order.transaction_id} className="bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden transition-all duration-200">
                
                {/* Order Header Bar */}
                <div className="bg-slate-50/70 px-6 py-4 border-b-2 border-slate-200 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center border-2 border-emerald-300 font-black">
                      <CheckCircle2 size={20} className="text-emerald-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-base">Order #{order.transaction_id}</span>
                        <span className="text-[10px] uppercase tracking-wider font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                          Completed
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-500 mt-0.5">
                        Placed on {new Date(order.transaction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border-2 shadow-xs ${paymentColors[payMethod] || 'bg-slate-100 text-slate-800 border-slate-300'}`}>
                      <CreditCard size={14} /> {payMethod}
                    </span>

                    <button
                      onClick={() => handlePrintInvoice(order)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors border border-slate-300"
                    >
                      <Printer size={14} /> Print Invoice
                    </button>

                    <div className="text-right">
                      <span className="text-2xl font-black text-slate-900 leading-none">
                        ₹{parseFloat(order.grand_total).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address Banner */}
                <div className="px-6 py-3 bg-emerald-50/40 border-b-2 border-slate-200 flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={14} className="text-emerald-600 shrink-0" />
                  <span className="text-slate-600 font-extrabold">Delivery Address:</span>
                  <span className="text-slate-900 font-bold truncate">{profile?.address || 'Standard Delivery Address'}</span>
                </div>

                {/* Order Items List */}
                <div className="p-6 space-y-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Purchased Items</p>
                  {(order.SalesTransactionDetails || []).map(detail => {
                    const price = parseFloat(detail.unit_price) || 0;
                    const qty = parseInt(detail.quantity_sold) || 0;
                    const lineTotal = price * qty;
                    const prodImg = detail.Product?.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&w=300&q=80';

                    return (
                      <div key={detail.product_id} className="flex items-center justify-between py-3 px-4 bg-white rounded-xl border-2 border-slate-200/90 shadow-xs">
                        <div className="flex items-center gap-3.5">
                          <img 
                            src={prodImg} 
                            alt={detail.Product?.product_name} 
                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&w=300&q=80'; }}
                            className="w-12 h-12 object-contain bg-white rounded-lg p-1 border-2 border-slate-200 shadow-xs"
                          />
                          <div>
                            <p className="font-extrabold text-sm text-slate-950 leading-snug">{detail.Product?.product_name || 'Item'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-bold text-slate-600">Qty: {qty} × ₹{price.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-base text-slate-950">
                            ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill Summary Box */}
                {(() => {
                  const subTotal = (order.SalesTransactionDetails || []).reduce((s, d) => s + (parseFloat(d.unit_price) || 0) * (parseInt(d.quantity_sold) || 0), 0);
                  const deliveryFee = Math.max(0, Math.round(parseFloat(order.grand_total) - subTotal));

                  return (
                    <div className="mx-6 mb-6 p-5 rounded-2xl bg-emerald-50/50 border-2 border-emerald-200 text-xs space-y-2.5">
                      <div className="flex justify-between font-bold text-slate-700">
                        <span>Items Subtotal (MRP)</span>
                        <span className="font-black text-slate-950">
                          ₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex justify-between items-center font-bold text-slate-700">
                        <span>Delivery Charge</span>
                        {deliveryFee === 0 ? (
                          <span className="font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 text-[10px]">
                            FREE
                          </span>
                        ) : (
                          <span className="font-black text-slate-950">
                            + ₹{deliveryFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        )}
                      </div>

                      <div className="border-t-2 border-emerald-200 pt-3 mt-1 flex justify-between items-center text-slate-900">
                        <span className="font-black text-sm uppercase tracking-wide">Grand Total Paid</span>
                        <span className="text-2xl font-black text-emerald-800 bg-white px-4 py-1.5 rounded-xl border-2 border-emerald-300 shadow-sm">
                          ₹{parseFloat(order.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
