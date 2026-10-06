import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function NotFound() {
  return (
    <div className="max-w-[1260px] mx-auto px-6 py-20 flex justify-center items-center min-h-[75vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-white border border-brand-navy/5 p-8 sm:p-16 rounded-[40px] shadow-lg text-center"
      >
        <div className="text-[120px] font-black text-brand-coral/10 leading-none mb-4 select-none font-heading">
          404
        </div>
        
        <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-navy mb-4">
          Oops! Page Not Found
        </h2>
        
        <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold mb-8 max-w-sm mx-auto leading-relaxed">
          It seems this little outfit has wandered off! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link 
            to="/" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md transition-all cursor-pointer"
          >
            <FiHome /> Return Home
          </Link>
          <Link 
            to="/shop" 
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md shadow-brand-coral/20 transition-all cursor-pointer"
          >
            Shop Collections <FiArrowRight />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
