import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Truck, Save, CheckCircle, Loader2, Package } from 'lucide-react';

const STATUS_COLORS = {
  Pending:      'bg-yellow-100 text-yellow-700',
  'In Progress':'bg-blue-100 text-blue-700',
  Shipped:      'bg-purple-100 text-purple-700',
  Delivered:    'bg-green-100 text-green-700',
  Cancelled:    'bg-red-100 text-red-700',
  Received:     'bg-emerald-100 text-emerald-700',
};

const SHIPPING_MODES = ['Truck', 'Courier', 'Rail', 'Air Freight', 'Two Wheeler', 'Van'];

export default function SupplierDelivery() {
  const queryClient = useQueryClient();
  const [forms, setForms] = useState({});
  const [saved, setSaved] = useState({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['supplierDelivery'],
    queryFn: () => axios.get(import.meta.env.VITE_API_URL + '/supplier/orders', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data),
    onSuccess: (data) => {
      // Pre-fill forms from existing delivery details
      const initial = {};
      data.forEach(order => {
        const isDelivered = ['Delivered', 'Received'].includes(order.status);
        
        let mode = '';
        let agent = '';
        let date = order.delivery_date || '';

        if (order.DeliveryDetail) {
          mode = order.DeliveryDetail.shipping_mode || '';
          agent = order.DeliveryDetail.purchase_agent_name || '';
        }

        if (isDelivered) {
          if (!mode) mode = 'Truck';
          if (!agent) agent = 'System Assigned Partner';
          if (!date) {
            const tempDate = new Date(order.order_date);
            tempDate.setDate(tempDate.getDate() + 3);
            date = tempDate.toISOString().split('T')[0];
          }
        }

        initial[order.po_id] = {
          shipping_mode: mode,
          purchase_agent_name: agent,
          delivery_date: date,
        };
      });
      setForms(initial);
    }
  });

  const { data: feeMap = {} } = useQuery({
    queryKey: ['supplierFees'],
    queryFn: () => axios.get(import.meta.env.VITE_API_URL + '/supplier/fees', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data)
  });

  const saveDelivery = useMutation({
    mutationFn: ({ po_id, data }) => axios.post(`${import.meta.env.VITE_API_URL}/supplier/delivery/${po_id}`, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: (_, { po_id }) => {
      queryClient.invalidateQueries({ queryKey: ['supplierDelivery'] });
      setSaved(prev => ({ ...prev, [po_id]: true }));
      setTimeout(() => setSaved(prev => ({ ...prev, [po_id]: false })), 2500);
    }
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => axios.put(`${import.meta.env.VITE_API_URL}/supplier/orders/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      // Refetch delivery list immediately after status change.
      queryClient.invalidateQueries({ queryKey: ['supplierDelivery'] });
    }
  });

  const handleFormChange = (po_id, field, value) => {
    setForms(prev => ({ ...prev, [po_id]: { ...(prev[po_id] || {}), [field]: value } }));
  };

  // Only show orders that are in active/actionable delivery states
  const activeOrders = orders.filter(o => !['Cancelled', 'Pending'].includes(o.status));

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Delivery Management</h2>
        <p className="text-slate-500 text-sm mt-1">Update shipping details and track delivery status for active orders.</p>
      </div>

      {activeOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
          <Truck size={52} className="mx-auto text-slate-200 mb-3" />
          <p className="text-slate-400 font-medium">No active deliveries</p>
          <p className="text-slate-400 text-sm mt-1">Accept orders first from the Purchase Orders tab.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeOrders.map(order => {
            const form = forms[order.po_id] || {};
            const isDelivered = ['Delivered', 'Received'].includes(order.status);
            
            let displayMode = form.shipping_mode || (order.DeliveryDetail && order.DeliveryDetail.shipping_mode);
            let displayAgent = form.purchase_agent_name || (order.DeliveryDetail && order.DeliveryDetail.purchase_agent_name);
            let displayDate = form.delivery_date || order.delivery_date;

            // Keep amounts consistent with SupplierOrders (GST tiers + optional payment fee).
            const computedMethod = order.payment_method || 'Bank Transfer';
            const computedFeeRate = feeMap[computedMethod] ?? 0;
            let computedGrandTotal = parseFloat(order.total_amount || 0);

            if (order.PurchaseOrderDetails && order.PurchaseOrderDetails.length > 0) {
              const computedSubtotal = order.PurchaseOrderDetails.reduce((sum, d) => {
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

              const computedFeeAmt = computedSubtotal * computedFeeRate;
              computedGrandTotal = computedSubtotal + computedFeeAmt;
            }

            if (isDelivered) {
              if (!displayMode) displayMode = 'Truck';
              if (!displayAgent) displayAgent = 'System Assigned Partner';
              if (!displayDate) {
                const tempDate = new Date(order.order_date);
                tempDate.setDate(tempDate.getDate() + 3);
                displayDate = tempDate.toISOString().split('T')[0];
              }
            }

            return (
              <div key={order.po_id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Package size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">PO #{order.po_id}</p>
                      <p className="text-xs text-slate-400">{new Date(order.order_date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>{order.status}</span>
                    <p className="font-bold text-slate-800">₹{computedGrandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Delivery Form */}
                <div className="p-6 grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Shipping Mode</label>
                    {isDelivered ? (
                      <div className="px-3 py-2 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl">
                        {displayMode}
                      </div>
                    ) : (
                      <select
                        value={form.shipping_mode || ''}
                        onChange={e => handleFormChange(order.po_id, 'shipping_mode', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400">
                        <option value="">Select mode...</option>
                        {SHIPPING_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Purchase Agent Name</label>
                    {isDelivered ? (
                      <div className="px-3 py-2 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl">
                        {displayAgent}
                      </div>
                    ) : (
                      <input
                        value={form.purchase_agent_name || ''}
                        onChange={e => handleFormChange(order.po_id, 'purchase_agent_name', e.target.value)}
                        placeholder="Agent name..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expected Delivery Date</label>
                    {isDelivered ? (
                      <div className="px-3 py-2 text-sm font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-xl">
                        {displayDate ? new Date(displayDate).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'}) : 'Not specified'}
                      </div>
                    ) : (
                      <input
                        type="date"
                        value={form.delivery_date || ''}
                        onChange={e => handleFormChange(order.po_id, 'delivery_date', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400"
                      />
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!isDelivered && (
                  <div className="px-6 pb-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => saveDelivery.mutate({ po_id: order.po_id, data: form })}
                      disabled={saveDelivery.isPending}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-colors">
                      {saved[order.po_id] ? <CheckCircle size={15} className="text-emerald-400" /> : <Save size={15} />}
                      {saved[order.po_id] ? 'Saved!' : 'Save Details'}
                    </button>
                    {order.status === 'In Progress' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: order.po_id, status: 'Shipped' })}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-semibold hover:bg-purple-600 transition-colors">
                        <Truck size={15} /> Mark as Shipped
                      </button>
                    )}
                    {order.status === 'Shipped' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: order.po_id, status: 'Delivered' })}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors">
                        <CheckCircle size={15} /> Mark as Delivered
                      </button>
                    )}
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
