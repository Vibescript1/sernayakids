import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { FiHeart, FiShoppingBag, FiStar, FiInfo, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa6';
import useSEO from '../hooks/useSEO';
import { fbqTrack } from '../utils/pixel';
import { getColorMeta } from '../utils/colorHelper';

export default function ProductDetails({ setIsSizeModalOpen }) {
  const id = useParams().id;
  const { PRODUCTS, addToCart, wishlist, toggleWishlist, loadingCatalog } = useShop();

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [qty, setQty] = useState(1);
  const [activeDetailsTab, setActiveDetailsTab] = useState('description');
  const [activeImage, setActiveImage] = useState('');

  const product = PRODUCTS?.find(p => p.id === id);

  useSEO({
    title: product ? `${product.name} - Kids Wear` : 'Product Details',
    description: product ? `Buy ${product.name} online at Sernaya Kids. Specially designed ${product.category} collection crafted for comfort and style.` : 'View premium children clothing product details.',
    ogImage: product ? product.img : 'logo.webp'
  });

  const normalizeAttrValue = (val) => {
    if (!val) return '';
    return val.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace('years', 'y')
      .replace('year', 'y');
  };

  useEffect(() => {
    if (!product) return;
    // Reset selections on product change
    let defaultColor = product.colors?.[0]?.name || (typeof product.colors?.[0] === 'string' ? product.colors[0] : '');
    let defaultSize = product.sizes?.[0] || '';

    if (product.variations && product.variations.length > 0) {
      // Find the first variation that is in stock
      const inStockVar = product.variations.find(v => v.inStock && (v.stockQuantity === null || v.stockQuantity > 0));
      if (inStockVar && inStockVar.attributes?.nodes) {
        const colorAttr = inStockVar.attributes.nodes.find(attr => attr.name.toLowerCase().includes('color'));
        const sizeAttr = inStockVar.attributes.nodes.find(attr => attr.name.toLowerCase().includes('size') || attr.name.toLowerCase() === 'age' || attr.name.toLowerCase().includes('age'));
        
        if (colorAttr && colorAttr.value) {
          const matchedColor = product.colors?.find(c => normalizeAttrValue(c.name || c) === normalizeAttrValue(colorAttr.value));
          if (matchedColor) defaultColor = matchedColor.name || matchedColor;
        }
        if (sizeAttr && sizeAttr.value) {
          const matchedSize = product.sizes?.find(s => normalizeAttrValue(s) === normalizeAttrValue(sizeAttr.value));
          if (matchedSize) defaultSize = matchedSize;
        }
      }
    }

    setSelectedColor(defaultColor);
    setSelectedSize(defaultSize);
    setQty(1);
    setActiveImage(product.images?.[0] || product.img);
    
    // Track ViewContent on Meta Pixel
    fbqTrack('ViewContent', {
      content_ids: [product.id],
      content_type: 'product',
      content_name: product.name,
      value: product.price ? parseFloat(product.price) : 0,
      currency: 'INR',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);


  const matchedVariation = product?.variations?.find(v => {
    if (!v.attributes?.nodes) return false;
    return v.attributes.nodes.every(attr => {
      const attrName = attr.name.toLowerCase();
      const attrVal = attr.value;
      if (attrName.includes('color')) {
        return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(selectedColor);
      }
      if (attrName.includes('size') || attrName === 'age' || attrName.includes('age')) {
        return !attrVal || normalizeAttrValue(attrVal) === normalizeAttrValue(selectedSize);
      }
      return true;
    });
  });

  const currentStockQuantity = product ? (matchedVariation ? matchedVariation.stockQuantity : product.stockQuantity) : null;
  const isCurrentVariationInStock = product ? (matchedVariation 
    ? (matchedVariation.inStock && (matchedVariation.stockQuantity === null || matchedVariation.stockQuantity > 0)) 
    : (product.inStock && (product.stockQuantity === null || product.stockQuantity > 0))) : false;

  // Clamp selected quantity to available stock limit
  useEffect(() => {
    if (isCurrentVariationInStock && currentStockQuantity !== null && currentStockQuantity > 0) {
      if (qty > currentStockQuantity) {
        setQty(currentStockQuantity);
      }
    }
  }, [selectedSize, selectedColor, currentStockQuantity, qty, isCurrentVariationInStock]);

  if (loadingCatalog) {
    return (
      <div className="max-w-[1260px] mx-auto px-6 py-10 text-left animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="flex gap-2 items-center mb-8">
          <div className="h-4 bg-gray-200 rounded w-12" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* Left: Gallery Skeleton */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[9/10] bg-gray-200 rounded-3xl animate-pulse" />
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Right: Info Controls Skeleton */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>

            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />

            <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse" />

            <div className="h-16 bg-gray-200 rounded-2xl w-full animate-pulse" />

            <div className="space-y-3 pt-4">
              <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/5 animate-pulse" />
              <div className="flex gap-2">
                <div className="w-16 h-8 rounded-lg bg-gray-200 animate-pulse" />
                <div className="w-16 h-8 rounded-lg bg-gray-200 animate-pulse" />
                <div className="w-16 h-8 rounded-lg bg-gray-200 animate-pulse" />
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <div className="flex-1 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1260px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-black text-brand-navy mb-4">Product Not Found</h2>
        <p className="text-xs text-brand-navy/60 font-semibold mb-8">The product you are trying to view does not exist or has been removed.</p>
        <Link to="/shop" className="bg-brand-navy text-white font-bold text-xs py-3.5 px-8 rounded-full">Back to Shop Catalog</Link>
      </div>
    );
  }

  const isSaved = product ? wishlist.includes(product.id) : false;

  const handleAddToCart = () => {
    if (!isCurrentVariationInStock) return;
    addToCart(product, selectedColor, selectedSize, qty);
  };

  const relatedProducts = PRODUCTS.filter(
    p => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images || [product.img],
    "description": product.description || `Sernaya Kids premium kids wear collection - ${product.name}`,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Sernaya Kids"
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": isCurrentVariationInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || "4.8",
      "reviewCount": product.reviews || "15"
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-10 text-left"
    >
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      {/* Breadcrumb */}
      <div className="flex gap-2 items-center text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brand-navy/40 mb-8">
        <Link to="/" className="hover:text-brand-coral">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-coral">Shop</Link>
        <span>/</span>
        <Link to={`/shop?category=${product.category}`} className="hover:text-brand-coral capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-brand-navy/80 truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        
        {/* Left Side Column: Product Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[9/10] bg-bg-pink-light rounded-3xl overflow-hidden shadow-sm relative">
            {product.isTwentyPercentOff ? (
              <span className="absolute top-4 left-4 z-10 text-[9px] md:text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full shadow-md bg-brand-coral text-white animate-pulse flex items-center gap-1.5">
                <span className="inline-block animate-bounce">🔥</span> Hot Deal 20% OFF
              </span>
            ) : (
              <span className={`absolute top-4 left-4 z-10 text-[9px] font-extrabold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm ${product.tagColor || 'bg-brand-coral text-white'}`}>
                {product.tag}
              </span>
            )}
            <img 
              src={activeImage || product.img} 
              alt={product.name} 
              className="w-full h-full object-cover" 
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </div>
          {/* Real alternate gallery thumbnail views */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((imgUrl, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setActiveImage(imgUrl)}
                  className={`aspect-square bg-bg-cream/70 border rounded-2xl overflow-hidden transition-all cursor-pointer ${
                    activeImage === imgUrl ? 'border-brand-coral opacity-100 ring-2 ring-brand-coral/20' : 'border-brand-navy/5 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={imgUrl} 
                    alt={`${product.name} alternate view ${idx + 1}`} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side Column: Buying Controls details */}
        <div className="lg:col-span-6 flex flex-col justify-between">
          <div>
            <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest block mb-2">{product.category} COLLECTION</span>
            <h1 className="text-2xl sm:text-3xl font-black text-brand-navy leading-tight mb-4">{product.name}</h1>
            
            {/* Reviews summary */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-amber-400 text-sm">
                {[1, 2, 3, 4, 5].map(star => (
                  <FiStar key={star} className="fill-current text-amber-400" />
                ))}
              </div>
              <span className="text-xs text-brand-navy/60 font-black">{product.rating} Rating ({product.reviews} Verified Parent Reviews)</span>
            </div>

             {/* Pricing details */}
            <div className="flex items-center gap-4 mb-8">
              {product.isTwentyPercentOff ? (
                <>
                  <span className="text-lg text-brand-navy/40 font-extrabold line-through">Rs. {product.price}</span>
                  <span className="text-2xl font-black text-[#2f9e50] animate-pulse">Rs. {Math.round(product.price * 0.8)}</span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black py-1 px-2.5 rounded-full uppercase tracking-wider">
                    SAVE 20% EXTRA
                  </span>
                </>
              ) : (
                <>
                  <span className="text-lg text-brand-navy/40 font-extrabold line-through">Rs. {product.originalPrice}</span>
                  <span className="text-2xl font-black text-brand-coral">Rs. {product.price}</span>
                  <span className="bg-green-100 text-green-700 text-[10px] font-black py-1 px-2.5 rounded-full uppercase tracking-wider">
                    SAVE {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </>
              )}
              {(() => {
                const isSaleCategory = product.isTwentyPercentOff;
                return (
                  <span className={`text-[10px] font-black py-1 px-2.5 rounded-full uppercase tracking-wider ${
                    !isCurrentVariationInStock
                      ? 'bg-red-100 text-red-800'
                      : isSaleCategory
                      ? 'bg-amber-100 text-amber-800 animate-pulse'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {!isCurrentVariationInStock 
                      ? 'Out of Stock' 
                      : isSaleCategory
                      ? 'Few Items Left'
                      : 'In Stock'
                    }
                  </span>
                );
              })()}
            </div>

            {/* Fabric Details Highlight bar */}
            <div className="bg-bg-pink-light/40 border border-brand-navy/5 p-4 rounded-2xl flex gap-3.5 mb-8 items-center">
              <FiInfo className="text-brand-coral text-lg shrink-0" />
              <p className="text-xs text-brand-navy/80 font-semibold leading-relaxed">
                Made using <strong>premium soft combed fibers</strong>. Carefully selected dyes and soft fabrics are used to protect babies' gentle skin.
              </p>
            </div>

            {/* Color swatches */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-brand-navy/70 uppercase tracking-widest mb-3">Color: <span className="text-brand-coral">{selectedColor}</span></h4>
                <div className="flex gap-3">
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
                        className={`w-7 h-7 rounded-full border border-black/10 transition-all cursor-pointer ${colorClass} ${isSelected ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-brand-navy shadow-sm' : 'hover:scale-105'}`}
                        style={colorStyle}
                        title={colorName}
                        aria-label={`Select color ${colorName}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes swatches */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-brand-navy/70 uppercase tracking-widest">Select Size: <span className="text-brand-coral">{selectedSize}</span></h4>
                  <button onClick={() => setIsSizeModalOpen(true)} className="text-[10px] font-bold text-brand-navy/50 hover:text-brand-coral underline cursor-pointer">View Size Chart</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[50px] h-10 px-3.5 rounded-xl border text-xs font-bold tracking-wider transition-all cursor-pointer ${selectedSize === size ? 'bg-brand-navy border-brand-navy text-white shadow-sm' : 'bg-white border-brand-navy/10 text-brand-navy/70 hover:bg-bg-pink-light/40'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action panel */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {/* Qty controller */}
              <div className="flex items-center justify-between border border-brand-navy/15 rounded-full p-1 max-w-[130px] w-full bg-white shrink-0">
                <button 
                  onClick={() => setQty(prev => Math.max(1, prev - 1))} 
                  disabled={!isCurrentVariationInStock}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-brand-navy/60 hover:text-brand-coral cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >-</button>
                <span className="text-xs font-extrabold text-brand-navy">{isCurrentVariationInStock ? qty : 0}</span>
                <button 
                  onClick={() => setQty(prev => {
                    if (currentStockQuantity !== null && prev >= currentStockQuantity) {
                      return prev;
                    }
                    return prev + 1;
                  })} 
                  disabled={!isCurrentVariationInStock || (currentStockQuantity !== null && qty >= currentStockQuantity)}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-brand-navy/60 hover:text-brand-coral cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >+</button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={!isCurrentVariationInStock}
                className={`flex-1 text-white text-xs sm:text-sm font-bold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer ${
                  isCurrentVariationInStock 
                    ? 'bg-brand-coral hover:bg-brand-coral-hover shadow-brand-coral/15' 
                    : 'bg-gray-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isCurrentVariationInStock ? (
                  <>
                    <FiShoppingBag /> Add To Shopping Bag
                  </>
                ) : (
                  'Out of Stock'
                )}
              </button>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product.id, product.name)}
                className={`w-12 h-12 rounded-full border border-brand-navy/10 hover:border-brand-coral hover:text-brand-coral flex items-center justify-center transition-colors cursor-pointer shrink-0 ${isSaved ? 'bg-bg-pink-light border-brand-pink text-brand-coral' : 'bg-white'}`}
                aria-label="Wishlist toggle"
              >
                {isSaved ? <FaHeart className="text-red-500 text-base" /> : <FiHeart className="text-base" />}
              </button>
            </div>
          </div>

          {/* Delivery & Care info props */}
          <div className="grid grid-cols-3 gap-4 border-t border-brand-navy/5 pt-6 text-center text-[10px] sm:text-xs font-bold text-brand-navy/60">
            <div className="flex flex-col items-center gap-1.5">
              <FiTruck className="text-brand-coral text-base" />
              <span>Fast Dispatch</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <FiRefreshCw className="text-brand-coral text-base" />
              <span>Easy Exchange</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <FiInfo className="text-brand-coral text-base" />
              <span>Premium Fabric</span>
            </div>
          </div>
        </div>

      </div>

      {/* Tabs description block */}
      <section className="mb-16">
        <div className="flex border-b border-brand-navy/5 mb-8 overflow-x-auto hide-scrollbar">
          {[
            { id: 'description', label: 'Product Details' },
            { id: 'fabric', label: 'Fabric & Material Care' },
            { id: 'shipping', label: 'Shipping & Returns' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveDetailsTab(tab.id)}
              className={`pb-4 px-6 text-xs uppercase font-extrabold tracking-widest shrink-0 border-b-2 transition-all cursor-pointer ${activeDetailsTab === tab.id ? 'border-brand-coral text-brand-coral' : 'border-transparent text-brand-navy/50 hover:text-brand-coral'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs sm:text-sm font-semibold text-brand-navy/80 leading-relaxed max-w-3xl">
          {activeDetailsTab === 'description' && (
            <div className="space-y-4">
              <p>The {product.name} is meticulously handcrafted for playtime, relaxation, and everything in between. Featuring loose, breathable structuring, children can run around freely without restricted movement.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Pre-washed to protect against initial dye bleed.</li>
                <li>Sturdy double-lock stitch seams to hold up through play sessions.</li>
                <li>Nickel-free bottom snap fasteners (rompers) for diaper change efficiency.</li>
                <li>Wide elastic leg-openings that prevent skin pinching.</li>
              </ul>
            </div>
          )}
          {activeDetailsTab === 'fabric' && (
            <div className="space-y-4">
              <p>We source only high-quality yarns to guarantee that every single thread is completely allergy-safe and hypoallergenic.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Selected natural Linen or Combed Cotton fibers.</li>
                <li>Machine wash cold with similar light pastel colors.</li>
                <li>Use mild detergents for kids' health.</li>
                <li>Tumble dry low or line dry in the shade.</li>
              </ul>
            </div>
          )}
          {activeDetailsTab === 'shipping' && (
            <div className="space-y-4">
              <p>Enjoy prompt and reliable delivery services across India and international regions.</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Free shipping applies on all transactions above Rs. 2,499.</li>
                <li>Standard dispatch timeline: 1-2 working days.</li>
                <li>Delivery times: 3-5 working days within major metro areas.</li>
                <li>Easy 7 days returns or size exchange requests accepted.</li>
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Similar products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-brand-navy/5 pt-12">
          <h2 className="text-2xl font-black text-brand-navy mb-8">You Might Also Love</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map(rel => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

    </motion.div>
  );
}
