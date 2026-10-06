import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiUser, FiHeart, FiShoppingBag, FiX,
  FiHelpCircle, FiPhone, FiMail, FiChevronRight
} from 'react-icons/fi';
import { FaFacebook, FaFacebookF, FaGift, FaInstagram, FaStar, FaYoutube } from 'react-icons/fa6';
import { AiOutlineMenuUnfold } from 'react-icons/ai';
import { matchesUniversalSearch } from '../utils/searchHelper';

export default function Header({ setIsCartOpen, setIsSizeModalOpen }) {
  const { cartCount, wishlist, PRODUCTS } = useShop();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const announcements = [
    {
      text: "🎉 20% OFF ON SELECTED ITEMS! 🎉",
      badge: "20% OFF",
      badgeColor: "bg-white text-brand-coral font-black"
    },
    {
      text: "⚡ USE CODE: SALE20 ⚡",
      badge: "SALE IS LIVE",
      badgeColor: "bg-brand-navy text-white font-mono"
    },
    {
      text: "🚚 FREE SHIPPING ON ORDERS OVER RS. 2,499! ✨",
      badge: "FREE SHIPPING",
      badgeColor: "bg-white/20 text-white font-bold"
    }
  ];

  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAnnouncementIndex((prevIndex) => (prevIndex + 1) % announcements.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [announcements.length]);

  // Disable body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  const filteredSuggestions = PRODUCTS.filter(product =>
    matchesUniversalSearch(product, searchQuery)
  ).slice(0, 6);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand-coral via-[#FF5F7E] to-[#FF8E53] text-white text-xs md:text-sm font-semibold py-3 px-4 text-center tracking-wider z-40 shadow-md">
        {/* Shimmer overlay effect */}
        <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
        
        <div className="max-w-[1260px] mx-auto flex items-center justify-center min-h-[26px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentAnnouncementIndex}
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center justify-center gap-2 md:gap-3 flex-wrap"
            >
              {announcements[currentAnnouncementIndex].badge && (
                <span className={`text-[9px] md:text-[11px] uppercase tracking-widest px-2.5 py-0.5 rounded-full shadow-md ${announcements[currentAnnouncementIndex].badgeColor} animate-pulse`}>
                  {announcements[currentAnnouncementIndex].badge}
                </span>
              )}
              <span className="font-extrabold drop-shadow-sm select-none">
                {announcements[currentAnnouncementIndex].text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>



      {/* Main Header Component */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-brand-navy/8 py-3.5 px-6 z-30 transition-all shadow-sm">
        <div className="max-w-[1260px] mx-auto flex justify-between items-center">

          {/* Logo container */}
          <Link to="/" className="flex items-center">
            <img 
              src="/logo.webp" 
              alt="Sernaya Kids Logo" 
              className="h-[55px] md:h-[64px] w-auto object-contain" 
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </Link>

          {/* Main Desktop Navigation Links */}
          <nav className="hidden md:flex flex-1 justify-center max-w-2xl mx-8">
            <ul className="flex items-center gap-6 lg:gap-8 text-xs font-black uppercase tracking-wider text-brand-navy">
              <li>
                <Link to="/" className="hover:text-brand-coral py-2 transition-all">Home</Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-brand-coral py-2 transition-all">Shop</Link>
              </li>
              <li>
                <Link to="/shop?category=girls" className="hover:text-brand-coral py-2 transition-all">Girls</Link>
              </li>
              <li>
                <Link to="/shop?category=boys" className="hover:text-brand-coral py-2 transition-all">Boys</Link>
              </li>
              <li>
                <Link to="/shop?category=newborn" className="hover:text-brand-coral py-2 transition-all">Newborn</Link>
              </li>
              <li>
                <Link to="/shop?category=summer" className="hover:text-brand-coral py-2 transition-all">Summer</Link>
              </li>
              {/* <li>
                <Link to="/about" className="hover:text-brand-coral py-2 transition-all">Brand Story</Link>
              </li> */}
              <li>
                <Link to="/orders" className="hover:text-brand-coral py-2 transition-all">Orders</Link>
              </li>
              {/* <li>
                <Link to="/blog" className="hover:text-brand-coral py-2 transition-all">Journal</Link>
              </li> */}
            </ul>
          </nav>

          {/* Actions button list */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop/Laptop Search Bar with Live Suggestions */}
            <div className="hidden lg:block relative max-w-[200px] xl:max-w-[260px] w-full mr-1">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search name, color, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-bg-cream/60 hover:bg-bg-cream/90 focus:bg-white border border-brand-navy/10 focus:border-brand-coral rounded-full py-2 pl-4 pr-10 text-xs font-semibold text-brand-navy placeholder:text-brand-navy/40 transition-all outline-none"
                />
                <button
                  type="submit"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-navy/40 hover:text-brand-coral transition-colors cursor-pointer"
                  aria-label="Submit search"
                >
                  <FiSearch size={14} />
                </button>
              </form>

              {/* Desktop Search Suggestions Dropdown */}
              {searchQuery && (
                <div className="absolute top-full right-0 mt-2 w-[300px] bg-white border border-brand-navy/8 rounded-2xl shadow-xl overflow-hidden z-50 p-2 flex flex-col gap-1.5">
                  {filteredSuggestions.length === 0 ? (
                    <p className="text-[11px] text-brand-navy/60 p-3 font-semibold">No products found</p>
                  ) : (
                    filteredSuggestions.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleSuggestionClick(product)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-bg-cream/60 transition-colors cursor-pointer text-left"
                      >
                        <img 
                          src={product.img} 
                          alt={product.name} 
                          className="w-10 h-10 rounded-lg object-cover" 
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-black text-brand-navy truncate">{product.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[9px] text-brand-navy/40 font-bold uppercase">{product.category}</span>
                            {product.colors && product.colors.length > 0 && (
                              <span className="text-[8px] text-brand-coral font-bold bg-brand-coral/10 px-1.5 py-0.2 rounded">
                                {typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0]?.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-black text-brand-coral shrink-0">Rs. {product.price}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Mobile/Tablet Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="lg:hidden w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-bg-pink-light hover:text-brand-coral transition-colors cursor-pointer"
              aria-label="Search Catalog"
            >
              <FiSearch />
            </button>
            {/* <a
              href="mailto:Sernayakids@gmail.com"
              className="w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-bg-pink-light hover:text-brand-coral transition-colors hidden sm:flex"
              title="Help Center Support"
            >
              <FiHelpCircle size={23} />
            </a> */}
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-bg-pink-light hover:text-brand-coral transition-colors"
              aria-label="User Account"
            >
              <FiUser size={23} />
            </Link>
            <Link
              to="/wishlist"
              className="w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-bg-pink-light hover:text-brand-coral transition-colors relative"
              aria-label="My Wishlist"
            >
              <FiHeart size={23} />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-brand-coral rounded-full"></span>
              )}
            </Link>
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-bg-pink-light hover:text-brand-coral transition-colors relative cursor-pointer"
              aria-label="Toggle Cart Drawer"
            >
              <FiShoppingBag size={23} />
              <span className="absolute -top-1 -right-1 bg-brand-coral text-white text-[9px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center text-base hover:bg-bg-pink-light hover:text-brand-coral transition-colors md:hidden cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <AiOutlineMenuUnfold size={25} />
            </button>
          </div>
        </div>
      </header>



      {/* Full-screen Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <div className="w-full max-w-2xl text-left relative">
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="absolute -top-16 right-0 w-10 h-10 border border-brand-navy/15 rounded-full flex items-center justify-center text-lg hover:text-brand-coral hover:border-brand-coral transition-colors cursor-pointer"
                aria-label="Close search panel"
              >
                <FiX />
              </button>
              <h3 className="font-heading text-xs font-bold text-brand-coral mb-4 uppercase tracking-widest">Search Sernaya Kids Catalog</h3>
              <form onSubmit={handleSearchSubmit} className="flex items-center border-b-2 border-brand-navy py-3 gap-3">
                <FiSearch className="text-xl text-brand-navy/40" />
                <input
                  type="text"
                  placeholder="Search by name, color, category (e.g. pink frock, summer, boys)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none font-heading text-lg sm:text-2xl text-brand-navy font-bold placeholder:text-brand-navy/20"
                  autoFocus
                />
              </form>

              {searchQuery && (
                <div className="mt-8 max-h-[300px] overflow-y-auto flex flex-col gap-3">
                  {filteredSuggestions.length === 0 ? (
                    <p className="text-xs text-brand-navy/60">No products match your search query.</p>
                  ) : (
                    filteredSuggestions.map(product => (
                      <div
                        key={product.id}
                        onClick={() => handleSuggestionClick(product)}
                        className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-bg-cream/60 transition-colors cursor-pointer border border-transparent hover:border-brand-navy/5"
                      >
                        <img 
                          src={product.img} 
                          alt={product.name} 
                          className="w-12 h-12 rounded-xl object-cover" 
                          loading="lazy"
                          decoding="async"
                        />
                        <div className="flex-1">
                          <h4 className="text-xs sm:text-sm font-extrabold text-brand-navy leading-none">{product.name}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-brand-navy/50 font-bold inline-block uppercase">Category: {product.category}</span>
                            {product.colors && product.colors.length > 0 && (
                              <span className="text-[9px] text-brand-coral font-bold bg-brand-coral/10 px-2 py-0.5 rounded">
                                Color: {typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0]?.name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-brand-coral">Rs. {product.price}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
              <p className="text-[10px] text-brand-navy/40 font-bold uppercase mt-4">Type to filter live results. Press Enter to view in Catalog.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            key="mobile-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-brand-navy/40 z-50 lg:hidden"
          />
        )}
        {isMobileMenuOpen && (
          <motion.aside
            key="mobile-menu-drawer"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 w-full max-w-[280px] h-full bg-[#FBF9F4] shadow-2xl flex flex-col p-8 z-50 lg:hidden overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-4 border-b border-brand-navy/8 mb-8">
              <span className="font-heading text-sm font-extrabold text-brand-navy tracking-wider uppercase">Menu</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-lg hover:text-brand-coral cursor-pointer" aria-label="Close menu drawer">
                <FiX />
              </button>
            </div>

            <ul className="flex flex-col gap-6 text-left text-xs font-extrabold uppercase tracking-widest text-brand-navy">
              <li>
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-coral transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-coral transition-colors">Shop Collections</Link>
              </li>
              <li>
                <Link to="/shop?category=girls" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-coral transition-colors">Girls Clothing</Link>
              </li>
              <li>
                <Link to="/shop?category=boys" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-coral transition-colors">Boys Clothing</Link>
              </li>
              <li>
                <Link to="/shop?category=newborn" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-coral transition-colors">Newborn Essentials</Link>
              </li>
              <li>
                <Link to="/shop?category=summer" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-coral transition-colors">Summer Specials</Link>
              </li>
              <li>
                <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-brand-coral transition-colors">My Orders</Link>
              </li>
            </ul>

            <div className="mt-8 flex flex-col gap-4 text-left">
              {/* Combo Offer Card */}
              {/* <Link
                to="/shop?promo=2for999"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-4 bg-linear-to-br from-brand-pink/20 to-brand-pink/5 rounded-2xl border border-brand-pink/25 hover:border-brand-pink transition-all shadow-sm relative overflow-hidden group"
              >
                <div className="absolute right-0 top-0 w-16 h-16 bg-brand-coral/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <span className="inline-block text-[9px] font-black tracking-widest text-brand-coral uppercase bg-white/80 px-2 py-0.5 rounded-full mb-2">Offer</span>
                <h4 className="text-xs font-black text-brand-navy">Combo Offer</h4>
                <p className="text-[10px] font-extrabold text-brand-navy/80 mt-1 leading-tight">Get Any Two Outfits at just ₹999</p>
                <p className="text-[9px] text-brand-navy/60 mt-1.5 leading-normal">Get the best quality clothes for your kids at a very affordable price.</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-brand-coral mt-3 uppercase tracking-wider">
                  <span>Shop Combo Offer</span>
                  <FiChevronRight className="text-xs transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link> */}

              {/* Budget Finds Card */}
              <Link
                to="/shop?maxPrice=599"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block p-4 bg-linear-to-br from-brand-blue/20 to-brand-blue/5 rounded-2xl border border-brand-blue/20 hover:border-brand-blue/40 transition-all shadow-sm relative overflow-hidden group"
              >
                <div className="absolute right-0 top-0 w-16 h-16 bg-brand-blue/10 rounded-full blur-xl group-hover:scale-125 transition-transform" />
                <span className="inline-block text-[9px] font-black tracking-widest text-brand-navy/70 uppercase bg-white/80 px-2 py-0.5 rounded-full mb-2">Budget</span>
                <h4 className="text-xs font-black text-brand-navy">Budget Finds</h4>
                <p className="text-[10px] font-extrabold text-brand-navy/80 mt-1 leading-tight">Get Clothes Under ₹599</p>
                <p className="text-[9px] text-brand-navy/60 mt-1.5 leading-normal">Clothes that are light on your pocket and comfortable for your little ones.</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-brand-navy mt-3 uppercase tracking-wider">
                  <span>Browse Under ₹599</span>
                  <FiChevronRight className="text-xs transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </div>

            <div className="pt-6 border-t border-brand-navy/8 mt-8 text-left">
              <span className="text-[10px] font-extrabold tracking-widest text-brand-coral uppercase block mb-3">Sernaya Family</span>
              <div className="flex gap-4 text-base">
                <a
                  href="https://www.instagram.com/sernayakids"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-pink-500 text-pink-500 border hover:text-white flex items-center justify-center text-xs transition-colors"
                >
                  <FaInstagram />
                </a>
                <a
                  href="https://www.facebook.com/share/1G9AdttWVK/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-600 text-blue-600 border hover:text-white flex items-center justify-center text-xs transition-colors"
                >
                  <FaFacebookF />
                </a>
                <a
                  href="https://www.youtube.com/@sernayakids"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-red-600 border hover:text-white flex items-center justify-center text-xs transition-colors"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
