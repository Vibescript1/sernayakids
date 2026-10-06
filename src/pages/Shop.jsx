import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { FiFilter, FiX, FiSliders, FiGrid } from 'react-icons/fi';
import useSEO from '../hooks/useSEO';
import { matchesUniversalSearch } from '../utils/searchHelper';

export default function Shop() {
  const { PRODUCTS, loadingCatalog } = useShop();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page: routePage } = useParams();

  useEffect(() => {
    if (PRODUCTS && PRODUCTS.length > 0) {
      const saleProducts = PRODUCTS.filter(p => 
        p.categories?.some(cat => ['girls', 'boys', 'summer'].includes(cat.toLowerCase()))
      );
      console.log("--- 20% SALE CATEGORIES PRODUCTS ---", saleProducts);
    }
  }, [PRODUCTS]);

  // Filter states read directly from searchParams / route params (URL is the single source of truth)
  const categoryFilter = searchParams.get('category') || 'all';
  const sizeFilter = searchParams.get('size') || 'all';
  const priceMax = Number(searchParams.get('maxPrice')) || 3500;
  const sortBy = searchParams.get('sort') || 'latest';
  const searchQuery = searchParams.get('search') || '';
  const pageParam = searchParams.get('page') || routePage;
  const currentPage = Math.max(1, parseInt(pageParam, 10) || 1);
  const productsPerPage = 9;
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useSEO({
    title: categoryFilter !== 'all' ? `${categoryFilter.charAt(0).toUpperCase() + categoryFilter.slice(1)} Collections` : "Shop Premium Kidswear",
    description: `Explore Sernaya Kids collections. Discover premium coordinates, stylish dresses, and comfortable nightwear sets for children.`
  });

  // Search Param Handlers to update URL and drive rendering
  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'all') newParams.delete('category');
    else newParams.set('category', cat);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSizeChange = (size) => {
    const newParams = new URLSearchParams(searchParams);
    if (size === 'all') newParams.delete('size');
    else newParams.set('size', size);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePriceChange = (price) => {
    const newParams = new URLSearchParams(searchParams);
    if (price === 3500) newParams.delete('maxPrice');
    else newParams.set('maxPrice', String(price));
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleSortChange = (sort) => {
    const newParams = new URLSearchParams(searchParams);
    if (sort === 'latest') newParams.delete('sort');
    else newParams.set('sort', sort);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (pageNumber) => {
    const newParams = new URLSearchParams(searchParams);
    if (pageNumber <= 1) {
      newParams.delete('page');
    } else {
      newParams.set('page', String(pageNumber));
    }
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSearch = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('search');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchParams({});
  };

  const normalizeAttrValue = (val) => {
    if (!val) return '';
    return val.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace('years', 'y')
      .replace('year', 'y');
  };

  // Filter products logic using universal search
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = categoryFilter === 'all' || 
      (categoryFilter === '20-off' && product.isTwentyPercentOff) ||
      product.category === categoryFilter || 
      (product.categories && product.categories.includes(categoryFilter));
    const matchesSize = sizeFilter === 'all' || product.sizes?.some(s => normalizeAttrValue(s) === normalizeAttrValue(sizeFilter));
    const matchesPrice = product.price <= priceMax;
    const matchesSearch = !searchQuery || matchesUniversalSearch(product, searchQuery);

    return matchesCategory && matchesSize && matchesPrice && matchesSearch;
  });

  // Sort products logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Keep 20% OFF products on top of the list
    if (a.isTwentyPercentOff && !b.isTwentyPercentOff) return -1;
    if (!a.isTwentyPercentOff && b.isTwentyPercentOff) return 1;

    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    // Default or "latest": sort by database ID descending (newer first)
    const idA = parseInt(a.id.replace(/\D/g, '')) || 0;
    const idB = parseInt(b.id.replace(/\D/g, '')) || 0;
    return idB - idA;
  });

  // Calculate paginated slice
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const totalProducts = sortedProducts.length;
  const startProductNum = totalProducts > 0 ? indexOfFirstProduct + 1 : 0;
  const endProductNum = Math.min(indexOfLastProduct, totalProducts);

  const allSizes = ['0-3M', '3-6M', '6-12M', '12-18M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7-8Y', 'One Size'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-10"
    > 
      <div className="text-left mb-8 border-b border-brand-navy/5 pb-6">
        <h1 className="text-3xl font-black text-brand-navy mb-2">Our Collections</h1>
        <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
          {totalProducts > 0 
            ? `Showing ${startProductNum}–${endProductNum} of ${totalProducts} premium baby and kids products.` 
            : 'Showing 0 premium baby and kids products.'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block text-left border-r border-brand-navy/5 pr-6 space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-navy flex items-center gap-1.5"><FiSliders /> Filters</h3>
              <button onClick={resetFilters} className="text-[10px] uppercase font-bold text-brand-coral hover:underline cursor-pointer">Reset All</button>
            </div>
            {searchQuery && (
              <div className="bg-bg-pink-light text-brand-navy/80 text-[10px] font-bold py-1.5 px-3 rounded-full flex items-center justify-between mb-4">
                 <span>Search: "{searchQuery}"</span>
                <button onClick={handleClearSearch} className="hover:text-brand-coral cursor-pointer"><FiX /></button>
              </div>
            )}
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-3">Categories</h4>
            <div className="flex flex-col gap-2.5 text-xs font-semibold text-brand-navy/70">
              {['20-off', 'all', 'newborn', 'girls', 'boys', 'unisex', 'summer', 'new'].map(cat => {
                const is20Off = cat === '20-off';
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-left hover:text-brand-coral transition-colors py-1 cursor-pointer capitalize flex items-center gap-1.5 ${
                      categoryFilter === cat ? 'text-brand-coral font-black' : ''
                    } ${
                      is20Off ? 'text-[#e5533c] font-black animate-pulse bg-gradient-to-r from-brand-coral/5 to-transparent px-2.5 py-1.5 rounded-lg border border-brand-coral/25 shadow-xs' : ''
                    }`}
                  >
                    {is20Off ? (
                      <span className="flex items-center gap-1">
                        <span className="inline-block animate-bounce">🔥</span> 20% OFF Sale
                      </span>
                    ) : cat === 'all' ? (
                      'All Collections'
                    ) : (
                      cat
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Filter */}
          <div>
            <h4 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-3">Size</h4>
            <div className="flex flex-wrap gap-1.5">
              {['all', ...allSizes].map(size => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider cursor-pointer ${sizeFilter === size ? 'bg-brand-navy border-brand-navy text-white' : 'bg-white border-brand-navy/10 text-brand-navy/70 hover:bg-bg-pink-light/40'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h4 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-3 flex justify-between">
              <span>Max Price</span>
              <span className="text-brand-coral font-black">Rs. {priceMax}</span>
            </h4>
            <input
              type="range"
              min="500"
              max="3500"
              step="100"
              value={priceMax}
              onChange={(e) => handlePriceChange(Number(e.target.value))}
              className="w-full accent-brand-coral cursor-pointer"
            />
            <div className="flex justify-between text-[9px] font-bold text-brand-navy/40 mt-1">
              <span>Rs. 500</span>
              <span>Rs. 3500</span>
            </div>
          </div>
        </aside>

        {/* Catalog Main Products section */}
        <section className="lg:col-span-3">
          
          {/* Controls toolbar */}
          <div className="flex justify-between items-center mb-6 bg-white border border-brand-navy/5 p-3 rounded-2xl">
            <button 
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-brand-navy border border-brand-navy/10 py-2 px-4 rounded-xl hover:bg-bg-pink-light/30 cursor-pointer"
            >
              <FiFilter /> Filter & Sort
            </button>

            <div className="hidden lg:flex items-center gap-1 text-xs text-brand-navy/60 font-semibold">
              <FiGrid />
              <span>Grid View</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 ml-auto text-xs shrink-0">
              <span className="font-bold text-brand-navy/60 hidden sm:inline">Sort By:</span>
              <select 
                value={sortBy} 
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white border border-brand-navy/10 rounded-xl py-1.5 px-3 font-bold text-brand-navy outline-none focus:border-brand-coral cursor-pointer max-w-[130px] sm:max-w-none"
              >
                <option value="latest">Latest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Products List Grid */}
          <AnimatePresence mode="popLayout">
            {loadingCatalog ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse bg-white border border-brand-navy/5 rounded-3xl p-4 aspect-[9/13] flex flex-col justify-between">
                    <div className="bg-gray-200 aspect-[9/10] rounded-2xl mb-4 w-full h-[200px]" />
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 bg-white border border-brand-navy/5 rounded-3xl"
              >
                <h3 className="text-lg font-black text-brand-navy mb-2">No Products Found</h3>
                <p className="text-xs text-brand-navy/50 font-semibold mb-6">Try refining your filters, search terms, or resetting to default.</p>
                <button onClick={resetFilters} className="bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-3 px-6 rounded-full cursor-pointer">Reset Filters</button>
              </motion.div>
            ) : (
              <>
                <motion.div 
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                >
                  {currentProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-12 pb-6">
                    <button
                      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 rounded-xl border border-brand-navy/10 text-[10px] font-extrabold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-pink-light/40 cursor-pointer text-brand-navy"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-9 h-9 rounded-xl text-xs font-extrabold cursor-pointer transition-all ${currentPage === page ? 'bg-brand-coral text-white border-brand-coral' : 'border border-brand-navy/10 text-brand-navy/70 hover:bg-bg-pink-light/40'}`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 rounded-xl border border-brand-navy/10 text-[10px] font-extrabold uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-pink-light/40 cursor-pointer text-brand-navy"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </AnimatePresence>
        </section>
      </div>

      {/* Mobile Drawer Filters Overlay */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-brand-navy/40 z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-full max-w-[300px] h-full bg-[#FBF9F4] shadow-2xl flex flex-col p-6 z-50 lg:hidden overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-4 border-b border-brand-navy/8 mb-6">
                <span className="font-heading text-sm font-extrabold text-brand-navy uppercase tracking-wider">Filters & Sort</span>
                <button onClick={() => setIsMobileFiltersOpen(false)} className="text-lg hover:text-brand-coral cursor-pointer" aria-label="Close filters">
                  <FiX />
                </button>
              </div>

              <div className="space-y-6 text-left">
                {/* Reset */}
                <button onClick={() => { resetFilters(); setIsMobileFiltersOpen(false); }} className="w-full bg-brand-navy hover:bg-black text-white text-xs font-bold py-2.5 rounded-full cursor-pointer">Reset Filters</button>

                {/* Sort By */}
                <div>
                  <h4 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-3">Sort By</h4>
                  <div className="flex flex-col gap-2 text-xs font-semibold text-brand-navy/70">
                    {[
                      { value: 'latest', label: 'Latest' },
                      { value: 'price-low', label: 'Price: Low to High' },
                      { value: 'price-high', label: 'Price: High to Low' },
                      { value: 'rating', label: 'Top Rated' }
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleSortChange(opt.value);
                          setIsMobileFiltersOpen(false);
                        }}
                        className={`text-left hover:text-brand-coral py-1 cursor-pointer capitalize ${sortBy === opt.value ? 'text-brand-coral font-black' : ''}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>                 {/* Categories */}
                <div>
                  <h4 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-3">Categories</h4>
                  <div className="flex flex-col gap-2.5 text-xs font-semibold text-brand-navy/70">
                    {['20-off', 'all', 'newborn', 'girls', 'boys', 'unisex', 'summer', 'new'].map(cat => {
                      const is20Off = cat === '20-off';
                      return (
                        <button
                          key={cat}
                          onClick={() => {
                            handleCategoryChange(cat);
                            setIsMobileFiltersOpen(false);
                          }}
                          className={`text-left hover:text-brand-coral transition-colors py-1 cursor-pointer capitalize flex items-center gap-1.5 ${
                            categoryFilter === cat ? 'text-brand-coral font-black' : ''
                          } ${
                            is20Off ? 'text-[#e5533c] font-black animate-pulse bg-gradient-to-r from-brand-coral/5 to-transparent px-2.5 py-1.5 rounded-lg border border-brand-coral/25 shadow-xs' : ''
                          }`}
                        >
                          {is20Off ? (
                            <span className="flex items-center gap-1">
                              <span className="inline-block animate-bounce">🔥</span> 20% OFF Sale
                            </span>
                          ) : cat === 'all' ? (
                            'All Collections'
                          ) : (
                            cat
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <h4 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-3">Size</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {['all', ...allSizes].map(size => (
                      <button
                        key={size}
                        onClick={() => handleSizeChange(size)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold tracking-wider cursor-pointer ${sizeFilter === size ? 'bg-brand-navy border-brand-navy text-white' : 'bg-white border-brand-navy/10 text-brand-navy/70 hover:bg-bg-pink-light/40'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h4 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-3 flex justify-between">
                    <span>Max Price</span>
                    <span className="text-brand-coral font-black">Rs. {priceMax}</span>
                  </h4>
                  <input
                    type="range"
                    min="500"
                    max="3500"
                    step="100"
                    value={priceMax}
                    onChange={(e) => handlePriceChange(Number(e.target.value))}
                    className="w-full accent-brand-coral cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-brand-navy/40 mt-1">
                    <span>Rs. 500</span>
                    <span>Rs. 3500</span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
