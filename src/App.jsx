import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from './context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { fbqTrack } from './utils/pixel';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ScrollToTop from './components/ScrollToTop';
import SaleSidebar from './components/SaleSidebar';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Profile from './pages/Profile';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Orders from './pages/Orders';
import Invoice from './pages/Invoice';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';

// Icons
import { FiX, FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiGift, FiArrowRight, FiCheckCircle, FiAlertTriangle, FiInfo } from 'react-icons/fi';

export default function App() {
  const { 
    cart, updateQty, removeFromCart, cartSubtotal, discountAmount, 
    discountedSubtotal, isFreeShipping, shippingCost, cartTotal, 
    handleApplyCoupon, handleRemoveCoupon, couponCode, appliedDiscount, toasts, cartCount, showToast, PRODUCTS
  } = useShop();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [localCoupon, setLocalCoupon] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fbqTrack('PageView');
  }, [location.pathname]);


  const handleCouponSubmit = (e) => {
    e.preventDefault();
    const couponRegex = /^[a-zA-Z0-9]{3,15}$/;
    if (!couponRegex.test(localCoupon.trim())) {
      showToast('Please enter a valid coupon code (3-15 alphanumeric characters).');
      return;
    }
    handleApplyCoupon(localCoupon.trim().toUpperCase());
  };

  return (
    <div className="min-h-screen bg-bg-cream text-brand-navy flex flex-col font-body antialiased relative">
      <ScrollToTop />
      
      {/* Dynamic Header Component */}
      <Header setIsCartOpen={setIsCartOpen} setIsSizeModalOpen={setIsSizeModalOpen} />

      {/* Main Pages Switchboard */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/page/:page" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails setIsSizeModalOpen={setIsSizeModalOpen} />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/invoice/:orderId" element={<Invoice />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Dynamic Footer Component */}
      <Footer setIsSizeModalOpen={setIsSizeModalOpen} />

      {/* Cart side drawer overlay */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-brand-navy/40 z-50 pointer-events-auto"
          />
        )}
        {isCartOpen && (
          <motion.aside
            key="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-[400px] h-full bg-white shadow-2xl flex flex-col z-50 p-6 md:p-8"
          >
            <div className="flex justify-between items-center pb-4 border-b border-brand-navy/8 mb-6">
              <span className="font-heading text-sm font-black text-brand-navy tracking-wider uppercase">Shopping Bag ({cartCount})</span>
              <button onClick={() => setIsCartOpen(false)} className="text-lg hover:text-brand-coral cursor-pointer" aria-label="Close cart drawer">
                <FiX />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <FiShoppingBag className="text-4xl text-brand-navy/20 mb-4 animate-bounce" />
                <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold mb-6">Your shopping bag is completely empty.</p>
                <button 
                  onClick={() => { setIsCartOpen(false); navigate('/shop'); }}
                  className="bg-brand-navy hover:bg-black text-white text-xs font-bold py-3 px-6 rounded-full transition-colors cursor-pointer"
                >
                  Start Exploring Outfits
                </button>
              </div>
            ) : (
              <>
                {/* Cart items list */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 hide-scrollbar">
                  {cart.map(item => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className="flex gap-4 p-3 bg-bg-cream/40 border border-brand-navy/5 rounded-2xl">
                      <img src={item.img} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 text-left min-w-0">
                        <h4 className="text-xs font-black text-brand-navy truncate">{item.name}</h4>
                        <span className="text-[9px] text-brand-navy/50 font-bold block mt-1 uppercase">Color: {item.color} | Size: {item.size}</span>
                        <div className="flex justify-between items-center mt-3">
                          {/* Qty update */}
                          <div className="flex items-center justify-between border border-brand-navy/15 rounded-full p-0.5 w-20 bg-white">
                            <button onClick={() => updateQty(item.id, item.color, item.size, -1)} className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-brand-navy/60 hover:text-brand-coral cursor-pointer"><FiMinus className="text-[8px]" /></button>
                            <span className="text-[10px] font-black text-brand-navy">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, item.color, item.size, 1)} className="w-5 h-5 rounded-full flex items-center justify-center font-bold text-brand-navy/60 hover:text-brand-coral cursor-pointer"><FiPlus className="text-[8px]" /></button>
                          </div>
                          {(() => {
                            const productObj = PRODUCTS?.find(p => 
                              String(p.id) === String(item.id) || 
                              (parseInt(p.id, 10) === parseInt(item.id, 10) && !isNaN(parseInt(p.id, 10)))
                            );
                            const isTwentyPercentOff = productObj ? productObj.isTwentyPercentOff : item.isTwentyPercentOff;
                            const isSale20 = couponCode && couponCode.toUpperCase() === 'SALE20';
                            const hasDiscount = appliedDiscount > 0 && (isSale20 ? isTwentyPercentOff : true);
                            
                            if (hasDiscount) {
                              const discountedTotal = Math.round(item.price * item.quantity * (1 - appliedDiscount));
                              return (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-brand-navy/35 font-extrabold line-through">Rs. {item.price * item.quantity}</span>
                                  <span className="text-xs font-black text-[#2f9e50]">Rs. {discountedTotal}</span>
                                </div>
                              );
                            }
                            return (
                              <span className="text-xs font-black text-brand-coral">Rs. {item.price * item.quantity}</span>
                            );
                          })()}
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id, item.color, item.size)} className="text-brand-navy/30 hover:text-brand-coral h-fit self-center cursor-pointer">
                        <FiTrash2 className="text-base" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Summary & Buttons footer */}
                <div className="border-t border-brand-navy/8 pt-6 mt-4 space-y-4">
                  {couponCode ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-full py-2 px-4 text-xs font-bold text-green-700">
                      <span>Applied: {couponCode}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveCoupon();
                          setLocalCoupon('');
                        }}
                        className="text-red-500 hover:text-red-700 font-extrabold uppercase ml-2 text-[10px] tracking-wider cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCouponSubmit} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="DISCOUNT CODE" 
                        value={localCoupon}
                        onChange={(e) => setLocalCoupon(e.target.value)}
                        className="flex-1 bg-bg-cream/70 border border-brand-navy/10 rounded-full py-2 px-4 text-xs font-bold text-brand-navy uppercase outline-none focus:bg-white focus:border-brand-coral"
                      />
                      <button type="submit" className="bg-brand-navy hover:bg-brand-coral text-white text-xs font-bold py-2 px-5 rounded-full transition-colors cursor-pointer">Apply</button>
                    </form>
                  )}

                  <div className="flex flex-col gap-2.5 text-xs font-semibold text-brand-navy/80">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rs. {cartSubtotal}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="flex items-center gap-1"><FiGift /> Discount ({Math.round(appliedDiscount*100)}%):</span>
                        <span>-Rs. {discountAmount.toFixed(0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping Cost:</span>
                      <span>{isFreeShipping ? 'FREE' : `Rs. ${shippingCost}`}</span>
                    </div>
                    <div className="flex justify-between border-t border-brand-navy/5 pt-3 text-sm font-black text-brand-navy">
                      <span>Total:</span>
                      <span className="text-brand-coral">Rs. {cartTotal.toFixed(0)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/cart');
                    }}
                    className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-brand-coral/20 cursor-pointer"
                  >
                    Checkout Bag <FiArrowRight />
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Size Guide Modal dialog */}
      <AnimatePresence>
        {isSizeModalOpen && (
          <motion.div
            key="size-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-brand-navy/40 z-50 flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsSizeModalOpen(false)}
          />
        )}
        {isSizeModalOpen && (
          <motion.div
            key="size-modal-content"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bg-[#FBF9F4] w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl z-50 border border-brand-navy/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="p-6 border-b border-brand-navy/6 bg-white flex justify-between items-center">
              <h3 className="text-sm sm:text-base font-black text-brand-navy">Sernaya Kids Size Guide Chart</h3>
              <button onClick={() => setIsSizeModalOpen(false)} className="text-xl hover:text-brand-coral cursor-pointer" aria-label="Close size guide dialog">
                <FiX />
              </button>
            </div>
            <div className="p-6 text-left max-h-[400px] overflow-y-auto">
              <p className="text-xs text-brand-navy/70 leading-relaxed mb-6 font-semibold">
                Please refer to our standard measurements chart to pick the best size for your child. If in doubt, we suggest sizing up for a loose, comfortable fit.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-brand-navy border-collapse text-left font-semibold">
                  <thead>
                    <tr className="bg-bg-pink-light">
                      <th className="p-3 border-b border-brand-navy/8">Size/Age</th>
                      <th className="p-3 border-b border-brand-navy/8">Height</th>
                      <th className="p-3 border-b border-brand-navy/8">Chest</th>
                      <th className="p-3 border-b border-brand-navy/8">Waist</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { age: '0-3 Months', h: '20" - 24"', c: '16"', w: '15"' },
                      { age: '3-6 Months', h: '24" - 27"', c: '17"', w: '16"' },
                      { age: '6-12 Months', h: '27" - 30"', c: '18"', w: '17"' },
                      { age: '1-2 Years', h: '31" - 34"', c: '19.5"', w: '18.5"' },
                      { age: '2-3 Years', h: '35" - 38"', c: '21"', w: '20.5"' },
                      { age: '3-4 Years', h: '38" - 41"', c: '22"', w: '21"' },
                      { age: '4-5 Years', h: '41" - 44"', c: '23"', w: '21.5"' },
                      { age: '5-6 Years', h: '44" - 47"', c: '24"', w: '22"' },
                      { age: '7-8 Years', h: '48" - 51"', c: '26"', w: '23.5"' }
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-white/40 transition-colors">
                        <td className="p-3 border-b border-brand-navy/5 font-extrabold">{row.age}</td>
                        <td className="p-3 border-b border-brand-navy/5 text-brand-navy/70">{row.h}</td>
                        <td className="p-3 border-b border-brand-navy/5 text-brand-navy/70">{row.c}</td>
                        <td className="p-3 border-b border-brand-navy/5 text-brand-navy/70">{row.w}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notifications */}
      <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const isError = toast.type === 'error';
            const isInfo = toast.type === 'info';
            
            let bgClass = "bg-gradient-to-r from-brand-coral to-rose-400 text-white shadow-brand-coral/25";
            let Icon = FiCheckCircle;

            if (isError) {
              bgClass = "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-500/25";
              Icon = FiAlertTriangle;
            } else if (isInfo) {
              bgClass = "bg-gradient-to-r from-brand-navy to-indigo-900 text-white shadow-brand-navy/25";
              Icon = FiInfo;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`${bgClass} py-3.5 px-6 rounded-2xl shadow-xl flex items-center gap-3.5 text-xs font-bold pointer-events-auto border border-white/10`}
              >
                <Icon className="text-white shrink-0 text-base" />
                <span>{toast.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Floating Sale notification sidebar widget */}
      <SaleSidebar />

      {/* Floating WhatsApp chat widget */}
      <WhatsAppButton />

    </div>
  );
}
