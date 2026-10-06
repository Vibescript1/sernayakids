import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiGift, FiCopy, FiCheck, FiClock, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function SaleSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();


  const handleCopyCode = () => {
    navigator.clipboard.writeText("SALE20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Floating Sticky Tab / Button */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <motion.button
          onClick={() => setIsOpen(true)}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: 'spring', delay: 1 }}
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 bg-gradient-to-l from-brand-coral to-[#FF5F7E] text-white py-3 px-4 rounded-l-2xl shadow-xl font-bold text-xs uppercase tracking-widest cursor-pointer group border-l-2 border-white/30"
          style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
        >
          <span className="flex items-center gap-1.5 justify-center py-1">
            <FiGift className="text-sm rotate-90 animate-bounce group-hover:scale-110 transition-transform" />
            20% OFF SALE
          </span>
        </motion.button>
      </div>

      {/* Sale Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="sale-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-brand-navy/50 z-50 pointer-events-auto backdrop-blur-xs"
          />
        )}
        {isOpen && (
          <motion.aside
            key="sale-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 w-full max-w-[380px] h-full bg-[#FBF9F4] shadow-2xl flex flex-col z-50 p-6 md:p-8 overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-brand-navy/8 mb-6 shrink-0">
              <span className="font-heading text-xs font-black text-brand-navy tracking-wider uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-coral animate-ping" />
                Sale Is Live!
              </span>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-8 h-8 rounded-full border border-brand-navy/10 flex items-center justify-center text-lg hover:text-brand-coral hover:border-brand-coral transition-colors cursor-pointer" 
                aria-label="Close sale sidebar"
              >
                <FiX />
              </button>
            </div>

            {/* Sale Visual Card */}
            <div className="bg-linear-to-br from-brand-coral via-[#FF5F7E] to-[#FF8E53] text-white p-6 rounded-3xl text-left relative overflow-hidden shadow-md mb-6 shrink-0 flex flex-col gap-1.5">
              <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div>
                <span className="inline-block text-[9px] font-black tracking-widest text-brand-coral bg-white px-2.5 py-0.5 rounded-full mb-2 uppercase shadow-xs">Active Offer</span>
              </div>
              <h3 className="text-lg md:text-xl font-black leading-tight text-white">THE GRAND SEASON SALE</h3>
              <p className="text-[11px] text-white/90 font-semibold leading-relaxed">
                Enjoy a massive 20% discount on all kids apparel! Outfits, Summer specials, Newborn essentials, and much more.
              </p>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight text-white">20% OFF</span>
                <span className="text-[10px] font-bold text-white/80 uppercase">On Selected Items</span>
              </div>
            </div>

            {/* Sale Live Banner */}
            <div className="bg-gradient-to-r from-brand-coral/10 to-[#FF5F7E]/10 border border-brand-coral/20 p-5 rounded-2xl mb-6 shrink-0 text-center flex flex-col items-center justify-center gap-2">
              <div className="text-2xl animate-bounce">🎉 🥳 🎉</div>
              <span className="text-sm md:text-base font-black text-brand-navy tracking-tight uppercase animate-pulse">
                SALE IS LIVE NOW!
              </span>
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigate('/shop?category=20-off');
                }}
                className="mt-2 bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-black py-2.5 px-6 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                Shop Now <FiArrowRight />
              </button>
            </div>

            {/* Promo Code Box */}
            <div className="bg-white border border-dashed border-brand-coral/40 p-5 rounded-2xl mb-6 flex flex-col items-center gap-3 text-center shrink-0">
              <span className="text-[10px] font-black text-brand-navy/50 uppercase tracking-widest">Your Coupon Code</span>
              <div className="flex items-center justify-between bg-bg-cream border border-brand-navy/5 rounded-xl px-4 py-2.5 w-full font-mono text-sm font-black text-brand-navy select-all tracking-wider relative">
                <span>SALE20</span>
                <button 
                  onClick={handleCopyCode} 
                  className="text-brand-coral hover:text-brand-coral-hover p-1 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copied ? <FiCheck className="text-green-500 text-sm" /> : <FiCopy className="text-sm" />}
                </button>
              </div>
              <p className="text-[9px] text-brand-navy/50 font-bold leading-normal">
                Copy the code and paste it into the coupon field during checkout to apply your discount immediately!
              </p>
            </div>

            {/* Quick Links / CTAs */}
            {/* <div className="mt-auto space-y-3 pt-6 border-t border-brand-navy/8 shrink-0">
              <button 
                onClick={() => { setIsOpen(false); navigate('/shop'); }}
                className="w-full bg-brand-navy hover:bg-black text-white text-xs font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <FiShoppingBag className="text-sm" />
                Pre-fill Your Cart
              </button>
              <button 
                onClick={() => { setIsOpen(false); navigate('/shop?category=newborn'); }}
                className="w-full bg-transparent hover:bg-bg-cream text-brand-navy border border-brand-navy/15 text-xs font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                Browse Newborn Essentials
                <FiArrowRight className="text-sm" />
              </button>
            </div> */}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
