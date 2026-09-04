import { Printer, X, Receipt, ShieldCheck, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InvoiceModal({ order, onClose }) {
  if (!order) return null;

  const totalAmount = parseFloat(order.total_amount || 0);
  const amountPaid = parseFloat(order.amount_paid || 0);
  const balance = Math.max(0, totalAmount - amountPaid);
  const details = order.PurchaseOrderDetails || [];

  let grossSubtotal = 0;
  let itemsNetSubtotal = 0;

  const parsedItems = details.map(detail => {
    const qty = parseInt(detail.quantity_ordered || detail.quantity || 0);
    const mrp = parseFloat(detail.Product?.mrp || detail.Product?.unit_price || detail.unit_price || 0);
    const effectiveUnitPrice = parseFloat(detail.Product?.unit_price || detail.unit_price || mrp);
    const lineTotal = qty * effectiveUnitPrice;
    const grossLineTotal = qty * mrp;

    grossSubtotal += grossLineTotal;
    itemsNetSubtotal += lineTotal;

    return {
      name: detail.Product?.product_name || `Product #${detail.product_id}`,
      qty,
      mrp,
      unitPrice: effectiveUnitPrice,
      lineTotal
    };
  });

  const totalBulkDiscount = Math.max(0, grossSubtotal - itemsNetSubtotal);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden my-auto print:max-h-none print:shadow-none print:border-none print:my-0"
      >
        {/* Modal Top Bar (Sticky, Always Visible, Hidden in Print) */}
        <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="text-purple-400" size={17} />
            <span className="font-bold text-xs sm:text-sm">InventoryPro Official Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-lg transition-all shadow-xs"
            >
              <Printer size={13} /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Close modal"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Invoice Content */}
        <div className="p-4 sm:p-5 space-y-3 text-slate-800 bg-white overflow-y-auto flex-1">
          {/* Header Branding Banner */}
          <div className="flex flex-row items-center justify-between border-b border-slate-200 pb-3 gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-xl text-white flex items-center justify-center text-base font-black shadow-xs">
                I
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">InventoryPro</h1>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Inventory and Sales Management System</p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-extrabold rounded-md border border-purple-200 mb-0.5">
                OFFICIAL INVOICE
              </span>
              <h2 className="text-sm font-black text-slate-900 leading-none">#INV-PO-{order.po_id}</h2>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Date: {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Supplier Information Card */}
          <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 text-xs">
            <p className="text-[9px] font-bold text-purple-700 uppercase tracking-wider mb-0.5">Billed By (Supplier)</p>
            <p className="font-extrabold text-slate-900 text-xs truncate">{order.supplier_name || 'Verified Partner Supplier'}</p>
            {order.supplier_email && (
              <p className="text-[10px] text-slate-600 font-medium flex items-center gap-1 mt-0.5 truncate">
                <Mail size={11} className="text-slate-400 shrink-0" /> <span className="truncate">{order.supplier_email}</span>
              </p>
            )}
          </div>

          {/* Transaction Metadata Grid */}
          <div className="grid grid-cols-4 gap-2 py-1.5 border-y border-slate-200/80 text-[10px]">
            <div>
              <p className="text-slate-500 font-medium">Order Status</p>
              <span className="font-bold text-slate-900 text-[11px] mt-0.5 block">{order.status || 'Delivered'}</span>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Payment Status</p>
              <span className={`font-bold text-[11px] mt-0.5 block ${order.payment_status === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                {order.payment_status || 'Pending'}
              </span>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Method</p>
              <span className="font-bold text-slate-900 text-[11px] mt-0.5 block">{order.payment_method || 'Cash'}</span>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Total Amount</p>
              <span className="font-bold text-slate-900 text-[11px] mt-0.5 block">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                <tr>
                  <th className="py-1.5 px-3">Item Description</th>
                  <th className="py-1.5 px-3 text-center">Qty</th>
                  <th className="py-1.5 px-3 text-right">Wholesale Rate</th>
                  <th className="py-1.5 px-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-[11px]">
                {parsedItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-2 px-3 text-center text-slate-400 italic">
                      Bulk Purchase Order Items (#{order.po_id})
                    </td>
                  </tr>
                ) : (
                  parsedItems.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-bold text-slate-900">{item.name}</td>
                      <td className="py-2 px-3 text-center text-slate-700">{item.qty} units</td>
                      <td className="py-2 px-3 text-right text-slate-700">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary Card */}
          <div className="flex justify-end pt-0.5">
            <div className="w-full sm:w-64 bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600 font-medium">
                <span>Subtotal MRP:</span>
                <span className="font-semibold text-slate-800">₹{grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {totalBulkDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Wholesale Discount:</span>
                  <span>-₹{totalBulkDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-slate-900 text-xs border-t border-slate-200 pt-1">
                <span>Grand Total:</span>
                <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                <span>Amount Paid ({order.payment_method || 'Cash'}):</span>
                <span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-slate-200 pt-1 text-[11px]">
                <span>Balance Due:</span>
                <span className={balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Guarantee */}
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium gap-1">
            <div className="flex items-center gap-1 text-purple-700 font-semibold">
              <ShieldCheck size={13} /> Verified Transaction by InventoryPro System
            </div>
            <p>Thank you for your business!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
