import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  ClipboardList, CheckCircle, XCircle, Truck,
  Package, ChevronDown, ChevronUp, Loader2, PlayCircle, CreditCard
} from 'lucide-react';

const STATUS_COLORS = {
  Pending:      'bg-yellow-100 text-yellow-700',
  'In Progress':'bg-blue-100 text-blue-700',
  Received:     'bg-emerald-100 text-emerald-700',
  Shipped:      'bg-purple-100 text-purple-700',
  Delivered:    'bg-green-100 text-green-700',
  Cancelled:    'bg-red-100 text-red-700',
};

const STATUS_FLOW = {
  Pending:      [{ label: 'Accept', status: 'In Progress', icon: PlayCircle, cls: 'bg-blue-500 text-white hover:bg-blue-600' }, { label: 'Reject', status: 'Cancelled', icon: XCircle, cls: 'bg-red-100 text-red-600 hover:bg-red-200' }],
  'In Progress':[{ label: 'Ship', status: 'Shipped', icon: Truck, cls: 'bg-purple-500 text-white hover:bg-purple-600' }],
  Shipped:      [{ label: 'Mark Delivered', status: 'Delivered', icon: CheckCircle, cls: 'bg-green-500 text-white hover:bg-green-600' }],
};

export default function SupplierOrders() {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['supplierOrders'],
    queryFn: () => axios.get(import.meta.env.VITE_API_URL + '/supplier/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data)
  });

  const { data: feeMap = {} } = useQuery({
    queryKey: ['supplierFees'],
    queryFn: () => axios.get(import.meta.env.VITE_API_URL + '/supplier/fees', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data)
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => axios.put(`${import.meta.env.VITE_API_URL}/supplier/orders/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      // Refetch only the orders list (the old key prevented an immediate UI refresh).
      queryClient.invalidateQueries({ queryKey: ['supplierOrders'] });
    }
  });

  const filters = ['All', 'Pending', 'In Progress', 'Shipped', 'Delivered', 'Cancelled'];
  const filtered = statusFilter === 'All' ? orders : orders.filter(o => o.status === statusFilter);

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Purchase Orders</h2>
        <p className="text-slate-500 text-sm mt-1">Review and manage all orders assigned to your account.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(f => (
          <button key={f} onClick={() => setStatusFilter(f)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${statusFilter === f ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <ClipboardList size={52} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No orders in this category</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => {
            const actions = STATUS_FLOW[order.status] || [];
            const isExpanded = expandedOrder === order.po_id;

            let computedGrandTotal = parseFloat(order.total_amount || 0);
            let computedSubtotal = computedGrandTotal;
            let computedFeeAmt = 0;
            let computedMethod = order.payment_method || 'Bank Transfer';
            let computedFeeRate = feeMap[computedMethod] ?? 0;

            if (order.PurchaseOrderDetails && order.PurchaseOrderDetails.length > 0) {
              computedSubtotal = order.PurchaseOrderDetails.reduce((sum, d) => {
                const qty = d.quantity_ordered || 0;
                const unitPrice = parseFloat(d.Product?.unit_price || 0);
                const baseTotal = unitPrice * qty;
                const catName = d.Product?.Category?.category_name || '';
                let gstRate = 0.05;
                if (['Fruits & Vegetables'].includes(catName)) gstRate = 0.00;
                else if (['Dairy Products', 'Bakery & Bread', 'Grocery & Staples'].includes(catName)) gstRate = 0.05;
                else if (['Beverages', 'Snacks & Packaged Foods'].includes(catName)) gstRate = 0.12;
                else if (['Personal Care', 'Household & Cleaning', 'Health & Wellness', 'Baby & Kids Products'].includes(catName)) gstRate = 0.18;
                return sum + baseTotal + (baseTotal * gstRate);
              }, 0);
              
              computedFeeAmt = computedSubtotal * computedFeeRate;
              computedGrandTotal = computedSubtotal + computedFeeAmt;
            }
            return (
              <div key={order.po_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 flex flex-wrap items-center gap-4">
                  {/* Left: ID + Date */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                        <Package size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">PO #{order.po_id}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {order.delivery_date && ` · Deliver by: ${new Date(order.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Center: status + amount */}
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                    <div className="text-right">
                      <p className="font-black text-lg text-slate-800">₹{computedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <p className="text-xs text-slate-400">{order.PurchaseOrderDetails?.length || 0} items</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {actions.map(action => {
                      const Icon = action.icon;
                      return (
                        <button key={action.status}
                          onClick={() => updateStatus.mutate({ id: order.po_id, status: action.status })}
                          disabled={updateStatus.isPending}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${action.cls}`}>
                          <Icon size={14} /> {action.label}
                        </button>
                      );
                    })}
                    <button onClick={() => setExpandedOrder(isExpanded ? null : order.po_id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium text-slate-600 flex items-center gap-1 transition-colors">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      Details
                    </button>
                  </div>
                </div>

                {/* Expanded Line Items */}
                {isExpanded && order.PurchaseOrderDetails?.length > 0 && (
                  <div className="px-6 pb-5">
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="overflow-x-auto w-full pb-4"><table className="w-full text-sm">
                        <thead>
                          <tr className="text-slate-500 text-left text-xs border-b border-slate-200">
                            <th className="pb-2 font-semibold">Product</th>
                            <th className="pb-2 font-semibold text-right">Qty</th>
                            <th className="pb-2 font-semibold text-right">Unit Price</th>
                            <th className="pb-2 font-semibold text-center">GST</th>
                            <th className="pb-2 font-semibold text-right">GST Amt</th>
                            <th className="pb-2 font-semibold text-right">Line Total</th>
                            <th className="pb-2 font-semibold text-right text-slate-400">Batch</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {order.PurchaseOrderDetails.map(d => {
                            const qty = d.quantity_ordered || 0;
                            const unitPrice = parseFloat(d.Product?.unit_price || 0);
                            const baseTotal = unitPrice * qty;

                            // GST tier by category (same logic as customer portal)
                            const catName = d.Product?.Category?.category_name || '';
                            let gstRate = 0.05;
                            if (['Fruits & Vegetables'].includes(catName)) gstRate = 0.00;
                            else if (['Dairy Products', 'Bakery & Bread', 'Grocery & Staples'].includes(catName)) gstRate = 0.05;
                            else if (['Beverages', 'Snacks & Packaged Foods'].includes(catName)) gstRate = 0.12;
                            else if (['Personal Care', 'Household & Cleaning', 'Health & Wellness', 'Baby & Kids Products'].includes(catName)) gstRate = 0.18;

                            const gstAmt = baseTotal * gstRate;
                            const lineTotal = baseTotal + gstAmt;

                            return (
                              <tr key={`${d.po_id}-${d.product_id}`}>
                                <td className="py-2.5 font-medium text-slate-800">{d.Product?.product_name || `Product #${d.product_id}`}</td>
                                <td className="py-2.5 text-right text-slate-600">{qty}</td>
                                <td className="py-2.5 text-right text-slate-700">₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-2.5 text-center">
                                  <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${gstRate === 0 ? 'bg-green-100 text-green-700' : gstRate === 0.05 ? 'bg-blue-100 text-blue-700' : gstRate === 0.12 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                    {(gstRate * 100).toFixed(0)}%
                                  </span>
                                </td>
                                <td className="py-2.5 text-right text-slate-500 text-xs">₹{gstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-2.5 text-right font-bold text-slate-800">₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                <td className="py-2.5 text-right text-slate-400 text-xs">{d.batch_no || '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-slate-300">
                            <td colSpan={5} className="pt-2 text-right text-xs text-slate-500 font-semibold">Subtotal (incl. GST)</td>
                            <td className="pt-2 text-right font-bold text-slate-700">
                              ₹{computedSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td></td>
                          </tr>
                          <>
                            <tr>
                              <td colSpan={5} className="pt-1 text-right text-xs text-slate-500">
                                <span className="flex items-center justify-end gap-1.5">
                                  <CreditCard size={11} />
                                  Payment Fee ({computedMethod} · {(computedFeeRate * 100).toFixed(1)}%)
                                </span>
                              </td>
                              <td className="pt-1 text-right text-xs text-slate-500">₹{computedFeeAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td></td>
                            </tr>
                            <tr className="border-t-2 border-slate-400">
                              <td colSpan={5} className="pt-2 text-right text-xs font-black text-slate-700 uppercase tracking-wide">Grand Total</td>
                              <td className="pt-2 text-right font-black text-slate-900 text-base">₹{computedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td></td>
                            </tr>
                          </>
                        </tfoot>
                      </table></div>
                      {order.DeliveryDetail && (
                        <div className="mt-3 pt-3 border-t border-slate-200 flex gap-6 text-xs text-slate-500">
                          <span>🚚 <b>Mode:</b> {order.DeliveryDetail.shipping_mode || '—'}</span>
                          <span>👤 <b>Agent:</b> {order.DeliveryDetail.purchase_agent_name || '—'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
