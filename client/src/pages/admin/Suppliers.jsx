import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Plus, Search, Filter, Edit, Trash2, CheckCircle2, AlertCircle, 
  Clock, Package, IndianRupee, CreditCard, Building2, Phone, Mail, MapPin, 
  ChevronRight, X, Eye, Printer, FileText, ArrowRight, ShieldCheck
} from 'lucide-react';
import InvoiceModal from '../../components/InvoiceModal';
import { API_BASE } from '../../config/api';
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export default function Suppliers() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('suppliers'); // 'suppliers' | 'orders'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');

  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [preSelectedSupplierId, setPreSelectedSupplierId] = useState('');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPOForPayment, setSelectedPOForPayment] = useState(null);

  const [isPODetailsModalOpen, setIsPODetailsModalOpen] = useState(false);
  const [selectedPODetails, setSelectedPODetails] = useState(null);

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedPODelivery, setSelectedPODelivery] = useState(null);

  const handleOpenDeliveryModal = (po) => {
    setSelectedPODelivery(po);
    setIsDeliveryModalOpen(true);
  };

  // Queries
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['admin-suppliers'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/suppliers`, getAuthHeaders());
      return res.data;
    }
  });

  const { data: purchaseOrders = [], isLoading: isLoadingPOs } = useQuery({
    queryKey: ['admin-purchase-orders'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/purchases`, getAuthHeaders());
      return res.data;
    }
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products-list'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/products`, getAuthHeaders());
      return res.data;
    }
  });

  // Purchase Order Mutations
  const poMutation = useMutation({
    mutationFn: async (poData) => {
      return axios.post(`${API_BASE}/purchases`, poData, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-purchase-orders']);
      queryClient.invalidateQueries(['admin-suppliers']);
      queryClient.invalidateQueries(['admin-products-list']);
      setIsPOModalOpen(false);
    },
    onError: (err) => {
      console.error('poMutation error:', err);
      alert(err.response?.data?.message || 'Failed to create purchase order. Please check item details and try again.');
    }
  });

  const updatePOStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return axios.put(`${API_BASE}/purchases/${id}/status`, { status }, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-purchase-orders']);
      queryClient.invalidateQueries(['admin-suppliers']);
      queryClient.invalidateQueries(['admin-products-list']);
    }
  });

  const updatePOPaymentMutation = useMutation({
    mutationFn: async ({ id, payment_status, amount_paid, payment_method, notes }) => {
      return axios.put(`${API_BASE}/purchases/${id}/payment`, { payment_status, amount_paid, payment_method, notes }, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-purchase-orders']);
      queryClient.invalidateQueries(['admin-suppliers']);
      setIsPaymentModalOpen(false);
      setSelectedPOForPayment(null);
    }
  });

  const deletePOMutation = useMutation({
    mutationFn: async (id) => {
      return axios.delete(`${API_BASE}/purchases/${id}`, getAuthHeaders());
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-purchase-orders']);
      queryClient.invalidateQueries(['admin-suppliers']);
    }
  });

  // Calculations & KPIs
  const totalSuppliersCount = suppliers.length;
  const totalOrdersCount = purchaseOrders.length;
  const pendingOrdersCount = purchaseOrders.filter(p => p.status === 'Pending' || p.status === 'Shipped').length;
  const totalSpentValue = purchaseOrders.reduce((sum, p) => sum + (parseFloat(p.total_amount) || 0), 0);
  const totalPaidValue = purchaseOrders.reduce((sum, p) => sum + (parseFloat(p.amount_paid) || 0), 0);
  const totalPendingBalance = Math.max(0, totalSpentValue - totalPaidValue);

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter(s => {
    const query = searchTerm.toLowerCase();
    const phones = (s.SupplierContacts || []).map(c => c.phone).join(' ');
    return (
      (s.supplier_name || '').toLowerCase().includes(query) ||
      (s.email || '').toLowerCase().includes(query) ||
      (s.city || '').toLowerCase().includes(query) ||
      phones.includes(query)
    );
  });

  // Filtered POs
  const filteredPOs = purchaseOrders.filter(po => {
    const query = searchTerm.toLowerCase();
    const matchSearch = (
      `po-${po.po_id}`.toLowerCase().includes(query) ||
      (po.supplier_name || '').toLowerCase().includes(query) ||
      (po.PurchaseOrderDetails || []).some(d => (d.Product?.product_name || '').toLowerCase().includes(query))
    );

    const matchStatus = statusFilter === 'All' || po.status === statusFilter;
    const matchPayment = paymentFilter === 'All' || po.payment_status === paymentFilter;

    return matchSearch && matchStatus && matchPayment;
  });

  const handleOpenAddSupplier = () => {
    setEditingSupplier(null);
    setIsSupplierModalOpen(true);
  };

  const handleOpenEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierModalOpen(true);
  };

  const handleOpenCreatePO = (supplierId = '') => {
    setPreSelectedSupplierId(supplierId);
    setIsPOModalOpen(true);
  };

  const handleOpenPaymentModal = (po) => {
    setSelectedPOForPayment(po);
    setIsPaymentModalOpen(true);
  };

  const handleOpenPODetails = (po) => {
    setSelectedPODetails(po);
    setIsPODetailsModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <Truck size={18} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Suppliers & Purchase Orders</h1>
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">
            REFILL STORE STOCK VIA BULK ORDERS & TRACK SUPPLIER PAYMENTS
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreatePO()}
            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>Create Bulk Order</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Suppliers</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalSuppliersCount}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Registered active vendors</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bulk Orders</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalOrdersCount}</p>
            <p className="text-xs text-amber-600 font-semibold mt-1">{pendingOrdersCount} pending / in transit</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Purchase Spent</p>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{totalSpentValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">₹{totalPaidValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} paid</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Balance</p>
            <p className="text-2xl font-black text-rose-600 mt-1">₹{totalPendingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Outstanding supplier payables</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      {/* Tabs & Filters Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'suppliers' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Suppliers Directory ({suppliers.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'orders' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Purchase Orders & Payments ({purchaseOrders.length})
          </button>
        </div>

        {/* Search & Filter Inputs */}
        <div className="flex flex-wrap items-center gap-3 flex-1 max-w-xl justify-end">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder={activeTab === 'suppliers' ? "Search suppliers, email, phone..." : "Search PO #, supplier, product..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 font-medium"
            />
          </div>

          {activeTab === 'orders' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="All">All Order Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              >
                <option value="All">All Payment Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Main Content Sections */}
      {activeTab === 'suppliers' ? (
        /* TAB 1: SUPPLIERS DIRECTORY */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoadingSuppliers ? (
            <div className="p-12 text-center text-slate-400 font-medium">Loading suppliers directory...</div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No suppliers found</h3>
              <p className="text-xs text-slate-400 mt-1">Add your first supplier or clear search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="py-3.5 px-6">Supplier Details</th>
                    <th className="py-3.5 px-6">Contact Phone</th>
                    <th className="py-3.5 px-6">Location</th>
                    <th className="py-3.5 px-6">Orders & Spent</th>
                    <th className="py-3.5 px-6">Payment Balance</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredSuppliers.map((supplier) => {
                    const phones = supplier.SupplierContacts || [];
                    return (
                      <tr key={supplier.supplier_id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 font-extrabold flex items-center justify-center shrink-0">
                              {supplier.supplier_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-extrabold text-slate-900 leading-snug">{supplier.supplier_name}</p>
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Mail size={12} className="text-slate-400 shrink-0" />
                                {supplier.email || 'No email registered'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-medium text-slate-700">
                          {phones.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {phones.map((p, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-semibold">
                                  <Phone size={10} className="text-slate-400" /> {p.phone}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No phone contact</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-slate-600 text-xs font-semibold">
                          <div className="flex items-start gap-1">
                            <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-slate-800 font-bold">{supplier.city ? `${supplier.city}, ${supplier.state || ''}` : 'Location N/A'}</p>
                              {supplier.pincode && <p className="text-slate-400 text-[11px]">Pin: {supplier.pincode}</p>}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <p className="font-extrabold text-slate-900">{supplier.total_orders} orders</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            ₹{supplier.total_spent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </p>
                        </td>

                        <td className="py-4 px-6">
                          {supplier.pending_balance > 0 ? (
                            <div>
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Due: ₹{supplier.pending_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                              <p className="text-[11px] text-slate-400 font-medium mt-1">Paid: ₹{supplier.total_paid.toLocaleString('en-IN')}</p>
                            </div>
                          ) : (
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Fully Settled
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => handleOpenCreatePO(supplier.supplier_id)}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1"
                              title="Create Purchase Order to refill store stock"
                            >
                              + Order Stock
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: PURCHASE ORDERS & PAYMENTS */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoadingPOs ? (
            <div className="p-12 text-center text-slate-400 font-medium">Loading purchase orders...</div>
          ) : filteredPOs.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No purchase orders found</h3>
              <p className="text-xs text-slate-400 mt-1">Create your first bulk purchase order or adjust filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4">PO # & Date</th>
                    <th className="py-3.5 px-4">Supplier</th>
                    <th className="py-3.5 px-4">Items Breakdown</th>
                    <th className="py-3.5 px-4">Total Amount</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-3">Payment Status</th>
                    <th className="py-3.5 px-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredPOs.map((po) => {
                    const totalItemsCount = po.PurchaseOrderDetails.reduce((sum, d) => sum + (parseInt(d.quantity_ordered) || 0), 0);
                    
                    return (
                      <tr key={po.po_id} className="hover:bg-slate-50/60 transition-colors group">
                        <td className="py-4 px-4">
                          <p className="font-extrabold text-slate-900">#PO-{po.po_id}</p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {new Date(po.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </td>

                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800">{po.supplier_name}</p>
                          <p className="text-xs text-slate-400 font-medium">{po.supplier_email || 'No email'}</p>
                        </td>

                        <td className="py-4 px-4">
                          <div className="cursor-pointer" onClick={() => handleOpenPODetails(po)}>
                            <span className="font-bold text-slate-900 hover:text-rose-600 transition-colors">
                              {po.PurchaseOrderDetails.length} items ({totalItemsCount} units)
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-extrabold text-slate-900">
                          ₹{parseFloat(po.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                              po.status === 'Delivered' || po.status === 'Received'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : po.status === 'Shipped'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : po.status === 'Cancelled'
                                ? 'bg-slate-100 text-slate-600 border-slate-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {po.status === 'Delivered' || po.status === 'Received' ? '✅ Delivered' : po.status === 'Shipped' ? '🚚 Shipped' : po.status === 'Cancelled' ? '❌ Cancelled' : '⏳ Pending'}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-3">
                          <div>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                              po.payment_status === 'Paid'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : po.payment_status === 'Partial'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {po.payment_status}
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium mt-1">
                              Paid: ₹{parseFloat(po.amount_paid || 0).toLocaleString('en-IN')}
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-3 text-left">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenPaymentModal(po)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                              title="Record Supplier Payment"
                            >
                              <CreditCard size={12} /> Pay
                            </button>
                            <button
                              onClick={() => handleOpenDeliveryModal(po)}
                              className="p-1.5 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors shrink-0"
                              title="View Fulfillment & Delivery Details"
                            >
                              <Truck size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenPODetails(po)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                              title="View Invoice Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete PO #${po.po_id}?`)) {
                                  deletePOMutation.mutate(po.po_id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                              title="Delete Order"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE BULK PURCHASE ORDER */}
      <AnimatePresence>
        {isPOModalOpen && (
          <CreatePOModal
            isOpen={isPOModalOpen}
            onClose={() => setIsPOModalOpen(false)}
            suppliers={suppliers}
            products={products}
            initialSupplierId={preSelectedSupplierId}
            onSubmit={(poData) => poMutation.mutate(poData)}
            isLoading={poMutation.isLoading}
          />
        )}
      </AnimatePresence>

      {/* MODAL 2: RECORD PAYMENT */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedPOForPayment && (
          <PaymentModal
            isOpen={isPaymentModalOpen}
            onClose={() => setIsPaymentModalOpen(false)}
            po={selectedPOForPayment}
            onSubmit={(paymentData) => updatePOPaymentMutation.mutate({ id: selectedPOForPayment.po_id, ...paymentData })}
            isLoading={updatePOPaymentMutation.isLoading}
          />
        )}
      </AnimatePresence>

      {/* MODAL 3: PO INVOICE DETAILS */}
      <AnimatePresence>
        {isPODetailsModalOpen && selectedPODetails && (
          <InvoiceModal
            order={selectedPODetails}
            onClose={() => setIsPODetailsModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* MODAL 4: LOGISTICS & DELIVERY DETAILS */}
      <AnimatePresence>
        {isDeliveryModalOpen && selectedPODelivery && (
          <DeliveryDetailsModal
            isOpen={isDeliveryModalOpen}
            onClose={() => setIsDeliveryModalOpen(false)}
            po={selectedPODelivery}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ========================================================================= */
/* MODAL COMPONENTS                                                          */
/* ========================================================================= */

// CREATE BULK PO MODAL
function CreatePOModal({ isOpen, onClose, suppliers, products, initialSupplierId, onSubmit, isLoading }) {
  const [supplierId, setSupplierId] = useState(initialSupplierId || (suppliers[0]?.supplier_id || ''));
  const [status, setStatus] = useState('Pending');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  
  const [items, setItems] = useState([
    { product_id: products[0]?.product_id || '', quantity_ordered: 50, unit_price: products[0]?.unit_price || 0 }
  ]);

  // Ensure default supplier is set when suppliers load
  useEffect(() => {
    if (!supplierId && suppliers && suppliers.length > 0) {
      setSupplierId(suppliers[0].supplier_id);
    }
  }, [suppliers, supplierId]);

  // Ensure line items get default product_id when products load
  useEffect(() => {
    if (products && products.length > 0) {
      setItems(prevItems => prevItems.map(item => {
        if (!item.product_id) {
          const firstProd = products[0];
          return {
            ...item,
            product_id: firstProd.product_id,
            unit_price: firstProd.unit_price || 0
          };
        }
        return item;
      }));
    }
  }, [products]);

  const handleAddItem = () => {
    const firstProd = products[0];
    setItems([...items, { product_id: firstProd?.product_id || '', quantity_ordered: 10, unit_price: firstProd?.unit_price || 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    if (field === 'product_id') {
      const prod = products.find(p => p.product_id === parseInt(value));
      updated[index].product_id = parseInt(value);
      if (prod) updated[index].unit_price = prod.unit_price || 0;
    } else if (field === 'quantity_ordered') {
      updated[index].quantity_ordered = Math.max(1, parseInt(value) || 0);
    }
    setItems(updated);
  };

  const getBulkDiscountPct = (qty) => {
    const q = parseInt(qty) || 0;
    if (q >= 100) return 20;
    if (q >= 50) return 15;
    if (q >= 25) return 10;
    if (q >= 10) return 5;
    return 0;
  };

  const grossItemsSubtotal = items.reduce((sum, item) => {
    const prod = products.find(p => p.product_id === parseInt(item.product_id));
    const mrp = parseFloat(prod?.unit_price || item.unit_price || 0);
    const qty = parseInt(item.quantity_ordered) || 0;
    return sum + (qty * mrp);
  }, 0);

  const totalBulkDiscount = items.reduce((sum, item) => {
    const prod = products.find(p => p.product_id === parseInt(item.product_id));
    const mrp = parseFloat(prod?.unit_price || item.unit_price || 0);
    const qty = parseInt(item.quantity_ordered) || 0;
    const discPct = getBulkDiscountPct(qty);
    const gross = qty * mrp;
    const effective = gross * (1 - discPct / 100);
    return sum + (gross - effective);
  }, 0);

  const netItemsSubtotal = grossItemsSubtotal - totalBulkDiscount;

  const getFeePct = (method) => {
    if (method === 'Credit Card') return 2.0;
    if (method === 'Net Banking') return 1.5;
    if (method === 'Debit Card') return 1.0;
    if (method === 'UPI') return 0.5;
    return 0;
  };
  const feePct = getFeePct(paymentMethod);
  const processingFee = (netItemsSubtotal * feePct) / 100;
  const grandTotal = netItemsSubtotal + processingFee;

  const handleSubmit = (e) => {
    e.preventDefault();
    const effectiveSupplierId = supplierId || suppliers[0]?.supplier_id;
    if (!effectiveSupplierId) {
      alert('Please select a valid supplier');
      return;
    }

    const validItems = items.filter(i => i.product_id && parseInt(i.product_id) > 0);
    if (validItems.length === 0) {
      alert('Please select at least one valid product');
      return;
    }

    const paidVal = parseFloat(amountPaid) || 0;
    if (paidVal <= 0) {
      alert('Initial advance payment is required when placing a purchase order. Please enter an initial payment amount greater than ₹0.');
      return;
    }

    if (paidVal > grandTotal) {
      alert(`Initial payment amount cannot exceed the Total Bulk Order Value of ₹${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}.`);
      return;
    }

    onSubmit({
      supplier_id: parseInt(effectiveSupplierId),
      status,
      payment_status: paymentStatus,
      amount_paid: paidVal,
      payment_method: paymentMethod,
      notes,
      details: validItems.map(i => {
        const prod = products.find(p => p.product_id === parseInt(i.product_id));
        const mrp = parseFloat(prod?.unit_price || i.unit_price || 0);
        const qty = parseInt(i.quantity_ordered) || 1;
        const discPct = getBulkDiscountPct(qty);
        const effectivePrice = Math.round(mrp * (1 - discPct / 100) * 100) / 100;
        return {
          product_id: parseInt(i.product_id),
          quantity_ordered: qty,
          unit_price: effectivePrice
        };
      })
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-5xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg">Create Bulk Purchase Order</h3>
            <p className="text-xs text-slate-500 font-medium">Issue purchase order with tiered wholesale bulk discounts</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Select Supplier *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} className="w-full h-[42px] px-3.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-xs">
                {suppliers.map(s => (
                  <option key={s.supplier_id} value={s.supplier_id}>{s.supplier_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Order Status</label>
              <div className="h-[42px] px-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs font-extrabold text-amber-900 flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
                <span>Pending</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Payment Method</label>
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full h-[42px] px-3.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-xs">
                <option value="UPI">📱 UPI (0.5% Fee)</option>
                <option value="Cash">💵 CASH (0% Fee)</option>
                <option value="Debit Card">💳 DEBIT Card (1.0% Fee)</option>
                <option value="Credit Card">💳 CREDIT Card (2.0% Fee)</option>
                <option value="Net Banking">🏦 Net Banking (1.5% Fee)</option>
              </select>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">Product Line Items (Bulk Quantities & Tiered Discounts)</label>
              <button type="button" onClick={handleAddItem} className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">+ Add Product</button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => {
                const prod = products.find(p => p.product_id === parseInt(item.product_id));
                const mrp = parseFloat(prod?.unit_price || 0);
                const qty = parseInt(item.quantity_ordered) || 0;
                const discPct = getBulkDiscountPct(qty);
                const effectivePrice = mrp * (1 - discPct / 100);
                const lineTotal = qty * effectivePrice;
                const savings = (qty * mrp) - lineTotal;

                return (
                  <div key={idx} className="flex items-center gap-4 p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl shadow-2xs">
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Product</label>
                      <select 
                        value={item.product_id} 
                        onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)} 
                        className="w-full h-9 px-3 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 bg-white truncate focus:outline-none focus:border-rose-400"
                      >
                        <option value="">-- Select Product --</option>
                        {products.map(p => (
                          <option key={p.product_id} value={p.product_id}>{p.product_name} (Stock: {p.Inventory?.current_stock || 0})</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-28 shrink-0">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">MRP</label>
                      <div className="h-9 px-3 bg-slate-100/90 border border-slate-200 rounded-lg text-xs font-black text-slate-700 flex items-center justify-center">
                        ₹{mrp.toFixed(2)}
                      </div>
                    </div>

                    <div className="w-24 shrink-0">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Qty</label>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity_ordered} 
                        onChange={(e) => handleItemChange(idx, 'quantity_ordered', e.target.value)} 
                        placeholder="Qty" 
                        className="w-full h-9 px-2 border border-slate-200 rounded-lg text-xs font-black text-slate-900 text-center bg-white focus:outline-none focus:border-rose-400" 
                      />
                    </div>

                    <div className="w-32 shrink-0 text-right">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Wholesale Rate</label>
                      <div>
                        <div className="text-xs font-black text-slate-900">₹{effectivePrice.toFixed(2)}</div>
                        {discPct > 0 ? (
                          <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200/80 inline-block mt-0.5">
                            🏷️ {discPct}% OFF
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-400 block mt-0.5">Standard Rate</span>
                        )}
                      </div>
                    </div>

                    <div className="w-36 shrink-0 text-right">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Line Total</label>
                      <div className="text-xs font-black text-slate-900">
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </div>
                      {savings > 0 && (
                        <span className="text-[9px] font-bold text-emerald-600 block mt-0.5">
                          Save ₹{savings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>

                    {items.length > 1 && (
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg shrink-0 mt-4">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Info & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                Initial Advance Payment (₹) * <span className="text-rose-600 font-bold">(Mandatory &gt; ₹0)</span>
              </label>
              <div className="flex gap-1.5">
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  required
                  value={amountPaid} 
                  onChange={(e) => {
                    const val = e.target.value;
                    setAmountPaid(val);
                    const paidVal = parseFloat(val) || 0;
                    if (paidVal >= grandTotal && grandTotal > 0) setPaymentStatus('Paid');
                    else if (paidVal > 0) setPaymentStatus('Partial');
                    else setPaymentStatus('Pending');
                  }} 
                  placeholder="e.g. 1000.00" 
                  className="flex-1 h-[42px] px-3 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-xs" 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    setAmountPaid((grandTotal * 0.1).toFixed(2));
                    setPaymentStatus('Partial');
                  }} 
                  className="h-[42px] px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-all border border-slate-200 shrink-0"
                >
                  10% Adv
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setAmountPaid((grandTotal * 0.5).toFixed(2));
                    setPaymentStatus('Partial');
                  }} 
                  className="h-[42px] px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-xl transition-all border border-slate-200 shrink-0"
                >
                  50% Adv
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setAmountPaid(grandTotal.toFixed(2));
                    setPaymentStatus('Paid');
                  }} 
                  className="h-[42px] px-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
                >
                  Full
                </button>
              </div>
              {(!amountPaid || parseFloat(amountPaid) <= 0) && (
                <p className="text-[10px] font-bold text-rose-600 mt-1">⚠️ Initial advance payment is mandatory when placing a purchase order.</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Payment Status</label>
              <div className={`h-[42px] px-3.5 border rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-xs ${
                paymentStatus === 'Paid' 
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                  : paymentStatus === 'Partial' 
                  ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  paymentStatus === 'Paid' ? 'bg-emerald-500' : paymentStatus === 'Partial' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></span>
                <span>{paymentStatus === 'Paid' ? 'Paid (Fully Settled)' : paymentStatus === 'Partial' ? 'Partial Payment' : 'Initial Payment Required'}</span>
              </div>
            </div>
          </div>

          {/* Grand Total Footer Box */}
          <div className="bg-rose-50/70 border border-rose-200/80 p-5 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Gross Items Subtotal (MRP):</span>
              <span className="font-bold text-slate-800">₹{grossItemsSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {totalBulkDiscount > 0 && (
              <div className="flex justify-between items-center text-xs font-bold text-emerald-700">
                <span>Wholesale Volume Discount:</span>
                <span>-₹{totalBulkDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
              <span>Processing Fee ({paymentMethod} @ {feePct}%):</span>
              <span className="font-bold text-slate-800">₹{processingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center pt-2.5 border-t border-rose-200/80">
              <div>
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Bulk Order Value</p>
                <p className="text-2xl font-black text-rose-950">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="text-right space-y-0.5">
                <p className="text-xs font-semibold text-slate-600">Total Bulk Units: {items.reduce((s, i) => s + (parseInt(i.quantity_ordered) || 0), 0)}</p>
                {totalBulkDiscount > 0 && (
                  <p className="text-[10px] font-extrabold text-emerald-700">Total Savings: ₹{totalBulkDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors">
              {isLoading ? 'Creating PO...' : 'Issue Purchase Order'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// RECORD PAYMENT MODAL
function PaymentModal({ isOpen, onClose, po, onSubmit, isLoading }) {
  const totalAmount = parseFloat(po.total_amount || 0);
  const currentPaid = parseFloat(po.amount_paid || 0);
  const balance = Math.max(0, totalAmount - currentPaid);

  const [payNowAmount, setPayNowAmount] = useState(balance > 0 ? balance.toFixed(2) : '0.00');
  const [notes, setNotes] = useState(po.notes || '');

  const originalPaymentMethod = po.payment_method || 'Cash';

  const numericPayNow = parseFloat(payNowAmount) || 0;
  const newCumulativePaid = Math.min(totalAmount, currentPaid + numericPayNow);
  const newBalanceRemaining = Math.max(0, totalAmount - newCumulativePaid);

  let newPaymentStatus = 'Pending';
  if (newCumulativePaid >= totalAmount && totalAmount > 0) {
    newPaymentStatus = 'Paid';
  } else if (newCumulativePaid > 0) {
    newPaymentStatus = 'Partial';
  }

  const handlePayRemainingFull = () => {
    setPayNowAmount(balance.toFixed(2));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (numericPayNow <= 0) {
      alert('Please enter a payment amount greater than ₹0.');
      return;
    }
    if (numericPayNow > balance + 0.01) {
      alert(`Payment amount (₹${numericPayNow.toFixed(2)}) cannot exceed the outstanding balance of ₹${balance.toFixed(2)}.`);
      return;
    }

    const finalAmountPaid = Math.round((currentPaid + numericPayNow) * 100) / 100;

    onSubmit({
      payment_status: newPaymentStatus,
      amount_paid: finalAmountPaid,
      payment_method: originalPaymentMethod,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h3 className="font-extrabold text-slate-900 text-lg">Record Supplier Payment</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-bold">
              <span>ORDER ID: #PO-{po.po_id}</span>
              <span>{po.supplier_name}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Total Order Value:</span>
              <span className="font-bold text-slate-900">₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-emerald-700">
              <span>Already Paid:</span>
              <span className="font-extrabold">₹{currentPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs font-extrabold text-rose-600 border-t border-slate-200 pt-1.5">
              <span>Outstanding Balance:</span>
              <span>₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
              Payment Amount to Pay Now (₹) *
            </label>
            <div className="flex gap-2">
              <input 
                type="number" 
                step="0.01" 
                max={balance}
                required 
                value={payNowAmount} 
                onChange={(e) => setPayNowAmount(e.target.value)} 
                className="flex-1 h-[42px] px-3.5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 shadow-xs" 
              />
              <button 
                type="button" 
                onClick={handlePayRemainingFull} 
                className="h-[42px] px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
              >
                Pay Full Balance
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              Fills the exact remaining balance of <strong className="text-slate-800">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Updated Payment Status</label>
            <div className={`h-[42px] px-3.5 border rounded-xl text-xs font-extrabold flex items-center justify-between shadow-xs ${
              newPaymentStatus === 'Paid' 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : newPaymentStatus === 'Partial' 
                ? 'bg-amber-50/80 border-amber-200 text-amber-900' 
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  newPaymentStatus === 'Paid' ? 'bg-emerald-500' : newPaymentStatus === 'Partial' ? 'bg-amber-500' : 'bg-slate-400'
                }`}></span>
                <span>{newPaymentStatus === 'Paid' ? 'Paid (Fully Settled)' : newPaymentStatus === 'Partial' ? 'Partial Payment' : 'Pending (Unpaid)'}</span>
              </div>
              <span className="text-[10px] font-bold opacity-75">
                New Total Paid: ₹{newCumulativePaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">Payment Method</label>
            <div className="h-[42px] px-3.5 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 flex items-center shadow-xs">
              <span>{originalPaymentMethod}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors">
              {isLoading ? 'Updating...' : 'Save Payment Record'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// PRINT PO INVOICE FUNCTION
function handlePrintPOInvoice(po) {
  const totalAmount = parseFloat(po.total_amount || 0);
  const amountPaid = parseFloat(po.amount_paid || 0);
  const balance = Math.max(0, totalAmount - amountPaid);
  const dateFormatted = po.order_date ? new Date(po.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A';

  let grossSubtotal = 0;
  let itemsNetSubtotal = 0;

  const itemsList = (po.PurchaseOrderDetails || []).map(detail => {
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
      product_name: detail.Product?.product_name || `Product #${detail.product_id}`,
      qty,
      mrp,
      effectiveUnitPrice,
      lineTotal,
      discPct
    };
  });

  const totalBulkDiscount = Math.max(0, grossSubtotal - itemsNetSubtotal);
  const processingFee = Math.max(0, Math.round((totalAmount - itemsNetSubtotal) * 100) / 100);

  const itemsRowsHtml = itemsList.map((item, idx) => `
    <tr>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; font-weight: 700; color: #0f172a;">
        ${idx + 1}. ${item.product_name}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: center; font-weight: 600; color: #334155;">
        ${item.qty} units
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; color: #64748b;">
        ₹${item.mrp.toFixed(2)}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 700; color: #0f172a;">
        ₹${item.effectiveUnitPrice.toFixed(2)}
        ${item.discPct > 0 ? `<br/><span style="font-size: 10px; color: #047857; font-weight: 800;">(${item.discPct}% OFF)</span>` : ''}
      </td>
      <td style="padding: 10px 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; text-align: right; font-weight: 900; color: #0f172a;">
        ₹${item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </td>
    </tr>
  `).join('');

  const printHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Purchase Order Invoice #PO-${po.po_id}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
          * { box-sizing: border-box; }
          body { font-family: 'Inter', system-ui, sans-serif; margin: 0; padding: 30px; color: #0f172a; background-color: #ffffff; }
          .invoice-card { max-width: 800px; margin: auto; border: 1px solid #cbd5e1; padding: 36px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e11d48; padding-bottom: 18px; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 900; color: #e11d48; letter-spacing: -0.5px; }
          .brand span { color: #0f172a; }
          .tagline { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
          .invoice-title { text-align: right; }
          .invoice-title h2 { margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; }
          .po-number { font-family: monospace; font-size: 16px; color: #e11d48; font-weight: 800; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; background: #fff1f2; padding: 18px 20px; border-radius: 12px; border: 1px solid #fecdd3; }
          .meta-col label { display: block; font-size: 10px; font-weight: 900; color: #9f1239; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .meta-col p { margin: 0; font-size: 14px; color: #0f172a; font-weight: 800; }
          .meta-col .subtext { font-size: 12px; color: #475569; font-weight: 500; margin-top: 2px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background-color: #f8fafc; color: #475569; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; padding: 10px 12px; text-align: left; border-bottom: 2px solid #cbd5e1; }
          .totals-wrapper { display: flex; justify-content: flex-end; }
          .totals-box { width: 360px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .totals-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #475569; font-weight: 600; }
          .totals-row.discount { color: #047857; font-weight: 700; }
          .totals-row.grand-total { border-top: 2px solid #e11d48; margin-top: 8px; padding-top: 10px; font-size: 16px; font-weight: 900; color: #0f172a; }
          .totals-row.paid { color: #047857; font-weight: 800; }
          .totals-row.balance { font-size: 15px; font-weight: 900; color: ${balance > 0 ? '#e11d48' : '#047857'}; border-top: 1px solid #cbd5e1; margin-top: 6px; padding-top: 8px; }
          .footer { margin-top: 36px; text-align: center; border-top: 1px dashed #cbd5e1; padding-top: 20px; font-size: 12px; color: #64748b; }
          @media print { body { padding: 0; } .invoice-card { border: none; box-shadow: none; padding: 0; max-width: 100%; } }
        </style>
      </head>
      <body>
        <div class="invoice-card">
          <div class="header">
            <div>
              <div class="brand">Inventory<span>Pro</span></div>
              <div class="tagline">Retail Store & Stock Management</div>
            </div>
            <div class="invoice-title">
              <h2>PURCHASE ORDER INVOICE</h2>
              <div class="po-number">#PO-${po.po_id}</div>
              <div style="font-size: 11px; color: #64748b; margin-top: 4px;">Date: ${dateFormatted}</div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-col">
              <label>Supplier Information</label>
              <p>${po.supplier_name}</p>
              <div class="subtext">${po.supplier_email || 'No email registered'}</div>
            </div>
            <div class="meta-col" style="text-align: right;">
              <label>Order & Payment Details</label>
              <p>Order Status: ${po.status}</p>
              <div class="subtext">Payment Status: <strong>${po.payment_status}</strong></div>
              <div class="subtext">Payment Method: ${po.payment_method || 'Cash'}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Catalog MRP</th>
                <th style="text-align: right;">Wholesale Rate</th>
                <th style="text-align: right;">Line Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <div class="totals-wrapper">
            <div class="totals-box">
              <div class="totals-row">
                <span>Gross Items Subtotal (MRP):</span>
                <span>₹${grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              ${totalBulkDiscount > 0 ? `
                <div class="totals-row discount">
                  <span>Wholesale Volume Discount:</span>
                  <span>-₹${totalBulkDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ` : ''}
              ${processingFee > 0 ? `
                <div class="totals-row">
                  <span>Processing Fee (${po.payment_method || 'Fee'}):</span>
                  <span>+₹${processingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              ` : ''}
              <div class="totals-row grand-total">
                <span>Total Order Amount:</span>
                <span>₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="totals-row paid">
                <span>Total Amount Paid:</span>
                <span>₹${amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div class="totals-row balance">
                <span>Outstanding Balance:</span>
                <span>₹${balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            Thank you for your business! This is an official system generated Purchase Order Invoice.
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank', 'width=900,height=800');
  if (printWindow) {
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
}

// PO INVOICE DETAILS MODAL
function PODetailsModal({ isOpen, onClose, po }) {
  const totalAmount = parseFloat(po.total_amount || 0);
  const amountPaid = parseFloat(po.amount_paid || 0);
  const balance = Math.max(0, totalAmount - amountPaid);

  let grossSubtotal = 0;
  let itemsNetSubtotal = 0;

  const itemsList = (po.PurchaseOrderDetails || []).map(detail => {
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
      product_name: detail.Product?.product_name || `Product #${detail.product_id}`,
      qty,
      mrp,
      effectiveUnitPrice,
      lineTotal,
      discPct
    };
  });

  const totalBulkDiscount = Math.max(0, grossSubtotal - itemsNetSubtotal);
  const processingFee = Math.max(0, Math.round((totalAmount - itemsNetSubtotal) * 100) / 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="text-rose-600" size={20} />
            <h3 className="font-extrabold text-slate-900 text-lg">Purchase Order Invoice #PO-{po.po_id}</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handlePrintPOInvoice(po)} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs">
              <Printer size={14} /> Print Invoice
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Header Info */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div>
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Supplier Info</p>
              <h4 className="text-lg font-black text-slate-900 mt-0.5">{po.supplier_name}</h4>
              <p className="text-xs text-slate-500 font-medium">{po.supplier_email || 'No email registered'}</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">Order Metadata</p>
              <p className="text-xs font-bold text-slate-700 mt-0.5">Date: {new Date(po.order_date).toLocaleDateString('en-IN')}</p>
              <p className="text-xs font-extrabold text-emerald-600">Status: {po.status}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Payment Method: {po.payment_method || 'Cash'}</p>
            </div>
          </div>

          {/* Delivery & Logistics Details (Updated by Supplier) */}
          {(po.DeliveryDetail?.shipping_mode || po.DeliveryDetail?.purchase_agent_name || po.delivery_date) && (
            <div className="bg-purple-50/80 border border-purple-200/80 p-4 rounded-2xl space-y-1">
              <p className="text-[10px] font-extrabold uppercase text-purple-900 tracking-wider">🚚 Logistics & Fulfillment (Updated by Supplier)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-bold text-slate-800 pt-1">
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Shipping Mode</span>
                  <span>{po.DeliveryDetail?.shipping_mode || 'Transport'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Purchase Agent Name</span>
                  <span>{po.DeliveryDetail?.purchase_agent_name || 'Assigned Agent'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Expected Delivery Date</span>
                  <span>{po.delivery_date ? new Date(po.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase">Delivered Date</span>
                  <span className={po.status === 'Delivered' || po.status === 'Received' ? 'text-emerald-700 font-extrabold' : 'text-slate-400'}>
                    {(po.status === 'Delivered' || po.status === 'Received') && po.delivery_date
                      ? new Date(po.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'In Transit / Pending'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Items Table */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">Itemized Breakdown</h4>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 font-extrabold uppercase text-slate-500 text-[11px]">
                    <th className="py-3 px-4">Product Name</th>
                    <th className="py-3 px-4 text-center">Quantity</th>
                    <th className="py-3 px-4 text-right">Catalog MRP</th>
                    <th className="py-3 px-4 text-right">Wholesale Rate</th>
                    <th className="py-3 px-4 text-right">Line Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {itemsList.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{item.product_name}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-slate-800">{item.qty} units</td>
                      <td className="py-3.5 px-4 text-right text-slate-500">₹{item.mrp.toFixed(2)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold text-slate-900">₹{item.effectiveUnitPrice.toFixed(2)}</span>
                        {item.discPct > 0 && (
                          <span className="block text-[10px] font-extrabold text-emerald-700">({item.discPct}% OFF)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">₹{item.lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Summary Box */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-2.5 shadow-2xs">
            <div className="flex justify-between text-xs font-semibold text-slate-600">
              <span>Gross Items Subtotal (MRP):</span>
              <span className="font-bold text-slate-800">₹{grossSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            {totalBulkDiscount > 0 && (
              <div className="flex justify-between text-xs font-bold text-emerald-700">
                <span>Wholesale Volume Discount:</span>
                <span>-₹{totalBulkDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            {processingFee > 0 && (
              <div className="flex justify-between text-xs font-semibold text-slate-600">
                <span>Processing Fee ({po.payment_method || 'Fee'}):</span>
                <span className="font-bold text-slate-800">+₹{processingFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black text-slate-900 border-t border-slate-200 pt-2.5">
              <span>Total Order Amount:</span>
              <span>₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-xs font-extrabold text-emerald-700">
              <span>Total Amount Paid ({po.payment_method || 'Payment'}):</span>
              <span>₹{amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between text-base font-black text-slate-900 border-t border-slate-200 pt-2">
              <span>Outstanding Balance:</span>
              <span className={balance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// LOGISTICS & DELIVERY DETAILS MODAL
function DeliveryDetailsModal({ isOpen, onClose, po }) {
  if (!isOpen || !po) return null;

  const agentName = po.DeliveryDetail?.purchase_agent_name || po.purchase_agent_name || 'Standard Logistics Agent';
  const shippingMode = po.DeliveryDetail?.shipping_mode || po.shipping_mode || 'Road Transport / Express Freight';
  const expectedDate = po.delivery_date ? new Date(po.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not specified';
  const deliveredDate = (po.status === 'Delivered' || po.status === 'Received') && po.delivery_date
    ? new Date(po.delivery_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'In Transit / Pending';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
              <Truck size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delivery & Logistics Details</h3>
              <p className="text-xs text-slate-500 font-medium">Order #PO-{po.po_id} • {po.supplier_name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Badge Banner */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div>
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Fulfillment Status</p>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold mt-1 border ${
                po.status === 'Delivered' || po.status === 'Received'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : po.status === 'Shipped'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : po.status === 'Cancelled'
                  ? 'bg-slate-100 text-slate-600 border-slate-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {po.status === 'Delivered' || po.status === 'Received' ? '✅ Delivered' : po.status === 'Shipped' ? '🚚 Shipped' : po.status === 'Cancelled' ? '❌ Cancelled' : '⏳ Pending'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Order Date</p>
              <p className="text-xs font-extrabold text-slate-800 mt-1">
                {new Date(po.order_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Key Logistics Fields Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Agent Name</p>
              <p className="text-sm font-extrabold text-slate-900 mt-1">{agentName}</p>
            </div>

            <div className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Transport / Mode</p>
              <p className="text-sm font-extrabold text-slate-900 mt-1">{shippingMode}</p>
            </div>

            <div className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Expected Delivery Date</p>
              <p className="text-sm font-extrabold text-slate-900 mt-1">{expectedDate}</p>
            </div>

            <div className="p-3.5 border border-slate-100 bg-slate-50/50 rounded-2xl">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Delivered Date</p>
              <p className={`text-sm font-extrabold mt-1 ${
                po.status === 'Delivered' || po.status === 'Received' ? 'text-emerald-600' : 'text-slate-500'
              }`}>
                {deliveredDate}
              </p>
            </div>
          </div>

          {/* Supplier Info Footer */}
          <div className="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-purple-900 block">Supplier</span>
              <span className="text-purple-700 font-medium">{po.supplier_name}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-purple-900 block">Total PO Amount</span>
              <span className="text-purple-900 font-black">₹{parseFloat(po.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

