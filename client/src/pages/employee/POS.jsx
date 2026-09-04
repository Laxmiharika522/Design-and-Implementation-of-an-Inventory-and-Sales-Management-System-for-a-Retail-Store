import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Search, CreditCard, X, Plus, Minus, Receipt, Image as ImageIcon, Calendar, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import clsx from 'clsx';

// Maps product category name → tax_category key used in Sales_Transaction_Rates
const getCategoryTaxKey = () => 'STANDARD';

const getCategoryEmoji = (name) => {
  const cat = (name || '').toLowerCase();
  if (cat.includes('fruit') || cat.includes('veg')) return '🥦';
  if (cat.includes('dairy') || cat.includes('milk')) return '🥛';
  if (cat.includes('bakery') || cat.includes('bread')) return '🍞';
  if (cat.includes('snack') || cat.includes('food')) return '🍿';
  if (cat.includes('beverage') || cat.includes('drink')) return '🥤';
  if (cat.includes('personal') || cat.includes('care')) return '🧼';
  if (cat.includes('clean') || cat.includes('house')) return '🧹';
  if (cat.includes('health') || cat.includes('well')) return '💊';
  if (cat.includes('baby') || cat.includes('kid')) return '👶';
  return '🌾';
};

const getProductBadges = (productId, price) => {
  const pId = productId || 1;
  const pPrice = price || 0;
  const discounts = [15, 20, 25, 30, 40];
  const discPercent = discounts[pId % discounts.length];
  const origPrice = Math.round(pPrice / (1 - discPercent / 100));
  const badgeLabel = discPercent >= 40 ? `Supersaver ${discPercent}% OFF` : `${discPercent}% OFF`;
  return { discount: badgeLabel, originalPrice: origPrice };
};

