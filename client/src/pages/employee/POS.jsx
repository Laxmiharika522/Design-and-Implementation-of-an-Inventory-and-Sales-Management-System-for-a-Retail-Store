import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Search, CreditCard, X, Plus, Minus, Receipt, Image as ImageIcon, Calendar, CheckCircle2, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Maps product category name → tax_category key used in Sales_Transaction_Rates
const getCategoryTaxKey = (categoryName) => {
  const cat = categoryName || '';
  if (['Fruits & Vegetables'].includes(cat)) return 'GST_0';
  if (['Dairy Products', 'Bakery & Bread', 'Grocery & Staples'].includes(cat)) return 'GST_5';
  if (['Beverages', 'Snacks & Packaged Foods'].includes(cat)) return 'GST_12';
  if (['Personal Care', 'Household & Cleaning', 'Health & Wellness', 'Baby & Kids Products'].includes(cat)) return 'GST_18';
  return 'GST_5'; // Default
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

  // Fetch GST rates & Fees from backend
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
    const items = cart.map(item => {
      const catName = item.Category?.category_name;
      const taxKey = getCategoryTaxKey(catName);
      const taxRate = getTaxRateForItem(catName);
      return {
         product_id: item.product_id,
         quantity_sold: item.quantity_sold,
         unit_price: item.unit_price,
         tax: parseFloat(((item.unit_price * item.quantity_sold) * taxRate).toFixed(2)),
         tax_category: taxKey
      };
    });
    
    // grand_total here should be without fee, backend will recalculate fee to be safe
    // Or we send grand_total + fee as amount_paid
    const itemsTax = items.reduce((sum, i) => sum + i.tax, 0);
    const sub_total = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity_sold), 0);
    const feeRate = feeRates[paymentMethod] ? feeRates[paymentMethod] / 100 : 0;
    const feeAmt = (sub_total + itemsTax) * feeRate;
    const grand_total = parseFloat((sub_total + itemsTax + feeAmt).toFixed(2));

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
  const totalTax = cart.reduce((acc, item) => {
    const taxRate = getTaxRateForItem(item.Category?.category_name);
    return acc + (item.unit_price * item.quantity_sold * taxRate);
  }, 0);
  
  const currentFeeRate = feeRates[paymentMethod] ? feeRates[paymentMethod] / 100 : 0;
  const processingFee = (subTotal + totalTax) * currentFeeRate;
  const total = subTotal + totalTax + processingFee;

  const paymentMethods = ['Cash', 'UPI', 'Credit Card', 'Debit Card'];

  return (
    <div className="flex flex-row gap-2 md:gap-6 h-[calc(100vh-8rem)]">
      {/* Sidebar Receipt & Cart are below */}

      {/* Product Grid */}
      <div className="flex-1 flex flex-col min-h-0 card overflow-hidden">
        <div className="p-4 border-b dark:border-slate-700 space-y-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Scan barcode or search products..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="input-base pl-10 h-12 text-lg font-medium"
               autoFocus
             />
           </div>

           {/* Category Overview Box */}
           <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
             <button
               onClick={() => setSelectedCategoryId(null)}
               className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${!selectedCategoryId ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
             >
               All Categories
             </button>
             {categories?.map(cat => (
               <button
                 key={cat.category_id}
                 onClick={() => setSelectedCategoryId(cat.category_id)}
                 className={`shrink-0 flex flex-col text-left p-3 rounded-xl border transition-all max-w-[180px] ${selectedCategoryId === cat.category_id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
               >
                 <span className={`text-[10px] font-black uppercase tracking-wider mb-1 ${selectedCategoryId === cat.category_id ? 'text-blue-600' : 'text-slate-500'}`}>{cat.category_name}</span>
                 <p className="text-[10px] leading-tight text-slate-400 line-clamp-2 italic font-medium">{cat.description || 'No description available'}</p>
               </button>
             ))}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 auto-rows-[12rem] md:auto-rows-[14rem]">
           {filteredProducts?.map(product => (
              <button
                key={product.product_id}
                onClick={() => addToCart(product)}
                disabled={product.Inventory?.current_stock <= 0}
                className="flex flex-col text-left p-0 rounded-2xl border dark:border-slate-700 hover:border-blue-500 hover:shadow-xl transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-slate-800 overflow-hidden"
              >
                <div className="h-32 w-full bg-slate-50 dark:bg-slate-900/40 relative p-2">
                  {product.image_url ? (
                    <img 
                      src={product.image_url} 
                      alt={product.product_name} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 dark:bg-slate-800/90 backdrop-blur rounded-lg text-[10px] font-bold shadow-sm border dark:border-slate-700">
                    {product.Inventory?.current_stock || 0} in stock
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{product.Category?.category_name}</div>
                  <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1 leading-tight text-sm">{product.product_name}</h3>
                  {product.Inventory?.expiry_date && (
                    <div className="flex items-center gap-1 text-[0.65rem] font-bold text-amber-600 bg-amber-50 self-start px-2 py-0.5 rounded-md border border-amber-200 mt-0.5">
                      <Calendar size={12} /> Exp: {new Date(product.Inventory.expiry_date).toLocaleDateString()}
                    </div>
                  )}
                  <div className="mt-2 text-lg font-black text-slate-900 dark:text-white">₹{Number(product.unit_price).toFixed(2)}</div>
                </div>
              </button>
           ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <div className="w-[45%] sm:w-[300px] md:w-96 shrink-0 flex flex-col card overflow-hidden">
        <div className="p-4 border-b dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-3">
           <ShoppingCart className="text-blue-600" />
           <h2 className="text-lg font-bold">Current Order</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
           {cart.length === 0 ? (
             lastOrder ? (
               <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500">
                 <div className="p-6 text-center border-b dark:border-slate-800 bg-green-50/50 dark:bg-green-900/10">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                      <CheckCircle2 size={24} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Sale Successful</h3>
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
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.product_name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{item.quantity_sold} × ₹{Number(item.unit_price).toFixed(2)}</span>
                            <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded font-black">
                              GST: ₹{item.itemTax.toFixed(2)}
                            </span>
                          </p>
                        </div>
                        <p className="font-black text-sm text-slate-900 dark:text-white ml-2">
                          ₹{((item.quantity_sold * item.unit_price) + item.itemTax).toFixed(2)}
                        </p>
                      </div>
                    ))}
                 </div>

                 <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-800 space-y-3">
                    <div className="space-y-1.5 text-xs font-bold text-slate-500">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="text-slate-900 dark:text-white">₹{lastOrder.subTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total GST</span>
                        <span className="text-slate-900 dark:text-white">₹{lastOrder.totalTax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing Fee ({lastOrder.paymentMethod})</span>
                        <span className="text-slate-900 dark:text-white">₹{lastOrder.processingFee.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="pt-3 border-t dark:border-slate-700 flex justify-between items-center">
                      <span className="text-lg font-black text-slate-900 dark:text-white">Grand Total</span>
                      <span className="text-2xl font-black text-emerald-600">₹{lastOrder.grandTotal.toFixed(2)}</span>
                    </div>
                    <button 
                      onClick={() => setLastOrder(null)}
                      className="w-full mt-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-widest shadow-lg"
                    >
                      Process New Sale
                    </button>
                    <button 
                      onClick={async () => {
                        await queryClient.invalidateQueries({ queryKey: ['detailedSales'] });
                        navigate('/admin/sales');
                      }}
                      className="w-full mt-2 py-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider hover:underline"
                    >
                      View in History
                    </button>
                 </div>
               </div>
             ) : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                    <Receipt className="w-10 h-10 opacity-20" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2">No Active Order</h3>
                  <p className="text-xs leading-relaxed">Start scanning products to create a new transaction</p>
               </div>
             )
           ) : (
             <div className="space-y-2">
               {cart.map(item => (
                  <div key={item.product_id} className="flex gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 group shadow-sm transition-all hover:shadow-md">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 overflow-hidden shrink-0 border dark:border-slate-700">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs truncate text-slate-900 dark:text-white">{item.product_name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-blue-600 font-extrabold text-xs">₹{Number(item.unit_price).toFixed(2)}</p>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded font-bold text-slate-500">
                          GST: ₹{(item.unit_price * item.quantity_sold * getTaxRateForItem(item.Category?.category_name)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-between">
                       <button onClick={() => removeFromCart(item.product_id)} className="text-slate-400 hover:text-red-500 p-1"><X size={16}/></button>
                       <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-lg overflow-hidden shrink-0 mt-2">
                         <button onClick={() => updateQuantity(item.product_id, -1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700"><Minus size={14}/></button>
                         <span className="w-6 text-center text-sm font-medium">{item.quantity_sold}</span>
                         <button onClick={() => updateQuantity(item.product_id, 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700"><Plus size={14}/></button>
                       </div>
                    </div>
                 </div>
               ))}
             </div>
           )}
        </div>
        {cart.length > 0 && (
          <div className="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-750/50">
              <div className="space-y-1 mb-3 text-xs text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total GST</span>
                  <span>₹{totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Processing Fee</span>
                  <span>₹{processingFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4 text-lg font-bold pt-2 border-t dark:border-slate-700">
                <span>Grand Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {paymentMethods.map(pm => (
                  <button
                    key={pm}
                    onClick={() => setPaymentMethod(pm)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${paymentMethod === pm ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                  >
                    {pm}
                  </button>
                ))}
              </div>

             <button 
               onClick={handleCheckout}
               disabled={cart.length === 0 || checkoutMutation.isPending}
               className="w-full py-3 h-14 btn btn-primary text-lg"
             >
               <CreditCard size={20} />
               {checkoutMutation.isPending ? 'Processing...' : 'Charge'}
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
