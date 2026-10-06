import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingBag, FiStar } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa6';
import { getColorMeta } from '../utils/colorHelper';

export default function ProductCard({ product }) {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || (typeof product.colors?.[0] === 'string' ? product.colors[0] : ''));

  const isSaved = wishlist.includes(product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, selectedColor, '');
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(10, 30, 51, 0.08), 0 8px 10px -6px rgba(10, 30, 51, 0.08)" }}
      viewport={{ once: true }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white border border-brand-navy/8 rounded-[24px] overflow-hidden flex flex-col group text-left relative"
    >
      {/* Badge & Image Container */}
      <div className="aspect-10/11 bg-bg-pink-light relative overflow-hidden shrink-0">
        {!product.inStock && (
          <span className="absolute top-4 left-4 z-10 text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm bg-gray-500 text-white">
            Out of Stock
          </span>
        )}
        {product.inStock && product.isTwentyPercentOff && (
          <span className="absolute top-4 left-4 z-10 text-[8px] md:text-[9px] font-black uppercase tracking-widest py-1 px-2.5 rounded-full shadow-md bg-brand-coral text-white animate-pulse flex items-center gap-1">
            <span className="inline-block animate-bounce">🔥</span> Hot Deal 20% OFF
          </span>
        )}
        {product.inStock && !product.isTwentyPercentOff && product.tag && (
          <span className={`absolute top-4 left-4 z-10 text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm ${product.tagColor || 'bg-brand-coral text-white'}`}>
            {product.tag}
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product.id, product.name);
          }}
          className="absolute top-4 right-4 z-10 w-8.5 h-8.5 bg-white hover:bg-bg-pink-light rounded-full flex items-center justify-center text-xs shadow-sm transition-colors cursor-pointer"
          aria-label="Save to wishlist"
        >
          {isSaved ? <FaHeart className="text-red-500 text-sm" /> : <FiHeart className="text-brand-navy text-sm" />}
        </button>

        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </Link>

        {/* Quick Add Overlay */}
        <button
          onClick={handleQuickAdd}
          disabled={!product.inStock}
          className={`absolute bottom-4 left-4 right-4 z-10 text-xs font-bold py-3 px-4 rounded-full flex items-center justify-center gap-2 shadow-md transition-all duration-300 lg:translate-y-12 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 cursor-pointer ${
            product.inStock 
              ? 'bg-brand-navy hover:bg-brand-coral text-white' 
              : 'bg-gray-400 text-white cursor-not-allowed opacity-100'
          }`}
        >
          {product.inStock ? (
            <>
              <FiShoppingBag className="text-xs" /> Quick Add
            </>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>

      {/* Product Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating stars */}
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex text-amber-400 text-xs">
              <FiStar className="fill-current text-amber-400" />
            </div>
            <span className="text-[10px] text-brand-navy/60 font-black">{product.rating} ({product.reviews})</span>
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-heading text-sm font-extrabold text-brand-navy mb-2 truncate hover:text-brand-coral transition-colors" title={product.name}>
              {product.name}
            </h3>
          </Link>

          {/* Colors swatches preview */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex gap-2 mb-3">
              {product.colors.map(color => {
                const colorName = typeof color === 'string' ? color : color.name;
                const meta = getColorMeta(colorName);
                const colorStyle = color.style || meta.style || (meta.hex ? { backgroundColor: meta.hex } : undefined);
                const colorClass = color.class || meta.class || '';
                const isSelected = selectedColor === colorName;

                return (
                  <button
                    key={colorName}
                    onClick={() => setSelectedColor(colorName)}
                    className={`w-3.5 h-3.5 rounded-full border border-black/10 transition-all cursor-pointer ${colorClass} ${isSelected ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-brand-navy shadow-xs' : 'hover:scale-110'}`}
                    style={colorStyle}
                    title={colorName}
                    aria-label={`Select color ${colorName}`}
                  />
                );
              })}
            </div>
          )}

          {/* Size labels preview */}
          <div className="flex flex-wrap gap-1 mb-4 text-[9px] font-bold">
            {product.sizes?.map(size => {
              let isSizeInStock = true;
              if (product.variations && product.variations.length > 0) {
                const cleanSelectedSize = size ? size.toLowerCase().replace(/[^a-z0-9]/g, '').replace('years', 'y').replace('year', 'y') : '';
                const matched = product.variations.find(v => {
                  if (!v.attributes?.nodes) return false;
                  return v.attributes.nodes.every(attr => {
                    const attrName = attr.name.toLowerCase();
                    const attrVal = attr.value;
                    if (attrName.includes('size') || attrName === 'age' || attrName.includes('age')) {
                      const cleanAttrVal = attrVal ? attrVal.toLowerCase().replace(/[^a-z0-9]/g, '').replace('years', 'y').replace('year', 'y') : '';
                      return !attrVal || cleanAttrVal === cleanSelectedSize;
                    }
                    return true;
                  });
                });
                if (matched) isSizeInStock = matched.inStock;
              }

              return (
                <span 
                  key={size} 
                  className={`px-2 py-0.5 rounded-md border transition-all ${
                    isSizeInStock 
                      ? 'bg-bg-cream border-brand-navy/5 text-brand-navy/60' 
                      : 'bg-gray-100 border-gray-250 text-gray-400 line-through opacity-50'
                  }`}
                  title={isSizeInStock ? `${size} - In Stock` : `${size} - Out of Stock`}
                >
                  {size}
                </span>
              );
            })}
          </div>
        </div>

        {/* Pricing */}
        <div className="flex justify-between items-center pt-2.5 border-t border-brand-navy/5">
          {product.isTwentyPercentOff ? (
            <>
              <span className="text-[11px] text-brand-navy/40 font-extrabold line-through">Rs. {product.price}</span>
              <span className="text-sm font-black text-[#2f9e50] animate-pulse">Rs. {Math.round(product.price * 0.8)}</span>
            </>
          ) : (
            <>
              <span className="text-[11px] text-brand-navy/40 font-extrabold line-through">Rs. {product.originalPrice}</span>
              <span className="text-sm font-black text-brand-coral">Rs. {product.price}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
