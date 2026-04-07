import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ShoppingBag, Search, Filter, ShoppingCart, Plus, Minus, Package, X, CheckCircle, Calendar, MapPin, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function CustomerShop() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['customerProducts'],
    queryFn: () => axios.get('http://localhost:5000/api/customer/products').then(r => r.data)
  });

  const { data: profile } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => axios.get('http://localhost:5000/api/customer/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data),
  });

  const CATEGORY_ORDER = [
    'All',
    'Grocery & Staples',
    'Fruits & Vegetables',
    'Dairy Products',
    'Snacks & Packaged Foods',
    'Beverages',
    'Personal Care',
    'Household & Cleaning',
    'Bakery & Bread',
    'Baby & Kids Products',
    'Health & Wellness',
  ];
  const availableCategories = new Set(products.map(p => p.Category?.category_name).filter(Boolean));
  const categories = CATEGORY_ORDER.filter(c => c === 'All' || availableCategories.has(c));

  
  const filtered = products.filter(p => {
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.Category?.category_name === selectedCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.product_id);
      if (existing) return prev.map(i => i.product_id === product.product_id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (product_id, delta) => {
    setCart(prev => prev.map(i => i.product_id === product_id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const placeOrder = useMutation({
    mutationFn: () => axios.post('http://localhost:5000/api/customer/orders', {
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      payment_method: paymentMethod
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      setCart([]);
      setShowCart(false);
      
      // Briefly show Success status in cart before navigating
      setOrdered(true);
      setTimeout(() => {
        setOrdered(false);
        navigate('/customer/orders');
      }, 1000);
    }
  });

  const handleCheckout = () => {
    setIsPaying(true);
    // Simulate payment gateway delay (1.5 seconds)
    setTimeout(() => {
      setIsPaying(false);
      placeOrder.mutate();
    }, 1500);
  };

  if (productsLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div>;

  return (
    <div className="space-y-6">
      {/* Simulated Payment Gateway Overlay */}
      {isPaying && (
        <div className="fixed inset-0 z-[60] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Processing Payment...</h2>
          <p className="text-slate-500 font-medium mt-2">Connecting to UPI securely. Please do not close this window.</p>
        </div>
      )}

      {ordered && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-emerald-500/30 flex items-center gap-3">
          <CheckCircle size={20} /> Payment Successful! Order placed.
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">Shop Products</h2>
          <p className="text-slate-500 text-sm mt-1">Browse our catalog and place orders instantly.</p>
        </div>
        <button onClick={() => setShowCart(true)} className="relative flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
          <ShoppingCart size={18} /> Cart
          {cartCount > 0 && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-xs font-bold flex items-center justify-center">{cartCount}</span>}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/30" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${selectedCategory === cat ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {productsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-slate-200 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(product => {
            const inCart = cart.find(i => i.product_id === product.product_id);
            const stock = product.Inventory?.current_stock ?? 0;
            const isOutOfStock = stock === 0;
            return (
              <div key={product.product_id} className="bg-white rounded-[1.5rem] border border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group flex flex-col relative">
                {/* Category Badge Floating */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-700 rounded-lg font-bold shadow-sm border border-slate-200/50">
                    {product.Category?.category_name || 'Item'}
                  </span>
                </div>

                {/* Product Image Box */}
                <div className="relative h-48 w-full bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center p-4">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.product_name} className="max-h-full max-w-full object-contain drop-shadow-sm mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <Package size={48} className="text-slate-300 group-hover:text-emerald-400 group-hover:scale-110 transition-all duration-500" />
                  )}
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col pt-4">
                  <h3 className="font-bold text-slate-900 text-base leading-tight line-clamp-2">{product.product_name}</h3>
                  
                  <div className="flex items-end justify-between mt-3 mb-2">
                    <div>
                      <span className="text-2xl font-black text-slate-900 tracking-tight">₹{parseFloat(product.unit_price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="text-right">
                      {isOutOfStock ? (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">Out of stock</span>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{stock} left</span>
                      )}
                    </div>
                  </div>

                  {product.Inventory?.expiry_date && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-700 bg-amber-50/80 px-2.5 py-1 rounded-lg border border-amber-200/50 w-fit mb-3">
                      <Calendar size={12} className="text-amber-500" /> Expires {new Date(product.Inventory.expiry_date).toLocaleDateString()}
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    {!isOutOfStock && (
                    inCart ? (
                      <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl ring-1 ring-inset ring-slate-200/60 shadow-inner">
                        <button onClick={() => updateQty(product.product_id, -1)} className="w-10 h-10 bg-white rounded-lg flex items-center justify-center hover:bg-slate-50 text-slate-600 shadow-sm transition-all active:scale-95"><Minus size={16} strokeWidth={3} /></button>
                        <span className="font-black text-slate-800 text-lg w-10 text-center">{inCart.quantity}</span>
                        <button onClick={() => updateQty(product.product_id, 1)} className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center hover:bg-emerald-600 text-white shadow-sm shadow-emerald-500/20 transition-all active:scale-95"><Plus size={16} strokeWidth={3} /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 hover:-translate-y-0.5">
                        <ShoppingCart size={16} /> Add to Cart
                      </button>
                    )
                  )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-xl flex items-center gap-2"><ShoppingCart size={20} className="text-emerald-600" /> My Cart</h3>
              <button onClick={() => setShowCart(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors"><X size={18} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-300">
                  <ShoppingCart size={48} />
                  <p className="mt-2 font-medium">Your cart is empty</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-slate-800 leading-tight">{item.product_name}</p>
                    <p className="text-emerald-600 font-bold text-sm mt-1">₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
                    <button onClick={() => updateQty(item.product_id, -1)} className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 transition-colors"><Minus size={12} /></button>
                    <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQty(item.product_id, 1)} className="w-7 h-7 rounded flex items-center justify-center hover:bg-slate-100 transition-colors"><Plus size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (() => {
              // Calculate taxes dynamically based on items in cart
              let subTotal = 0;
              let totalTax = 0;

              cart.forEach(item => {
                let taxRate = 0.05; // Default 5%
                const catName = item.Category?.category_name || '';

                if (['Fruits & Vegetables'].includes(catName)) taxRate = 0.00;
                else if (['Dairy Products', 'Bakery & Bread', 'Grocery & Staples'].includes(catName)) taxRate = 0.05;
                else if (['Beverages', 'Snacks & Packaged Foods'].includes(catName)) taxRate = 0.12;
                else if (['Personal Care', 'Household & Cleaning', 'Health & Wellness', 'Baby & Kids Products'].includes(catName)) taxRate = 0.18;

                const lineSubtotal = item.unit_price * item.quantity;
                const lineTax = lineSubtotal * taxRate;
                
                subTotal += lineSubtotal;
                totalTax += lineTax;
              });

              const subTotalPlusTax = subTotal + totalTax;
              // Fees matching DB: Cash=0%, Credit Card=2.5%, Debit Card=1%, Net Banking=1.5%, UPI=0%
              const FEE_RATES = {
                'Cash': 0,
                'UPI': 0,
                'Debit Card': 0.01,
                'Credit Card': 0.025,
                'Net Banking': 0.015,
              };
              const feePcnt = FEE_RATES[paymentMethod] ?? 0;

              const processingFee = subTotalPlusTax * feePcnt;
              const exactGrandTotal = subTotalPlusTax + processingFee;
              const grandTotalRounded = Math.round(exactGrandTotal);
              
              const methods = ['Cash', 'UPI', 'Debit Card', 'Credit Card'];

              return (
                <div className="p-6 border-t border-slate-200">
                  <div className="mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-semibold text-slate-700 flex items-center gap-1.5"><MapPin size={14} className="text-emerald-500" /> Delivery</span>
                      <button onClick={() => { setShowCart(false); navigate('/customer/profile'); }} className="text-xs text-emerald-600 font-bold hover:underline">Change</button>
                    </div>
                    {profile?.address ? (
                      <p className="text-xs text-slate-500 leading-relaxed truncate">{profile.address}</p>
                    ) : (
                      <div className="mt-2">
                        <p className="text-xs text-red-500 font-medium mb-2">A delivery address is required.</p>
                        <button onClick={() => { setShowCart(false); navigate('/customer/profile'); }} className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg font-bold border border-red-100 hover:bg-red-100 transition-colors">Add Address</button>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Payment Method</p>
                    <div className="grid grid-cols-2 gap-2">
                      {methods.map(m => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-colors ${
                            paymentMethod === m 
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-slate-600 font-medium">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total GST</span>
                      <span>₹{totalTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fee ({paymentMethod} {(feePcnt * 100).toFixed(1)}%)</span>
                      <span>₹{processingFee.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-end mb-6 pt-3 border-t border-slate-200">
                    <span className="text-slate-800 font-bold">Grand Total</span>
                    <span className="text-2xl font-black text-slate-800">₹{grandTotalRounded.toLocaleString('en-IN')}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={placeOrder.isPending || isPaying || !profile?.address}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {!profile?.address ? 'Address Required' : isPaying ? `Processing ${paymentMethod}...` : placeOrder.isPending ? 'Placing Order...' : `Pay ₹${grandTotalRounded.toLocaleString('en-IN')}`}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
