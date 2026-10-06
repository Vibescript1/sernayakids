import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiShoppingBag, FiArrowRight, FiPackage, FiTruck, FiCheckCircle, FiClock, FiCalendar, FiCreditCard } from 'react-icons/fi';
import OrderDetailsModal from '../components/OrderDetailsModal';

export default function Orders() {
  const { orders, user, fetchUserOrders } = useShop();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'delivered'
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchUserOrders();
    }
  }, [user, navigate, fetchUserOrders]);

  if (!user) return null;

  // Helper to determine the active step in shipping
  const getOrderStep = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'delivered' || s === 'completed') return 4;
    if (s === 'shipped') return 3;
    if (s === 'processing') return 2;
    return 1; // Placed / pending
  };

  const filteredOrders = orders.filter(order => {
    const step = getOrderStep(order.status);
    if (activeTab === 'active') return step < 4;
    if (activeTab === 'delivered') return step === 4;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-12 text-left min-h-[75vh]"
    >
      {/* Header section */}
      <div className="border-b border-brand-navy/5 pb-6 mb-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-black text-brand-navy mb-2 flex items-center gap-2.5">
            <span className="p-2 bg-bg-pink-light/60 rounded-2xl inline-block text-brand-coral">
              <FiShoppingBag className="text-2xl" />
            </span> 
            Order History
          </h1>
          <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
            Track active packages, browse completed orders, and view billing invoices.
          </p>
        </div>

        {/* Tab Controls */}
        {orders.length > 0 && (
          <div className="flex bg-white p-1 rounded-full border border-brand-navy/5 shadow-sm self-start md:self-auto">
            {['all', 'active', 'delivered'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab 
                    ? 'bg-brand-coral text-white shadow-sm' 
                    : 'text-brand-navy/60 hover:text-brand-coral hover:bg-bg-cream/40'
                }`}
              >
                {tab === 'all' ? 'All Orders' : tab === 'active' ? 'In Progress' : 'Delivered'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-brand-navy/5 rounded-[40px] max-w-xl mx-auto shadow-md p-8 md:p-12">
          <div className="w-20 h-20 bg-bg-pink-light/60 rounded-full flex items-center justify-center text-brand-coral text-3xl mx-auto mb-6 animate-pulse">
            <FiShoppingBag />
          </div>
          <h2 className="text-2xl font-black text-brand-navy mb-3">Your Wardrobe Awaits</h2>
          <p className="text-xs sm:text-sm text-brand-navy/50 font-semibold mb-8 max-w-xs mx-auto leading-relaxed">
            You haven't placed any premium children clothing orders yet. Let's find something lovely for your little ones!
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-4 px-10 rounded-full shadow-lg shadow-brand-coral/25 transition-all">
            Explore Collection <FiArrowRight />
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-brand-navy/5 rounded-[32px] max-w-md mx-auto p-6">
          <p className="text-xs sm:text-sm text-brand-navy/50 font-bold">No orders match this status filter.</p>
          <button onClick={() => setActiveTab('all')} className="mt-4 text-xs font-black text-brand-coral underline hover:text-brand-coral-hover">Show all orders</button>
        </div>
      ) : (
        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const currentStep = getOrderStep(order.status);
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  key={order.id} 
                  className="bg-white border border-brand-navy/5 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top Meta Header */}
                  <div className="bg-bg-cream/40 border-b border-brand-navy/5 px-6 py-5 md:px-8 flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex flex-wrap gap-x-8 gap-y-2 text-xs font-semibold text-brand-navy/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-navy/40 block mb-1">Order Identifier</span>
                        <span className="font-black text-brand-navy text-sm md:text-base">#{order.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-navy/40 block mb-1">Date Ordered</span>
                        <span className="font-bold text-brand-navy/80 flex items-center gap-1.5"><FiCalendar className="text-brand-coral" /> {order.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-brand-navy/40 block mb-1">Total Billing</span>
                        <span className="font-black text-brand-coral text-sm">₹{order.total}</span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <span className={`text-[10px] uppercase font-black py-1.5 px-4 rounded-full border ${
                        currentStep === 4 
                          ? 'bg-green-50 text-green-700 border-green-200/50' 
                          : 'bg-amber-50 text-amber-700 border-amber-200/50'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    
                    {/* Items Thumbnails list */}
                    <div className="lg:col-span-5 space-y-4">
                      <div className="divide-y divide-brand-navy/5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-12 h-16 rounded-xl object-cover border border-brand-navy/5 bg-bg-cream/40 shrink-0" />
                            ) : (
                              <div className="w-12 h-16 rounded-xl bg-bg-cream/40 border border-brand-navy/5 flex items-center justify-center shrink-0">
                                <FiPackage className="text-brand-navy/30" />
                              </div>
                            )}
                            <div className="text-left flex flex-col justify-center min-w-0">
                              <h4 className="text-xs sm:text-sm font-black text-brand-navy truncate">{item.name}</h4>
                              <p className="text-[10px] text-brand-navy/50 font-bold uppercase mt-1">
                                {item.color && `Color: ${item.color} | `}{item.size && `Size: ${item.size} | `}Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progress tracking line */}
                    <div className="lg:col-span-7 bg-bg-cream/20 border border-brand-navy/5 rounded-2xl p-5 md:p-6 text-center">
                      <h4 className="text-[10px] font-black uppercase text-brand-navy/40 tracking-wider text-left mb-6">Delivery Progress</h4>
                      
                      <div className="relative flex justify-between items-center max-w-md mx-auto">
                        {/* Connection line container */}
                        <div className="absolute left-4 right-4 top-[14px] h-[3px] z-0">
                          {/* Background connection line */}
                          <div className="w-full h-full bg-brand-navy/5" />
                          {/* Progress line with framer motion transition & color gradient */}
                          <motion.div 
                            initial={{ width: 0, opacity: 1 }}
                            animate={{ 
                              width: `${((currentStep - 1) / 3) * 100}%`,
                              opacity: currentStep < 4 ? [0.4, 1, 0.4] : 1
                            }}
                            transition={{ 
                              width: { duration: 1.0, ease: "easeInOut" },
                              opacity: currentStep < 4 ? { repeat: Infinity, duration: 1.5, ease: "easeInOut" } : { duration: 0.3 }
                            }}
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 via-amber-500 via-indigo-500 to-emerald-500 origin-left"
                          />
                        </div>

                        {/* Steps */}
                        {[
                          { label: 'Placed', icon: FiPackage, stepNum: 1, colorClass: 'bg-blue-500 shadow-blue-500/20', ringClass: 'ring-blue-500/15', activeText: 'text-blue-600' },
                          { label: 'Processing', icon: FiClock, stepNum: 2, colorClass: 'bg-amber-500 shadow-amber-500/20', ringClass: 'ring-amber-500/15', activeText: 'text-amber-600' },
                          { label: 'Shipped', icon: FiTruck, stepNum: 3, colorClass: 'bg-indigo-500 shadow-indigo-500/20', ringClass: 'ring-indigo-500/15', activeText: 'text-indigo-600' },
                          { label: 'Delivered', icon: FiCheckCircle, stepNum: 4, colorClass: 'bg-emerald-500 shadow-emerald-500/20', ringClass: 'ring-emerald-500/15', activeText: 'text-emerald-600' }
                        ].map((step) => {
                          const StepIcon = step.icon;
                          const isDone = currentStep >= step.stepNum;
                          const isCurrent = currentStep === step.stepNum;

                          return (
                            <div key={step.stepNum} className="flex flex-col items-center">
                              <div 
                                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                  isDone 
                                    ? `${step.colorClass} text-white scale-110 shadow-md` 
                                    : 'bg-white border-2 border-brand-navy/10 text-brand-navy/30'
                                } ${isCurrent ? `ring-4 ${step.ringClass}` : ''}`}
                              >
                                <StepIcon className="text-sm" />
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase mt-2 ${
                                isCurrent ? step.activeText : isDone ? 'text-brand-navy' : 'text-brand-navy/40'
                              }`}>{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Footer Action Details */}
                  <div className="border-t border-brand-navy/5 px-6 py-4 md:px-8 flex justify-between items-center bg-bg-cream/10 flex-wrap gap-3">
                    <span className="text-[10px] text-brand-navy/45 font-bold uppercase tracking-wider">
                      Method: {order.paymentMode === 'cod' ? 'Cash On Delivery' : 'Prepaid Card'}
                    </span>
                    {order.status !== 'Payment Pending' && order.status !== 'Checkout Draft' && (
                      <Link
                        to={`/invoice/${order.id}`}
                        className="bg-brand-navy hover:bg-brand-coral text-white text-xs font-bold py-2.5 px-6 rounded-full cursor-pointer transition-colors text-center inline-block"
                      >
                        View Invoice
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Details Popup Modal */}
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </motion.div>
  );
}
