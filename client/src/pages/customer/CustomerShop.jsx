import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, Search, ShoppingCart, Plus, Minus, X, CheckCircle, 
  Calendar, MapPin, Loader2, Sparkles, Tag, ShieldCheck, 
  Truck, Zap, Percent, Clock, ChevronRight
} from 'lucide-react';
import { API_BASE } from '../../config/api';

export default function CustomerShop() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Products');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['customerProducts'],
    queryFn: () => axios.get(API_BASE + '/customer/products').then(r => r.data)
  });

  const { data: profile } = useQuery({
    queryKey: ['customerProfile'],
    queryFn: () => axios.get(API_BASE + '/customer/profile', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(r => r.data),
  });

  // Top Category Strip (Matching Amazon Fresh style)
  const QUICK_CATEGORIES = [
    { label: 'All Products', icon: '🛒', name: 'All' },
    { label: 'Deals & Offers', icon: '🔥', name: 'Deals' },
    { label: 'Fruits & Vegetables', icon: '🥦', name: 'Fruits & Vegetables' },
    { label: 'Atta, Rice & Grains', icon: '🌾', name: 'Grocery & Staples' },
    { label: 'Oil & Ghee', icon: '🌻', name: 'Grocery & Staples' },
    { label: 'Milk & Dairy', icon: '🥛', name: 'Dairy Products' },
    { label: 'Chips & Snacks', icon: '🍿', name: 'Snacks & Packaged Foods' },
    { label: 'Beverages', icon: '🧃', name: 'Beverages' },
    { label: 'Personal Care', icon: '🧼', name: 'Personal Care' },
    { label: 'Household & Cleaning', icon: '🧹', name: 'Household & Cleaning' },
    { label: 'Bakery & Bread', icon: '🍞', name: 'Bakery & Bread' },
    { label: 'Baby Care', icon: '👶', name: 'Baby & Kids Products' },
    { label: 'Health & Wellness', icon: '💊', name: 'Health & Wellness' }
  ];

  // Clean, crisp Hero Banner Slides (Clean background, high impact typography, crisp graphics)
  const HERO_SLIDES = [
    {
      id: 1,
      tag: 'GREAT PRICES',
      title: 'Fruits & vegetables',
      subtitle: 'Farm fresh • Clean & hygienic • Safe',
      badge: 'Order now ►',
      category: 'Fruits & Vegetables',
      bgColor: 'bg-[#007042]', // Clean Amazon Fresh green
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80',
      features: ['Farm fresh', 'Clean & hygienic', 'Safe']
    },
    {
      id: 2,
      tag: 'SUPER SAVER DAYS',
      title: 'Atta, Rice & Grains',
      subtitle: 'Up to 35% OFF on Daily Staples',
      badge: 'Shop Staples ►',
      category: 'Grocery & Staples',
      bgColor: 'bg-[#0f4c3a]',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1000&q=80',
      features: ['Premium Quality', 'Best Market Price', 'Express Delivery']
    },
    {
      id: 3,
      tag: 'DAILY FRESH',
      title: 'Milk, Dairy & Bakery',
      subtitle: 'Organic Milk, Butter, Cheese & Fresh Breads',
      badge: 'Explore Dairy ►',
      category: 'Dairy Products',
      bgColor: 'bg-[#1b4332]',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=1000&q=80',
      features: ['Morning Delivery', 'Cold Chain Preserved', 'Pure & Organic']
    }
  ];

  // Auto-play hero slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Lock body scroll when cart drawer is open
  useEffect(() => {
    if (showCart) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCart]);

  const filtered = products.filter(p => {
    const matchSearch = p.product_name.toLowerCase().includes(search.toLowerCase());
    const catObj = QUICK_CATEGORIES.find(c => c.label === selectedCategory);
    let matchCat = true;
    if (selectedCategory && selectedCategory !== 'All Products' && selectedCategory !== 'All' && selectedCategory !== 'Deals & Offers' && selectedCategory !== 'Deals') {
      if (selectedCategory === 'Oil & Ghee') {
        matchCat = p.Category?.category_name === 'Grocery & Staples' && p.product_name.toLowerCase().includes('oil');
      } else if (selectedCategory === 'Atta, Rice & Grains') {
        matchCat = p.Category?.category_name === 'Grocery & Staples' && !p.product_name.toLowerCase().includes('oil');
      } else if (catObj) {
        matchCat = p.Category?.category_name === catObj.name;
      } else {
        matchCat = p.Category?.category_name === selectedCategory;
      }
    }
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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const placeOrder = useMutation({
    mutationFn: () => axios.post(API_BASE + '/customer/orders', {
      items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
      payment_method: paymentMethod
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerOrders'] });
      setCart([]);
      setShowCart(false);
      
      setOrdered(true);
      setTimeout(() => {
        setOrdered(false);
        navigate('/customer/orders');
      }, 1200);
    }
  });

  const handleCheckout = () => {
    setIsPaying(true);
    setShowCart(false);
    setTimeout(() => {
      setIsPaying(false);
      placeOrder.mutate();
    }, 1500);
  };

  const getProductBadges = (id, price) => {
    const discounts = ['17% OFF', '25% OFF', '42% OFF', '16% OFF', 'Supersaver 41% OFF', '20% OFF'];
    const index = id % discounts.length;
    const originalPrice = Math.round(price * 1.25);
    return {
      discount: discounts[index],
      originalPrice: originalPrice
    };
  };

  if (productsLoading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <Loader2 className="animate-spin text-emerald-600 w-10 h-10" />
      <p className="text-slate-500 font-bold text-sm">Loading Store Catalog...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* Payment Gateway Modal */}
      <AnimatePresence>
        {isPaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/75 flex flex-col items-center justify-center p-4"
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-5 border-2 border-emerald-500/30 z-[310] relative">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Processing Payment...</h2>
                <p className="text-slate-600 font-bold text-xs mt-1">Connecting to {paymentMethod} Gateway securely.</p>
              </div>
              <div className="py-2.5 px-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 border border-emerald-200">
                <ShieldCheck size={14} className="text-emerald-600" /> 256-Bit SSL Encrypted Transaction
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {ordered && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-[90] bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-bold border border-emerald-500"
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <div>
              <p className="text-sm font-bold">Order Placed Successfully!</p>
              <p className="text-xs text-emerald-100">Redirecting to your orders...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar: Sleek Search Bar & Floating Cart launcher ── */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3 md:p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 text-slate-950 placeholder-slate-500 font-bold border border-slate-200 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all" 
            placeholder="Search groceries, fresh vegetables, staples..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
              <X size={14} />
            </button>
          )}
        </div>

        <button 
          onClick={() => setShowCart(true)} 
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all duration-200 active:scale-95 shrink-0"
        >
          <ShoppingCart size={16} />
          <span>Cart</span>
          {cartCount > 0 && (
            <span className="bg-white text-emerald-900 text-xs font-black px-2 py-0.5 rounded-full shadow-sm">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* ── Top Category Quick Strip (Sleek Compact Dark Text) ── */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          {QUICK_CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  isActive 
                    ? 'bg-emerald-600 text-white border border-emerald-600 shadow-md scale-105' 
                    : 'bg-white text-slate-800 font-bold border border-slate-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800'
                }`}
              >
                <span className="text-sm">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Amazon Fresh Bright Light Hero Banner (Fresh Mint Light Background) ── */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border-2 border-emerald-200/90 min-h-[260px] md:min-h-[280px] bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70">
        <AnimatePresence mode="wait">
          {HERO_SLIDES.map((slide, index) => index === currentSlide && (
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-between p-6 sm:p-8 md:p-10 gap-6 bg-gradient-to-r from-emerald-50 via-[#ecfdf5] to-teal-50"
            >
              {/* Left Column: Text & Call to Action */}
              <div className="max-w-xl space-y-3 z-10">
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-600 text-white text-[11px] font-black tracking-widest px-3 py-1 rounded-lg uppercase shadow-sm">
                    {slide.tag}
                  </span>
                  <span className="bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-lg shadow-sm flex items-center gap-1">
                    <Sparkles size={13} /> Up to 45% OFF
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-slate-950">
                  {slide.title}
                </h1>

                <p className="text-slate-700 text-xs sm:text-sm font-bold">
                  {slide.subtitle}
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {slide.features.map((f, i) => (
                    <span key={i} className="text-xs font-bold text-emerald-950 bg-white/90 px-3 py-1 rounded-lg border border-emerald-200 shadow-xs">
                      ✓ {f}
                    </span>
                  ))}
                </div>

                <button 
                  onClick={() => setSelectedCategory(slide.category)}
                  className="mt-3 inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 border border-emerald-700"
                >
                  {slide.badge}
                </button>
              </div>

              {/* Right Column: Framed Full Produce Image (Clean White Border Frame) */}
              <div className="hidden sm:block relative w-1/2 max-w-[380px] md:max-w-[420px] h-[190px] md:h-[220px] rounded-2xl overflow-hidden border-4 border-white shadow-xl shrink-0 group">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-6 bg-emerald-600' : 'w-2 bg-slate-300'}`}
            />
          ))}
        </div>
      </div>

      {/* ── Section Title & Item Counter ── */}
      <div className="flex items-center justify-between pt-1 pb-1">
        <div>
          <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center gap-2">
            <span>{selectedCategory === 'All' ? 'All Products' : selectedCategory}</span>
            <span className="text-xs bg-slate-200 text-slate-950 px-2.5 py-0.5 rounded-full font-black border border-slate-300">
              {filtered.length} items
            </span>
          </h2>
        </div>
      </div>

      {/* ── Products Grid (4 Columns Layout with Full Product Images) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {filtered.map(product => {
          const inCart = cart.find(i => i.product_id === product.product_id);
          const stock = product.Inventory?.current_stock ?? 0;
          const isOutOfStock = stock === 0;
          const { discount, originalPrice } = getProductBadges(product.product_id, parseFloat(product.unit_price));

          return (
            <div 
              key={product.product_id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all duration-300 flex flex-col relative group overflow-hidden"
            >
              {/* Offer Badge Floating */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow-md">
                  {discount}
                </span>
              </div>

              {/* Product Image Container (Full Product Image - No Cropping) */}
              <div className="relative h-48 sm:h-52 w-full bg-slate-50/60 flex items-center justify-center p-4 border-b border-slate-100">
                <img 
                  src={product.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&w=800&q=80'} 
                  alt={product.product_name} 
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&w=800&q=80';
                  }}
                  className="max-h-full max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300" 
                />
              </div>

              {/* Product Details (Dark High Contrast Text) */}
              <div className="p-4 flex-1 flex flex-col">
                <span className="text-[10px] text-emerald-950 font-extrabold uppercase tracking-wider mb-1 bg-emerald-50 px-2 py-0.5 rounded w-fit border border-emerald-100">
                  {product.Category?.category_name || 'Grocery'}
                </span>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[40px]">
                  {product.product_name}
                </h3>
                
                {/* Price & MRP */}
                <div className="flex items-baseline gap-2 mt-2 mb-2">
                  <span className="text-xl font-black text-slate-900">
                    ₹{parseFloat(product.unit_price).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-semibold">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Stock Tag */}
                <div className="mb-3">
                  {isOutOfStock ? (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-0.5 rounded border border-red-100">
                      Out of stock
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                      {stock} left in store
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-auto">
                  {!isOutOfStock && (
                    inCart ? (
                      <div className="flex items-center justify-between p-1 bg-slate-100 rounded-xl border border-slate-200 shadow-inner">
                        <button 
                          onClick={() => updateQty(product.product_id, -1)} 
                          className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-900 font-bold hover:bg-slate-50 shadow-sm active:scale-95"
                        >
                          <Minus size={14} strokeWidth={2.5} />
                        </button>
                        <span className="font-black text-slate-900 text-sm">{inCart.quantity}</span>
                        <button 
                          onClick={() => updateQty(product.product_id, 1)} 
                          className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold hover:bg-emerald-700 shadow-sm active:scale-95"
                        >
                          <Plus size={14} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)} 
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <ShoppingCart size={15} /> Add to Cart
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Slide-Over Cart Drawer ── */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" 
              onClick={() => setShowCart(false)} 
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShoppingCart size={20} className="text-emerald-400" />
                  <div>
                    <h3 className="font-bold text-base">Shopping Cart</h3>
                    <p className="text-xs text-slate-400">{cartCount} items selected</p>
                  </div>
                </div>
                <button onClick={() => setShowCart(false)} className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700">
                  <X size={18} />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 overscroll-contain">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                    <ShoppingBag size={44} className="text-slate-300" />
                    <p className="font-bold text-slate-700 text-sm">Your cart is empty</p>
                    <p className="text-xs text-slate-400">Add products from the catalog to build your order.</p>
                  </div>
                ) : cart.map(item => (
                  <div key={item.product_id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                    <img 
                      src={item.image_url || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=300&q=80'} 
                      alt={item.product_name}
                      className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{item.product_name}</p>
                      <p className="text-emerald-700 font-bold text-xs mt-0.5">
                        ₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 p-1">
                      <button onClick={() => updateQty(item.product_id, -1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-slate-100"><Minus size={12} /></button>
                      <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, 1)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-emerald-50 text-emerald-700 font-bold"><Plus size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Footer */}
              {cart.length > 0 && (() => {
                const subTotal = cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
                const getFeePct = (m) => {
                  if (m === 'Credit Card') return 2.0;
                  if (m === 'Debit Card') return 1.0;
                  if (m === 'UPI') return 0.5;
                  return 0;
                };
                const feePct = getFeePct(paymentMethod);
                const processingFee = (subTotal * feePct) / 100;
                const deliveryFee = subTotal >= 499 ? 0 : 40;
                const grandTotalRounded = Math.round((subTotal + deliveryFee + processingFee) * 100) / 100;
                const methods = [
                  { id: 'Cash', label: 'Cash (0%)' },
                  { id: 'UPI', label: 'UPI (0.5%)' },
                  { id: 'Debit Card', label: 'Debit Card (1.0%)' },
                  { id: 'Credit Card', label: 'Credit Card (2.0%)' }
                ];

                return (
                  <div className="p-5 border-t border-slate-200 bg-white space-y-3 shrink-0">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-1 font-bold text-slate-700">
                        <span>Delivery Address</span>
                        <button onClick={() => { setShowCart(false); navigate('/customer/profile'); }} className="text-emerald-600 hover:underline">
                          Edit
                        </button>
                      </div>
                      {profile?.address ? (
                        <p className="text-slate-600 truncate">{profile.address}</p>
                      ) : (
                        <p className="text-red-500 font-bold">Address required in profile</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-1.5">Payment Method</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {methods.map(m => (
                          <button
                            key={m.id}
                            onClick={() => setPaymentMethod(m.id)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-bold border ${
                              paymentMethod === m.id 
                                ? 'bg-emerald-600 text-white border-emerald-600' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 font-semibold pt-1">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subTotal.toLocaleString('en-IN')}</span>
                      </div>
                      {processingFee > 0 && (
                        <div className="flex justify-between items-center text-slate-600">
                          <span>Processing Fee ({paymentMethod} @ {feePct}%)</span>
                          <span className="font-bold text-slate-900">₹{processingFee.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span>Delivery Fee</span>
                        {deliveryFee === 0 ? (
                          <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded text-[10px] border border-emerald-200">
                            FREE (Orders above ₹499)
                          </span>
                        ) : (
                          <span className="font-extrabold text-slate-900">₹{deliveryFee}</span>
                        )}
                      </div>
                    </div>

                    {subTotal < 499 && (
                      <p className="text-[11px] font-bold text-emerald-800 bg-emerald-50/90 p-2 rounded-xl border border-emerald-200 text-center">
                        Add ₹{(499 - subTotal).toLocaleString('en-IN')} more for <span className="font-extrabold text-emerald-700">FREE Delivery 🚚</span>
                      </p>
                    )}

                    <div className="flex justify-between items-end pt-2 border-t border-slate-200">
                      <span className="text-slate-900 font-bold text-sm">Grand Total</span>
                      <span className="text-xl font-black text-slate-900">₹{grandTotalRounded.toLocaleString('en-IN')}</span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={placeOrder.isPending || isPaying || !profile?.address}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {!profile?.address 
                        ? 'Address Required' 
                        : isPaying 
                        ? 'Processing Payment...' 
                        : `Pay ₹${grandTotalRounded.toLocaleString('en-IN')} & Place Order`}
                    </button>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
