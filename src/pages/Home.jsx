import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import DesktopCarousel from '../components/DesktopCarousel';
import {
  FiTruck, FiPercent, FiSmile, FiHeadphones, FiArrowLeft,
  FiArrowRight, FiChevronRight, FiStar, FiInstagram, FiPlay, FiX, FiHeart, FiEye,
  FiCopy, FiCheck
} from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa6';
import useSEO from '../hooks/useSEO';

const INSTA_REELS = [
  {
    id: 'reel-1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-toddler-girl-walking-in-a-park-34289-large.mp4',
    thumbnail: 'assets/category-girls.webp',
    likes: '1.2k',
    views: '15k',
    productLink: '/shop?category=girls',
    caption: 'Soft linen dresses for sunny playdays 🌸✨'
  },
  {
    id: 'reel-2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-little-girl-playing-with-autumn-leaves-in-a-park-34286-large.mp4',
    thumbnail: 'assets/category-summer.webp',
    likes: '942',
    views: '10.8k',
    productLink: '/shop?category=summer',
    caption: 'Cotton rompers made for endless giggles 🍃'
  },
  {
    id: 'reel-3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-boy-playing-with-wooden-blocks-34301-large.mp4',
    thumbnail: 'assets/category-boys.webp',
    likes: '1.5k',
    views: '18.2k',
    productLink: '/shop?category=boys',
    caption: 'Play-proof dungarees that hold up to active boys 🧱🧸'
  },
  {
    id: 'reel-4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-baby-girl-smiling-at-camera-34293-large.mp4',
    thumbnail: 'assets/hero-kids.jpg',
    likes: '2.1k',
    views: '24k',
    productLink: '/shop?category=newborn',
    caption: 'Zero shrinkage, 100% hypoallergenic swaddles'
  }
];

