import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList, CheckCircle, XCircle, Truck,
  Package, ChevronDown, ChevronUp, Loader2, CreditCard,
  Building2, Calendar, FileText, ArrowRight, ShieldCheck, IndianRupee
} from 'lucide-react';

import InvoiceModal from '../../components/InvoiceModal';
import { API_BASE } from '../../config/api';

const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

const STATUS_COLORS = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Shipped: 'bg-blue-50 text-blue-700 border-blue-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',
  'In Progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Received: 'bg-teal-50 text-teal-700 border-teal-200',
};

export default function SupplierOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['supplierOrders'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/supplier/orders`, getAuthHeaders());
      return res.data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return axios.put(`${API_BASE}/supplier/orders/${id}/status`, { status }, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierOrders'] });
      queryClient.invalidateQueries({ queryKey: ['supplierStats'] });
      queryClient.invalidateQueries({ queryKey: ['supplierDelivery'] });
      queryClient.invalidateQueries({ queryKey: ['supplierPayments'] });
    }
  });

  const filters = ['All', 'Pending', 'Shipped', 'Delivered', 'Cancelled'];
  const filtered = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);

  if (isLoading) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-slate-400 font-medium">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
        <span>Loading purchase orders...</span>
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
              <ClipboardList size={18} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Purchase Orders</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1 ml-1">
            REVIEW STORE ORDERS, DISPATCH STOCK & UPDATE FULFILLMENT STATUS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-purple-50 border border-purple-300/80 rounded-xl flex items-center gap-2 text-xs font-bold text-purple-950">
            <Package size={15} className="text-purple-600" />
            <span>Total Orders: {orders.length}</span>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1.5 flex-wrap bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
        {filters.map(f => {
          const count = f === 'All' ? orders.length : orders.filter(o => o.status === f).length;
          const isActive = statusFilter === f;

          return (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-md shadow-purple-500/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <span>{f}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isActive ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <ClipboardList size={44} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-base font-bold text-slate-700">No purchase orders found</h3>
          <p className="text-xs text-slate-400 mt-1">There are no orders matching status "{statusFilter}".</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filtered.map(order => {
            const isExpanded = expandedOrder === order.po_id;
            const totalAmount = parseFloat(order.total_amount || 0);
            const amountPaid = parseFloat(order.amount_paid || 0);
            const balance = Math.max(0, totalAmount - amountPaid);
            const details = order.PurchaseOrderDetails || [];

            let grossSubtotal = 0;
            let itemsNetSubtotal = 0;

            const parsedItems = details.map(detail => {
              const qty = parseInt(detail.quantity_ordered || 0);
              const mrp = parseFloat(detail.Product?.unit_price || detail.mrp || detail.unit_price || 0);
              const effectiveUnitPrice = parseFloat(detail.unit_price || detail.Product?.unit_price || 0);
              const lineTotal = qty * effectiveUnitPrice;
              const grossLineTotal = qty * mrp;

              grossSubtotal += grossLineTotal;
              itemsNetSubtotal += lineTotal;

              const discPct = (mrp > effectiveUnitPrice && mrp > 0)
                ? Math.round(((mrp - effectiveUnitPrice) / mrp) * 100)
                : 0;

              return {
                ...detail,
                qty,
                mrp,
                effectiveUnitPrice,
                lineTotal,
                discPct
              };
            });

            const totalBulkDiscount = Math.max(0, grossSubtotal - itemsNetSubtotal);

            return (
              <div key={order.po_id} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition-all hover:border-slate-300">
                {/* PO Card Header Row */}
                <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                  {/* PO Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-[220px]">
                    <div className="w-9 h-9 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center font-bold shrink-0 border border-purple-200/60">
                      <Package size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">#PO-{order.po_id}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5">
                        <span>Date: {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        {order.delivery_date && (
                          <span>· Delivered: {new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Breakdown Overview */}
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Order Amount</p>
                      <p className="font-bold text-base text-slate-900 mt-0.5">
                        ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-500">
                        {details.length} item{details.length !== 1 ? 's' : ''} ({details.reduce((s, i) => s + (parseInt(i.quantity_ordered) || 0), 0)} units)
                      </p>
                    </div>

                    <div className="text-right border-l border-slate-200/80 pl-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Payment Status</p>
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border mt-0.5 ${
                        order.payment_status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : order.payment_status === 'Partial'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {order.payment_status || 'Pending'}
                      </span>
                      <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                        Paid: ₹{amountPaid.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Status Updates */}
                  <div className="flex items-center gap-2">
                    {order.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => navigate('/supplier/delivery', { state: { selectedPoId: order.po_id } })}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
                        >
                          <Truck size={14} /> Dispatch Order
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to cancel PO #${order.po_id}?`)) {
                              updateStatusMutation.mutate({ id: order.po_id, status: 'Cancelled' });
                            }
                          }}
                          disabled={updateStatusMutation.isLoading}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center gap-1"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </>
                    )}

                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => updateStatusMutation.mutate({ id: order.po_id, status: 'Delivered' })}
                        disabled={updateStatusMutation.isLoading}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle size={14} /> Mark Delivered
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedInvoice(order)}
                      className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5"
                    >
                      <FileText size={14} /> Invoice
                    </button>

                    <button
                      onClick={() => setExpandedOrder(isExpanded ? null : order.po_id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Item Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200/80 bg-slate-50/70 p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Itemized Purchase Breakdown</h4>
                        <span className="text-xs font-semibold text-slate-700">Payment Method: {order.payment_method || 'Cash'}</span>
                      </div>

                      {/* Items Table */}
                      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 font-bold uppercase text-slate-500 text-[11px]">
                              <th className="py-2.5 px-3.5">Product Description</th>
                              <th className="py-2.5 px-3.5 text-center">Quantity</th>
                              <th className="py-2.5 px-3.5 text-right">Catalog MRP</th>
                              <th className="py-2.5 px-3.5 text-right">Wholesale Rate</th>
                              <th className="py-2.5 px-3.5 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                            {parsedItems.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="py-3 px-3.5 font-bold text-slate-900">
                                  {item.Product?.product_name || `Product #${item.product_id}`}
                                </td>
                                <td className="py-3 px-3.5 text-center font-bold text-slate-800">{item.qty} units</td>
                                <td className="py-3 px-3.5 text-right text-slate-400 font-normal">₹{item.mrp.toFixed(2)}</td>
                                <td className="py-3 px-3.5 text-right">
                                  <span className="font-bold text-slate-900">₹{item.effectiveUnitPrice.toFixed(2)}</span>
                                  {item.discPct > 0 && (
                                    <span className="block text-[10px] font-bold text-emerald-700">({item.discPct}% OFF)</span>
                                  )}
                                </td>
                                <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                                  ₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Summary Box */}
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl space-y-2 shadow-2xs">
                        <div className="flex justify-between text-xs font-medium text-slate-600">
                          <span>Gross Items Subtotal (MRP):</span>
                          <span className="font-semibold text-slate-800">₹{grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>

                        {totalBulkDiscount > 0 && (
                          <div className="flex justify-between text-xs font-semibold text-emerald-700">
                            <span>Wholesale Volume Discount:</span>
                            <span>-₹{totalBulkDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-slate-200 pt-2">
                          <span>Total Bulk Order Amount:</span>
                          <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-xs font-semibold text-emerald-700">
                          <span>Total Amount Paid ({order.payment_method || 'Cash'}):</span>
                          <span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>

                        <div className="flex justify-between text-xs font-bold text-slate-900 border-t border-slate-200 pt-2">
                          <span>Outstanding Balance:</span>
                          <span className={balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                            ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Official InventoryPro Invoice Modal */}
      {selectedInvoice && (
        <InvoiceModal order={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
      )}
    </div>
  );
}