export default function POS() {
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [lastOrder, setLastOrder] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isAdmin = user?.role === 'Admin';

  // Fetch Tax rates & Fees from backend
  const { data: lookups = { rates: {}, fees: {} } } = useQuery({
    queryKey: ['posLookups'],
    queryFn: async () => {
      const { data } = await axios.get('/tax-rates');
      return data; // { rates: {...}, fees: {...} }
    },
    staleTime: 10 * 60 * 1000
  });

  const taxRates = lookups.rates || {};
  const feeRates = lookups.fees || {};

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data } = await axios.get('/products');
      return data;
    }
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await axios.get('/categories');
      return data;
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async (orderPayload) => {
      return axios.post('/sales', orderPayload);
    },
    onSuccess: (res) => {
      setLastOrder({
        transaction_id: res.data.sale.transaction_id,
        items: cart.map(item => {
          const taxRate = getTaxRateForItem(item.Category?.category_name);
          return { ...item, itemTax: item.unit_price * item.quantity_sold * taxRate };
        }),
        subTotal,
        totalTax,
        processingFee,
        grandTotal: total,
        salesperson: user?.name || 'System'
      });
      setCart([]);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['detailedSales'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || 'Checkout failed');
    }
  });

  const addToCart = (product) => {
    if (product.Inventory?.current_stock <= 0) return alert('Out of stock!');
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.product_id);
      if (existing) {
        if (existing.quantity_sold >= product.Inventory.current_stock) {
           alert('Cannot exceed stock!');
           return prev;
        }
        return prev.map(item => item.product_id === product.product_id ? { ...item, quantity_sold: item.quantity_sold + 1 } : item);
      }
      return [...prev, { ...product, quantity_sold: 1, tax: 0 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === id) {
        const newQty = item.quantity_sold + delta;
        return newQty > 0 ? { ...item, quantity_sold: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.product_id !== id));
  };

  // Resolve tax rate (as decimal) for a product using DB-fetched rates
  const getTaxRateForItem = (categoryName) => {
    const key = getCategoryTaxKey(categoryName);
    const pct = taxRates[key] ?? 5; // fallback 5%
    return pct / 100;
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const items = cart.map(item => ({
      product_id: item.product_id,
      quantity_sold: item.quantity_sold,
      unit_price: item.unit_price,
      tax: 0,
      tax_category: 'STANDARD'
    }));
    
    const sub_total = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity_sold), 0);
    const feeRate = feeRates[paymentMethod] ? feeRates[paymentMethod] / 100 : 0;
    const feeAmt = sub_total * feeRate;
    const grand_total = parseFloat((sub_total + feeAmt).toFixed(2));

    checkoutMutation.mutate({
      items,
      payment_method: paymentMethod,
      amount_paid: grand_total
    });
  };

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.barcode?.includes(searchTerm);
    const matchesCategory = !selectedCategoryId || p.category_id === selectedCategoryId;
    return matchesSearch && matchesCategory;
  });

  const subTotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity_sold), 0);
  const totalTax = 0;
  
  const currentFeeRate = feeRates[paymentMethod] ? feeRates[paymentMethod] : 0;
  const processingFee = subTotal * (currentFeeRate / 100);
  const total = subTotal + processingFee;

  const paymentMethods = ['Cash', 'UPI', 'Debit Card', 'Credit Card'];

  return (
    <div className="flex flex-row gap-2 md:gap-6 h-[calc(100vh-7.5rem)] overflow-hidden">
      {/* Product Grid Container */}
      <div className="flex-1 flex flex-col min-h-0 card overflow-hidden">
        <div className="p-4 border-b dark:border-slate-700 space-y-4">
           <div className="relative">
             <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Scan barcode or search products..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="input-base pl-10 h-12 text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
               autoFocus
             />
           </div>

           {/* Category Filter Pills */}
           <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
             <button
               onClick={() => setSelectedCategoryId(null)}
               className={clsx(
                 "shrink-0 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border flex items-center gap-2",
                 !selectedCategoryId 
                   ? (isAdmin ? "bg-rose-600 text-white border-rose-600 shadow-xs" : "bg-blue-600 text-white border-blue-600 shadow-xs")
                   : (isAdmin ? "bg-white text-slate-700 border-slate-200 hover:border-rose-300" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300")
               )}
             >
               <span>🛒</span> All Categories
             </button>
             {categories?.map(cat => {
               const catEmoji = getCategoryEmoji(cat.category_name);
               const isSelected = selectedCategoryId === cat.category_id;
               return (
                 <button
                   key={cat.category_id}
                   onClick={() => setSelectedCategoryId(cat.category_id)}
                   className={clsx(
                     "shrink-0 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border flex items-center gap-2 whitespace-nowrap",
                     isSelected 
                       ? (isAdmin ? "bg-rose-600 text-white border-rose-600 shadow-xs" : "bg-blue-600 text-white border-blue-600 shadow-xs")
                       : (isAdmin ? "bg-white text-slate-700 border-slate-200 hover:border-rose-300" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300")
                   )}
                 >
                   <span>{catEmoji}</span>
                   <span>{cat.category_name}</span>
                 </button>
               );
             })}
           </div>
        </div>
        
        {/* Product Grid Area - 3 Items per row on desktop */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50/40">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
           {filteredProducts?.map(product => {
              const isOutOfStock = (product.Inventory?.current_stock || 0) <= 0;
              const stock = product.Inventory?.current_stock || 0;
              const price = parseFloat(product.unit_price);
              const { discount, originalPrice } = getProductBadges(product.product_id, price);
              const defaultFallbackImg = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&w=800&q=80';

              return (
                <div
                  key={product.product_id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={clsx(
                    "bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col relative group overflow-hidden cursor-pointer",
                    isAdmin ? "hover:border-rose-500 hover:-translate-y-1" : "hover:border-blue-500 hover:-translate-y-1",
                    isOutOfStock && "opacity-60 cursor-not-allowed"
                  )}
                >
                  {/* Offer Badge Floating Top-Left */}
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-md shadow-xs">
                      {discount}
                    </span>
                  </div>

                  {/* Product Image Container */}
                  <div className="relative h-44 w-full bg-slate-50/60 flex items-center justify-center p-4 border-b border-slate-100">
                    <img 
                      src={product.image_url || defaultFallbackImg} 
                      alt={product.product_name} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = defaultFallbackImg;
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs" 
                    />
                  </div>

                  {/* Product Details */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className={clsx(
                        "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded w-fit border inline-block mb-1.5",
                        isAdmin ? "text-rose-900 bg-rose-50 border-rose-100/80" : "text-blue-900 bg-blue-50 border-blue-100/80"
                      )}>
                        {product.Category?.category_name || 'Grocery'}
                      </span>

                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1 mb-1">
                        {product.product_name}
                      </h3>

                      {product.Inventory?.expiry_date && (
                        <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50/90 border border-amber-200/80 px-2 py-0.5 rounded-md w-fit mb-2">
                          <Calendar size={11} className="text-amber-700" /> Exp: {new Date(product.Inventory.expiry_date).toLocaleDateString()}
                        </div>
                      )}

                      {/* Price & Struck-Through MRP */}
                      <div className="flex items-baseline gap-2 mt-1 mb-2">
                        <span className="text-xl font-black text-slate-900">
                          ₹{Math.round(price)}
                        </span>
                        <span className="text-xs text-slate-400 line-through font-semibold">
                          ₹{originalPrice}
                        </span>
                      </div>

                      {/* Stock Pill Badge */}
                      <div>
                        {isOutOfStock ? (
                          <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-100 inline-block">
                            Out of stock
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md inline-block">
                            {stock} left in store
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
           })}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[45%] sm:w-[300px] md:w-96 shrink-0 flex flex-col card overflow-hidden border border-slate-200 shadow-xs rounded-3xl">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
           <ShoppingCart className={isAdmin ? "text-rose-600" : "text-blue-600"} />
           <h2 className="text-lg font-extrabold text-slate-900">Current Order</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
           {cart.length === 0 ? (
             lastOrder ? (
               <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
                 <div className="p-6 text-center border-b border-slate-200 bg-emerald-50/50">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">Sale Successful</h3>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">
                      <span>#{lastOrder.transaction_id.toString().padStart(6, '0')}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="flex items-center gap-1"><User size={12}/> {lastOrder.salesperson}</span>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {lastOrder.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-start group">
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-sm text-slate-900 truncate">{item.product_name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            <span>{item.quantity_sold} × ₹{Number(item.unit_price).toFixed(2)}</span>
                          </p>
                        </div>
                        <p className="font-black text-sm text-slate-900 ml-2">
                          ₹{(item.quantity_sold * item.unit_price).toFixed(2)}
                        </p>
                      </div>
                    ))}
                 </div>

                 <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
                    <div className="space-y-1.5 text-xs font-bold text-slate-500">
                      <div className="flex justify-between">
                        <span>Subtotal (MRP)</span>
                        <span className="text-slate-900">₹{lastOrder.subTotal.toFixed(2)}</span>
                      </div>
                      {lastOrder.processingFee > 0 && (
                        <div className="flex justify-between">
                          <span>Processing Fee ({lastOrder.paymentMethod})</span>
                          <span className="text-slate-900">₹{lastOrder.processingFee.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                    <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-lg font-black text-slate-900">Grand Total</span>
                      <span className="text-2xl font-black text-emerald-600">₹{lastOrder.grandTotal.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => setLastOrder(null)}
                      className={clsx(
                        "w-full mt-4 py-3 text-white rounded-xl font-extrabold active:scale-95 transition-all text-sm uppercase tracking-wider shadow-xs",
                        isAdmin ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
                      )}
                    >
                      Process New Sale
                    </button>
                    <button 
                      onClick={async () => {
                        await queryClient.invalidateQueries({ queryKey: ['detailedSales'] });
                        navigate('/admin/sales');
                      }}
                      className={clsx(
                        "w-full mt-2 font-extrabold text-xs uppercase tracking-wider hover:underline py-2",
                        isAdmin ? "text-rose-600 hover:text-rose-700" : "text-blue-600 hover:text-blue-700"
                      )}
                    >
                      View in History
                    </button>
                 </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <Receipt className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">No Active Order</h3>
                  <p className="text-xs leading-relaxed">Start scanning products to create a new transaction</p>
               </div>
             )
           ) : (
             <div className="space-y-2">
               {cart.map(item => (
                  <div key={item.product_id} className="flex gap-3 p-3 bg-white rounded-xl border border-slate-200 group shadow-xs transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate text-slate-900">{item.product_name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className={clsx("font-extrabold text-xs", isAdmin ? "text-rose-600" : "text-blue-600")}>₹{Number(item.unit_price).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-between">
                       <button onClick={() => removeFromCart(item.product_id)} className="text-slate-400 hover:text-rose-600 p-1"><X size={16}/></button>
                       <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg overflow-hidden shrink-0 mt-2">
                         <button onClick={() => updateQuantity(item.product_id, -1)} className="p-1 hover:bg-slate-100"><Minus size={14}/></button>
                         <span className="w-6 text-center text-sm font-medium">{item.quantity_sold}</span>
                         <button onClick={() => updateQuantity(item.product_id, 1)} className="p-1 hover:bg-slate-100"><Plus size={14}/></button>
                       </div>
                    </div>
                  </div>
               ))}
             </div>
           )}
        </div>
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50">
              <div className="space-y-1 mb-3 text-xs text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal (MRP)</span>
                  <span>₹{subTotal.toFixed(2)}</span>
                </div>
                {processingFee > 0 && (
                  <div className="flex justify-between">
                    <span>Processing Fee</span>
                    <span>₹{processingFee.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center mb-4 text-lg font-bold pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {paymentMethods.map(pm => (
                  <button
                    key={pm}
                    onClick={() => setPaymentMethod(pm)}
                    className={clsx(
                      "py-2 text-xs font-extrabold rounded-xl border transition-all",
                      paymentMethod === pm 
                        ? (isAdmin ? "bg-rose-600 text-white border-rose-600 shadow-xs" : "bg-blue-600 text-white border-blue-600 shadow-xs")
                        : (isAdmin ? "bg-white text-slate-700 border-slate-200 hover:border-rose-300" : "bg-white text-slate-700 border-slate-200 hover:border-blue-300")
                    )}
                  >
                    {pm}
                  </button>
                ))}
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || checkoutMutation.isPending}
                className={clsx(
                  "w-full py-3 h-12 text-white rounded-xl font-extrabold flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50",
                  isAdmin ? "bg-rose-600 hover:bg-rose-700" : "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <CreditCard size={18} />
                {checkoutMutation.isPending ? 'Placing Order...' : `Place Order & Charge (₹${total.toFixed(2)})`}
              </button>
          </div>
        )}
      </div>
    </div>
  );
}
