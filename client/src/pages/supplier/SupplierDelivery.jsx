import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Truck, Save, CheckCircle, Loader2, Package, 
  User, Phone, Calendar, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { motion } from 'framer-motion';
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

const SHIPPING_MODES = [
  'Truck / Ground Freight',
  'Courier / Express Logistics',
  'Rail Cargo',
  'Air Freight',
  'Container Transport',
  'Local Delivery Van'
];

export default function SupplierDelivery() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const selectedPoId = location.state?.selectedPoId;
  const [forms, setForms] = useState({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['supplierDelivery'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/supplier/orders`, getAuthHeaders());
      return res.data;
    }
  });

  // Pre-fill form state whenever orders are loaded or updated
  useEffect(() => {
    if (orders && orders.length > 0) {
      const initial = {};
      orders.forEach(order => {
        const dd = order.DeliveryDetail || {};
        let formattedDate = '';
        if (order.delivery_date) {
          try {
            formattedDate = new Date(order.delivery_date).toISOString().split('T')[0];
          } catch {
            formattedDate = '';
          }
        }

        initial[order.po_id] = {
          shipping_mode: dd.shipping_mode || 'Truck / Ground Freight',
          purchase_agent_name: dd.purchase_agent_name || '',
          agent_contact: dd.agent_contact || '',
          delivery_date: formattedDate,
        };
      });
      setForms(initial);
    }
  }, [orders]);

  const saveDeliveryMutation = useMutation({
    mutationFn: async ({ po_id, data }) => {
      return axios.post(`${API_BASE}/supplier/delivery/${po_id}`, data, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplierDelivery'] });
      queryClient.invalidateQueries({ queryKey: ['supplierOrders'] });
      queryClient.invalidateQueries({ queryKey: ['supplierStats'] });
      // Redirect back to Purchase Orders page as requested
      navigate('/supplier/orders');
    }
  });

  const handleFormChange = (po_id, field, value) => {
    setForms(prev => ({
      ...prev,
      [po_id]: { ...(prev[po_id] || {}), [field]: value }
    }));
  };

  const handleSaveAndRedirect = async (po_id) => {
    const formData = forms[po_id] || {};
    await saveDeliveryMutation.mutateAsync({ po_id, data: formData });
  };

  // Active / actionable orders (not cancelled)
  const activeOrders = orders.filter(o => o.status !== 'Cancelled');

  // If redirected with selectedPoId, put that order first
  const sortedOrders = [...activeOrders].sort((a, b) => {
    if (selectedPoId && a.po_id === selectedPoId) return -1;
    if (selectedPoId && b.po_id === selectedPoId) return 1;
    return b.po_id - a.po_id;
  });

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center text-slate-400 font-medium">
        <Loader2 className="w-7 h-7 animate-spin text-purple-600 mb-2" />
        <span className="text-xs font-semibold">Loading delivery details...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-8 max-w-7xl mx-auto">
      {/* Compact Header Section */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/supplier/orders')}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              title="Back to Purchase Orders"
            >
              <ArrowLeft size={16} />
            </button>
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-xs flex items-center justify-center font-bold">
              <Truck size={15} />
            </div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">Delivery & Logistics</h1>
          </div>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mt-0.5 ml-9">
            Assign Agent, Shipping Mode & Expected Delivery Dates for Dispatch
          </p>
        </div>

        <button
          onClick={() => navigate('/supplier/orders')}
          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          <ArrowLeft size={13} /> Back to Orders
        </button>
      </div>

      {/* Selected Order Highlight Notice */}
      {selectedPoId && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-purple-900 font-bold">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-purple-600 shrink-0" />
            <span>Fulfillment Setup for Order #PO-{selectedPoId}: Assign logistics details below and click "Save Details".</span>
          </div>
        </div>
      )}

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center shadow-2xs">
          <Truck size={36} className="mx-auto text-slate-300 mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No active delivery orders</h3>
          <p className="text-xs text-slate-400 mt-1">Pending and shipped purchase orders will appear here for fulfillment setup.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedOrders.map(order => {
            const form = forms[order.po_id] || {};
            const isHighlighted = selectedPoId === order.po_id;
            const isSaved = order.status !== 'Pending' || !!order.DeliveryDetail?.purchase_agent_name;
            const totalAmount = parseFloat(order.total_amount || 0);

            return (
              <motion.div 
                key={order.po_id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl border shadow-2xs overflow-hidden transition-all ${
                  isHighlighted ? 'border-purple-400 ring-2 ring-purple-400/20' : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Compact Order Top Bar */}
                <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-purple-100 text-purple-800 rounded-lg flex items-center justify-center font-bold">
                      <Package size={15} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-sm">#PO-{order.po_id}</h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-600'}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                        Order Date: {new Date(order.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Amount</p>
                    <p className="font-extrabold text-sm text-slate-900">
                      ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="p-3.5 sm:p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Field 1: Shipping Mode */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Truck size={13} className="text-purple-600" /> Shipping Mode
                      </label>
                      <select
                        value={form.shipping_mode || ''}
                        onChange={e => handleFormChange(order.po_id, 'shipping_mode', e.target.value)}
                        disabled={isSaved}
                        className="w-full bg-slate-50/90 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-75 disabled:bg-slate-100"
                      >
                        {SHIPPING_MODES.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>

                    {/* Field 2: Agent Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <User size={13} className="text-purple-600" /> Agent Name
                      </label>
                      <input
                        type="text"
                        value={form.purchase_agent_name || ''}
                        onChange={e => handleFormChange(order.po_id, 'purchase_agent_name', e.target.value)}
                        placeholder="e.g. Rajesh Kumar"
                        disabled={isSaved}
                        className="w-full bg-slate-50/90 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>

                    {/* Field 3: Agent Contact */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Phone size={13} className="text-purple-600" /> Agent Contact
                      </label>
                      <input
                        type="text"
                        value={form.agent_contact || ''}
                        onChange={e => handleFormChange(order.po_id, 'agent_contact', e.target.value)}
                        placeholder="e.g. +91 9876543210"
                        disabled={isSaved}
                        className="w-full bg-slate-50/90 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all placeholder:text-slate-400 disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>

                    {/* Field 4: Expected Delivery Date */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                        <Calendar size={13} className="text-purple-600" /> Expected Delivery Date
                      </label>
                      <input
                        type="date"
                        value={form.delivery_date || ''}
                        onChange={e => handleFormChange(order.po_id, 'delivery_date', e.target.value)}
                        disabled={isSaved}
                        className="w-full bg-slate-50/90 border border-slate-200/90 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all disabled:opacity-75 disabled:bg-slate-100"
                      />
                    </div>
                  </div>

                  {/* Single Action Row: Save Details Button shown ONLY when NOT saved */}
                  <div className="pt-2 border-t border-slate-100 flex justify-end">
                    {isSaved ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                        <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                        <span>Logistics Details Saved</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSaveAndRedirect(order.po_id)}
                        disabled={saveDeliveryMutation.isPending}
                        className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-lg shadow-xs transition-all hover:-translate-y-0.5 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                      >
                        {saveDeliveryMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin text-white" />
                        ) : (
                          <Save size={14} className="text-white" />
                        )}
                        <span>Save Details</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