export default function Home() {
  const { PRODUCTS, TESTIMONIALS, loadingCatalog, loadingTestimonials } = useShop();
  const [activeTab, setActiveTab] = useState('newborn');
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [activeReel, setActiveReel] = useState(null);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const navigate = useNavigate();

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  useSEO({
    title: "Premium Children's Fashion & Contemporary Kidswear",
    description: "Shop comfortable, high-quality kids coordinates, night suits, designer dresses, and newborn accessories at Sernaya Kids. Free shipping across India."
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex-1"
    >
      {/* 1. Responsive Hero Banner Carousel */}
      <DesktopCarousel />


      {/* 1.5 Super Saving Deal: Flat 20% OFF */}
      {PRODUCTS && PRODUCTS.length > 0 && (
        <section className="bg-gradient-to-b from-bg-coral-light to-[#FBF9F4] px-6 py-12 md:py-16 border-b border-brand-navy/6">
          <div className="max-w-[1260px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div className="text-left">
                <span className="font-heading text-xs font-semibold tracking-widest text-brand-coral uppercase mb-2 block flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-coral animate-ping" />
                  🔥 HOT DEAL OR SUPER SAVING DEAL
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-2">
                  Flat 20% OFF Sale Preview
                </h2>
                <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold max-w-lg">
                  Use coupon code <span className="text-brand-coral font-bold">SALE20</span> at checkout to grab these premium kids outfits at an extra 20% discount!
                </p>
              </div>
              <div className="flex gap-2">
                <Link 
                  to="/shop?category=20-off" 
                  className="bg-brand-navy hover:bg-black text-white text-xs font-bold py-3 px-6 rounded-full transition-colors flex items-center gap-1.5 shadow-md shadow-brand-navy/10"
                >
                  View All Products <FiArrowRight />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(() => {
                const saleProducts = PRODUCTS.filter(p => p.isTwentyPercentOff && p.inStock);
                const displayProducts = saleProducts.length > 0 ? saleProducts : PRODUCTS.filter(p => p.inStock);
                return displayProducts.slice(0, 4).map(product => {
                  const discountedPrice = Math.round(product.price * 0.8);
                  const savings = product.price - discountedPrice;
                return (
                  <motion.div
                    key={product.id}
                    whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(228, 106, 75, 0.15)" }}
                    className="bg-white border border-brand-coral/15 rounded-[24px] overflow-hidden flex flex-col group text-left relative shadow-xs"
                  >
                    {/* Discount badge */}
                    <span className="absolute top-4 left-4 z-10 text-[9px] font-black uppercase tracking-widest py-1 px-2.5 rounded-full shadow-sm bg-brand-coral text-white animate-pulse">
                      20% OFF
                    </span>

                    {/* Image Container */}
                    <div className="aspect-10/11 bg-bg-pink-light relative overflow-hidden shrink-0">
                      <Link to={`/product/${product.id}`} className="block w-full h-full">
                        <img
                          src={product.img}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-103"
                          loading="lazy"
                          decoding="async"
                        />
                      </Link>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Categories/Rating */}
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[9px] text-brand-navy/40 font-bold uppercase tracking-wider">
                            {product.category}
                          </span>
                          <span className="text-[9px] text-brand-coral font-black bg-brand-coral/5 px-2 py-0.5 rounded-md">
                            Save Rs. {savings}
                          </span>
                        </div>

                        <Link to={`/product/${product.id}`} className="block">
                          <h3 className="font-heading text-xs sm:text-sm font-extrabold text-brand-navy mb-2 truncate hover:text-brand-coral transition-colors" title={product.name}>
                            {product.name}
                          </h3>
                        </Link>

                        {/* Coupon Badge */}
                        <div className="inline-flex items-center gap-1 bg-[#e6f7ea] text-[#2f9e50] text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mb-2">
                          Code: SALE20
                        </div>
                      </div>

                      {/* Pricing block */}
                      <div className="flex justify-between items-center pt-2.5 border-t border-brand-navy/5">
                        <span className="text-[10px] sm:text-[11px] text-brand-navy/40 font-extrabold line-through">Rs. {product.price}</span>
                        <span className="text-xs sm:text-sm font-black text-[#2f9e50]">Rs. {discountedPrice}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            })()}
            </div>
          </div>
        </section>
      )}

      {/* 2. Value Proposition Info Bar */}
      {/* <section className="px-6 py-6 bg-white border-b border-brand-navy/6">
        <div className="max-w-[1260px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-bg-cream/40 transition-colors">
            <div className="w-10 h-10 bg-bg-coral-light rounded-full flex items-center justify-center text-brand-coral text-sm shrink-0">
              <FiTruck className="text-lg" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-extrabold text-brand-navy leading-none mb-1">Free Delivery</h3>
              <p className="text-[10px] md:text-xs text-brand-navy/60">On orders above Rs. 2,499</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-bg-cream/40 transition-colors">
            <div className="w-10 h-10 bg-bg-pink-light rounded-full flex items-center justify-center text-brand-pink text-sm shrink-0">
              <FiPercent className="text-lg" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-extrabold text-brand-navy leading-none mb-1">5% OFF Code</h3>
              <p className="text-[10px] md:text-xs text-brand-navy/60">Use Code: **SERNAYA07**</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-bg-cream/40 transition-colors">
            <div className="w-10 h-10 bg-bg-blue-light rounded-full flex items-center justify-center text-brand-blue text-sm shrink-0">
              <FiSmile className="text-lg" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-extrabold text-brand-navy leading-none mb-1">Top Rated 4.8/5</h3>
              <p className="text-[10px] md:text-xs text-brand-navy/60">Loved by verified parents</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-bg-cream/40 transition-colors">
            <div className="w-10 h-10 bg-bg-lavender-light rounded-full flex items-center justify-center text-brand-lavender text-sm shrink-0">
              <FiHeadphones className="text-lg" />
            </div>
            <div className="text-left">
              <h3 className="text-xs md:text-sm font-extrabold text-brand-navy leading-none mb-1">Dedicated Care</h3>
              <p className="text-[10px] md:text-xs text-brand-navy/60">+91-96435 41744 Support</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* 3. Shop By Categories */}
      <section className="max-w-[1260px] mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10 max-w-xl mx-auto">
          <span className="font-heading text-xs font-semibold tracking-widest text-brand-coral uppercase mb-2 block animate-pulse">
            Handpicked clothing
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-3">Shop By Category</h2>
          <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
            Browse soft, lightweight, and durable ensembles categorized for easy selection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/shop?category=girls" className="group relative h-[300px] sm:h-[350px] md:h-[400px] rounded-3xl overflow-hidden shadow-md flex items-end p-6 md:p-8">
            <img src="/category-girls.webp" alt="Girls Clothing Category" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-linear-to-t from-brand-navy/70 via-brand-navy/15 to-transparent z-10"></div>
            <div className="relative z-20 text-left text-white w-full">
              {/* <span className="text-[10px] uppercase font-bold tracking-widest text-brand-pink block mb-1">Pretty Pastels</span> */}
              <h3 className="text-xl md:text-2xl font-black mb-3.5">GIRLS</h3>
              <span className="text-xs font-bold inline-flex items-center gap-1.5 border-b border-white/60 pb-0.5 group-hover:border-white transition-all">
                Shop Girls <FiArrowRight className="text-[10px]" />
              </span>
            </div>
          </Link>

          <Link to="/shop?category=boys" className="group relative h-[300px] sm:h-[350px] md:h-[400px] rounded-3xl overflow-hidden shadow-md flex items-end p-6 md:p-8">
            <img src="/category-boys.webp" alt="Boys Clothing Category" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-linear-to-t from-brand-navy/70 via-brand-navy/15 to-transparent z-10"></div>
            <div className="relative z-20 text-left text-white w-full">
              {/* <span className="text-[10px] uppercase font-bold tracking-widest text-brand-blue block mb-1">Comfy & Durable</span> */}
              <h3 className="text-xl md:text-2xl font-black mb-3.5">BOYS</h3>
              <span className="text-xs font-bold inline-flex items-center gap-1.5 border-b border-white/60 pb-0.5 group-hover:border-white transition-all">
                Shop Boys <FiArrowRight className="text-[10px]" />
              </span>
            </div>
          </Link>

          <Link to="/shop?category=unisex" className="group relative h-[300px] sm:h-[350px] md:h-[400px] rounded-3xl overflow-hidden shadow-md flex items-end p-6 md:p-8">
            <img src="/category-summer.png" alt="Unisex Category" className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async" />
            <div className="absolute inset-0 bg-linear-to-t from-brand-navy/70 via-brand-navy/15 to-transparent z-10"></div>
            <div className="relative z-20 text-left text-white w-full">
              {/* <span className="text-[10px] uppercase font-bold tracking-widest text-brand-lavender block mb-1">Organic Classics</span> */}
              <h3 className="text-xl md:text-2xl font-black mb-3.5">UNISEX</h3>
              <span className="text-xs font-bold inline-flex items-center gap-1.5 border-b border-white/60 pb-0.5 group-hover:border-white transition-all">
                Shop Unisex <FiArrowRight className="text-[10px]" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 3.5. Promotional Split Banners */}
      <section className="max-w-[1260px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Combo Offer Banner */}
          <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative overflow-hidden rounded-[32px] bg-linear-to-br from-bg-coral-light to-white border border-brand-coral/15 p-8 sm:p-10 text-left flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-brand-coral/10 blur-2xl pointer-events-none group-hover:bg-brand-coral/20 transition-all duration-500" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-coral bg-white border border-brand-coral/15 px-3.5 py-1.5 rounded-full inline-block mb-4 shadow-sm">
                Combo Offer
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-brand-navy leading-tight tracking-tight max-w-sm">
                Buy Two Outfits at just ₹999
              </h3>
              <p className="text-xs text-brand-navy/60 font-bold mt-2.5 max-w-xs">
                Get the best quality clothes for your kids at a very affordable price.
              </p>
              <p className='text-xs font-bold mt-1'>*Offer applies on selected outfits.</p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => navigate('/shop?promo=2for999')}
                className="bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-black py-3 px-6 rounded-full flex items-center gap-2 transition-colors cursor-pointer shadow-md shadow-brand-coral/15"
              >
                Explore Combos <FiArrowRight />
              </button>
            </div>
          </motion.div>

          {/* Budget Finds Banner */}
          <motion.div
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative overflow-hidden rounded-[32px] bg-linear-to-br from-bg-blue-light to-white border border-brand-blue/20 p-8 sm:p-10 text-left flex flex-col justify-between min-h-[220px] shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-brand-blue/20 blur-2xl pointer-events-none group-hover:bg-brand-blue/30 transition-all duration-500" />
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-navy bg-white border border-brand-blue/20 px-3.5 py-1.5 rounded-full inline-block mb-4 shadow-sm">
                Budget Finds
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-brand-navy leading-tight tracking-tight max-w-sm">
                Get Clothes Under ₹599
              </h3>
              <p className="text-xs text-brand-navy/60 font-bold mt-2.5 max-w-xs">
                Clothes that are light on your wallet and gentle on your kids skin.
              </p>
            </div>
            <div className="mt-8">
              <button
                onClick={() => navigate('/shop?maxPrice=599&sort=price-low')}
                className="bg-brand-navy hover:bg-black text-white text-xs font-black py-3 px-6 rounded-full flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                Browse Under ₹599 <FiArrowRight />
              </button>
            </div>
          </motion.div>

        </div>
      </section>

      {/* 4. Tabbed Featured Products Grid */}
      <section className="bg-white border-y border-brand-navy/6 px-6 py-16">
        <div className="max-w-[1260px] mx-auto">
          <div className="text-center mb-10 max-w-xl mx-auto">
            <span className="font-heading text-xs font-semibold tracking-widest text-brand-coral uppercase mb-2 block">
              Trending styles
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-3">Featured Products</h2>
            <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
              Explore hand-selected soft knit rompers, ruffled frocks, and structured sets.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-4 justify-start md:justify-center hide-scrollbar mb-10 scroll-smooth snap-x">
            {[
              { id: 'newborn', label: 'Newborn Essentials' },
              { id: 'girls', label: 'Girls Outfits' },
              { id: 'boys', label: 'Boys Outfits' },
              { id: 'unisex', label: 'Unisex Wear' },
              { id: 'summer', label: 'Summer Specials' },
              { id: 'new', label: 'New Arrivals' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full text-xs font-extrabold uppercase tracking-widest shrink-0 border snap-center transition-all cursor-pointer ${activeTab === tab.id ? 'bg-brand-navy border-brand-navy text-white shadow-md' : 'bg-bg-cream/40 border-brand-navy/8 text-brand-navy/70 hover:bg-bg-pink-light/40'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {loadingCatalog ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-brand-navy/5 rounded-3xl p-4 aspect-9/13 flex flex-col justify-between">
                  <div className="bg-gray-200 aspect-vide rounded-2xl mb-4 w-full h-[180px]" />
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              PRODUCTS.filter(p => p.category === activeTab || (p.categories && p.categories.includes(activeTab))).slice(0, 4).map(product => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-navy hover:bg-black text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-lg transition-all">
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Brand Story Section */}
      <section className="max-w-[1260px] mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
        <div className="lg:col-span-6 relative rounded-3xl overflow-hidden shadow-xl aspect-4/3 md:aspect-16/10">
          <img src="assets/hero-kids.jpg" alt="Happy Kids in Sernaya Clothes" className="w-full h-full object-cover" loading="lazy" decoding="async" />
          <div className="absolute inset-0 bg-brand-navy/10" />
        </div>
        <div className="lg:col-span-6">
          <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest mb-3 block">We Care</span>
          <h2 className="text-3xl font-black text-brand-navy mb-6 leading-tight">Every Stitch Tells A Story Of Pure Care</h2>
          <p className="text-sm text-brand-navy/75 leading-relaxed mb-6 font-semibold">
            At Sernaya Kids, we believe childhood is a sacred space for exploration. That is why all our garments are crafted with love, we provide good quality clothes at affordable prices.
          </p>
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="border-l-4 border-brand-pink pl-4">
              <h4 className="text-base font-black text-brand-navy mb-1">100% Made with Love</h4>
              <p className="text-xs text-brand-navy/60 font-semibold">All our garments are crafted with love.</p>
            </div>
            <div className="border-l-4 border-brand-blue pl-4">
              <h4 className="text-base font-black text-brand-navy mb-1">Good Quality at Affordable Prices</h4>
              <p className="text-xs text-brand-navy/60 font-semibold">Wash-durable styles that hold their shape.</p>
            </div>
          </div>
          <Link to="/about" className="inline-flex items-center gap-2 bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md transition-all">
            Discover Our Values <FiChevronRight />
          </Link>
        </div>
      </section>

      {/* 6. Bestsellers split banner */}
      <section className="bg-bg-pink-light border-y border-brand-navy/5 py-12 px-6">
        <div className="max-w-[1260px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center text-left">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-navy mb-4">Discover Our Bestsellers</h2>
            <p className="text-xs sm:text-sm text-brand-navy/75 mb-6 font-semibold">
              Enjoy a special **5% discount** on your first purchase! Explore our premium cotton and linen outfits designed for your kids' everyday adventures.
            </p>
            <Link to="/shop" className="bg-brand-navy text-white hover:bg-black font-extrabold text-xs py-3.5 px-8 rounded-full inline-block transition-colors shadow-lg">
              Shop Bestsellers Now
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {loadingCatalog ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="animate-pulse bg-white p-4 rounded-2xl border border-brand-navy/5">
                  <div className="bg-gray-200 aspect-square rounded-xl mb-3 w-full" />
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
              ))
            ) : (
              PRODUCTS.slice(0, 2).map((product) => (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id} 
                  className="bg-white p-4 rounded-2xl shadow-sm border border-brand-navy/5 hover:border-brand-coral transition-all text-left block hover:scale-102"
                >
                  <img src={product.img} alt={product.name} className="w-full aspect-square object-cover rounded-xl mb-3" loading="lazy" decoding="async" />
                  <h4 className="text-xs font-bold text-brand-navy truncate">{product.name}</h4>
                  <span className="text-xs font-black text-brand-coral block mt-1">Rs. {product.price}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* 7. Testimonials Slider */}
      {(!loadingTestimonials && TESTIMONIALS.length === 0) ? null : (
        <section className="max-w-[1260px] mx-auto px-6 py-16 text-center overflow-hidden">
          <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest mb-3 block">Happy Parents</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-10">What The Family Says</h2>

          {/* Testimonials Group Grid */}
          <div className="max-w-5xl mx-auto relative mb-8 min-h-[360px] sm:min-h-[280px] flex items-center justify-center">
            {loadingTestimonials ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm relative text-left flex flex-col justify-between h-[250px]"
                  >
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>
                    <div className="flex items-center gap-3 pt-4 border-t border-brand-navy/5">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-2 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={testimonialIndex}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
                >
                  {[
                    TESTIMONIALS[(testimonialIndex * 3) % TESTIMONIALS.length],
                    TESTIMONIALS[(testimonialIndex * 3 + 1) % TESTIMONIALS.length],
                    TESTIMONIALS[(testimonialIndex * 3 + 2) % TESTIMONIALS.length]
                  ].map((item, idx) => item ? (
                    <div
                      key={idx}
                      className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm relative text-left flex flex-col justify-between"
                    >
                      <FaQuoteLeft className="text-3xl text-brand-pink/20 absolute top-4 left-4" />

                      <div>
                        {/* Star Rating */}
                        <div className="flex text-amber-400 text-xs mb-3 gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FiStar key={star} className="fill-current text-amber-400" />
                          ))}
                        </div>

                        <p className="text-xs sm:text-sm text-brand-navy/80 italic leading-relaxed mb-6 font-semibold relative z-10">
                          {item.text}
                        </p>
                      </div>

                      <div className="flex items-center gap-3.5 pt-4 border-t border-brand-navy/5">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="w-10 h-10 rounded-full object-cover border border-brand-coral"
                          loading="lazy"
                          decoding="async"
                        />
                        <div>
                          <h4 className="text-xs font-black text-brand-navy">{item.name}</h4>
                          <span className="text-[9px] text-brand-navy/55 uppercase font-bold">{item.role}</span>
                        </div>
                      </div>
                    </div>
                  ) : null)}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {!loadingTestimonials && TESTIMONIALS.length > 3 && (
            <div className="flex justify-center items-center gap-4">
              <button
                onClick={() => setTestimonialIndex(prev => (prev - 1 + Math.ceil(TESTIMONIALS.length / 3)) % Math.ceil(TESTIMONIALS.length / 3))}
                className="w-10 h-10 rounded-full border border-brand-navy/10 hover:border-brand-coral hover:text-brand-coral flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Previous Group"
              >
                <FiArrowLeft />
              </button>

              {/* Bullet Indicators */}
              <div className="flex gap-2">
                {Array.from({ length: Math.ceil(TESTIMONIALS.length / 3) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTestimonialIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all cursor-pointer ${testimonialIndex === idx ? 'bg-brand-coral w-5' : 'bg-brand-navy/20'}`}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setTestimonialIndex(prev => (prev + 1) % Math.ceil(TESTIMONIALS.length / 3))}
                className="w-10 h-10 rounded-full border border-brand-navy/10 hover:border-brand-coral hover:text-brand-coral flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Next Group"
              >
                <FiArrowRight />
              </button>
            </div>
          )}
        </section>
      )}
      {/* 6.5. Instagram Reels Section */}
      {/* <section className="bg-white border-y border-brand-navy/6 py-16 px-6">
        <div className="max-w-[1260px] mx-auto">
          <div className="text-center mb-12 max-w-xl mx-auto">
            <span className="text-xs font-black text-brand-coral uppercase tracking-widest bg-bg-coral-light border border-brand-coral/10 px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 mb-3 shadow-sm">
              <FiInstagram className="text-sm" /> Style In Motion
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy mb-3">Sernaya Kids on Instagram</h2>
            <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
              Watch our premium collection in play. Tag us <a href="https://www.instagram.com/sernayakids" target="_blank" rel="noreferrer" className="text-brand-coral hover:underline font-bold">@sernayakids</a> to get featured!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {INSTA_REELS.map((reel) => (
              <div
                key={reel.id}
                onClick={() => setActiveReel(reel)}
                className="group relative aspect-[9/16] rounded-3xl overflow-hidden shadow-md cursor-pointer border border-brand-navy/5 bg-bg-cream/40"
              >
                <img
                  src={reel.thumbnail}
                  alt="Instagram reel thumbnail"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />

                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 flex items-center justify-center transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-white/90 group-hover:bg-brand-coral group-hover:text-white text-brand-navy flex items-center justify-center shadow-lg transition-all transform group-hover:scale-110">
                    <FiPlay className="fill-current text-sm translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-left">
                  <p className="text-[11px] font-semibold line-clamp-2 leading-tight mb-2 group-hover:text-brand-coral-light transition-colors">{reel.caption}</p>
                  <div className="flex gap-4 items-center text-[10px] font-bold opacity-95">
                    <span className="flex items-center gap-1"><FiHeart className="fill-current text-red-500" /> {reel.likes}</span>
                    <span className="flex items-center gap-1"><FiEye /> {reel.views}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Instagram Reels Video Popup Modal */}
      <AnimatePresence>
        {activeReel && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Modal Backdrop Click */}
            <div className="absolute inset-0" onClick={() => setActiveReel(null)} />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-[#1A1A1A] text-white w-full max-w-[340px] sm:max-w-[380px] aspect-[9/16] rounded-[32px] overflow-hidden shadow-2xl z-10 border border-white/10"
            >
              {/* Close Button */}
              <button
                onClick={() => setActiveReel(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black text-white flex items-center justify-center cursor-pointer transition-colors"
                aria-label="Close video player"
              >
                <FiX />
              </button>

              {/* Looping video element */}
              <video
                src={activeReel.videoUrl}
                autoPlay
                loop
                playsInline
                className="w-full h-full object-cover"
                controls
              />

              {/* Video Overlay details */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/95 via-black/30 to-transparent text-left pointer-events-none">
                <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                  <img src="/logo.webp" alt="Sernaya Logo" className="w-6 h-6 rounded-full object-contain bg-white/90 p-0.5 border border-white/20" />
                  <span className="text-xs font-black tracking-wide">sernayakids</span>
                  <span className="text-[10px] bg-brand-coral py-0.5 px-2 rounded-full font-black">Shop</span>
                </div>
                <p className="text-xs font-medium leading-snug mb-3.5 opacity-90">{activeReel.caption}</p>
                <Link
                  to={activeReel.productLink}
                  onClick={() => setActiveReel(null)}
                  className="inline-flex items-center gap-1.5 bg-brand-coral hover:bg-brand-coral-hover text-white text-[10px] font-black py-2.5 px-5 rounded-full shadow-lg pointer-events-auto transition-colors"
                >
                  Shop Featured Outfit <FiArrowRight />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
