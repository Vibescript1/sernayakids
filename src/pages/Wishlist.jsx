import React from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { FiHeart, FiShoppingBag, FiArrowRight } from 'react-icons/fi';

export default function Wishlist() {
  const { wishlist, PRODUCTS, toggleWishlist } = useShop();

  const savedProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-12 text-left"
    >
      <div className="border-b border-brand-navy/5 pb-6 mb-8">
        <h1 className="text-3xl font-black text-brand-navy mb-2 flex items-center gap-2">
          <FiHeart className="text-brand-coral fill-brand-coral/10" /> My Saved Outfits
        </h1>
        <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
          Review the pieces you saved for future purchases.
        </p>
      </div>

      {savedProducts.length === 0 ? (
        <div className="text-center py-20 bg-white border border-brand-navy/5 rounded-[32px] max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-bg-pink-light rounded-full flex items-center justify-center text-brand-coral text-2xl mx-auto mb-6">
            <FiHeart />
          </div>
          <h2 className="text-xl font-black text-brand-navy mb-3">Your Wishlist is Empty</h2>
          <p className="text-xs sm:text-sm text-brand-navy/50 font-semibold mb-8 max-w-xs mx-auto">
            Browse Sernaya Kids catalog and tap the heart icon on any outfit to save it here!
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md shadow-brand-coral/15 transition-all">
            Start Exploring Catalog <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {savedProducts.map(product => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className="absolute top-24 right-4 z-20 bg-brand-navy hover:bg-red-500 text-white text-[10px] font-bold py-1.5 px-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md cursor-pointer"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
