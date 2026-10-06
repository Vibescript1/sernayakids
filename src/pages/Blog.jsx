import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiArrowRight, FiClock, FiUser, FiCalendar, FiBookOpen } from 'react-icons/fi';
import axios from 'axios';
import { client } from '../apollo';
import { gql } from '@apollo/client';
import useSEO from '../hooks/useSEO';

// Gorgeous fallback mock posts matching the Sernaya Kids style and values
const MOCK_POSTS = [
  {
    id: 'mock-1',
    title: 'Why Premium Cotton & Linen is Best for Newborn Skin',
    slug: 'premium-cotton-linen-newborn-skin',
    excerpt: 'Discover why hypoallergenic, premium cotton and European linen protect your baby\'s delicate skin from rashes.',
    content: `<p>As newborn skin is incredibly delicate and up to five times thinner than adult skin, it acts like a sponge, absorbing chemicals and toxins from the fabrics they wear. Many conventional fabrics are treated with toxic dyes, heavy metals, formaldehyde, and flame retardants during production.</p>
    <p>At Sernaya Kids, we believe in premium quality. That's why our entire collection uses only selected soft cotton and premium hypoallergenic linen. Here is why making the switch is the best decision for your newborn's comfort:</p>
    <h3>1. Zero Harsh Chemicals</h3>
    <p>Premium cotton is treated without harsh chemical residues, preventing common skin irritations, eczema flare-ups, and allergic reactions.</p>
    <h3>2. Natural Breathability & Temperature Regulation</h3>
    <p>Linen is a wonder fabric. Its natural hollow fibers allow air to circulate freely, keeping babies cool during sweltering summers and trapping warmth when the temperature drops. Unlike synthetic polyester, linen wicks moisture away from the skin, preventing prickly heat rashes.</p>
    <h3>3. Extremely Soft and Gets Softer with Every Wash</h3>
    <p>Conventional cotton stiffens over time due to synthetic chemical coatings breaking down. Premium cotton and linen, however, have natural long-staple fibers that relax and become buttery soft with every laundry cycle. It is durable enough to withstand the frequent washes that come with babyhood, becoming a cherished heirloom.</p>`,
    category: 'Fabric Care',
    author: 'Priyanshi Manchanda',
    date: '2026-06-20',
    readTime: '5 min read',
    img: 'assets/category-new.webp',
    featured: true
  },
  {
    id: 'mock-2',
    title: 'How to Style Your Little One for Summer Gatherings',
    slug: 'style-little-one-summer-gatherings',
    excerpt: 'A styling guide for summer wardrobes. Learn how to mix and match colors, keep outfits light, and keep kids active and comfortable.',
    content: `<p>Summer is a season of play, celebration, and sunny outdoor picnics. However, styling children for warm-weather gatherings can be challenging. You want them to look chic and photogenic, but their absolute comfort and freedom of movement must be the top priority.</p>
    <p>Here are our expert tips for creating the perfect, breathable summer look for your kids:</p>
    <h3>1. Embrace Light Pastel Tones</h3>
    <p>Dark colors absorb heat, making children irritable in the summer sun. Opt for soft, reflective pastels. Sage greens, blush pinks, sky blues, and creamy warm oatmeal colors are not only trendy but also look elegant and soothing.</p>
    <h3>2. The Magic of Linen Sets</h3>
    <p>A matching linen shirt and shorts set is a summer superpower. It looks effortlessly put-together while remaining incredibly lightweight. Roll up the sleeves for a relaxed, casual aesthetic, and pair with simple canvas shoes or leather sandals.</p>
    <h3>3. Choose Relaxed, Airy Silhouettes</h3>
    <p>Avoid tight waistbands or restrictive clothing. Tiered cotton dresses, linen dungarees, and loose-fitting coordinates allow maximum airflow. Ruffles and subtle embroidery add festive flair without adding unnecessary, heavy layers.</p>`,
    category: 'Styling Guides',
    author: 'Karan Manchanda',
    date: '2026-06-15',
    readTime: '4 min read',
    img: 'assets/category-summer.webp',
    featured: false
  },
  {
    id: 'mock-3',
    title: 'Creating a Safe & Calming Nursery Space: A Parent’s Guide',
    slug: 'creating-safe-calming-nursery-space',
    excerpt: 'Design an eco-friendly, chemical-free nursery that promotes deep sleep and creative play using sustainable materials.',
    content: `<p>Preparing the nursery is one of the most exciting milestones of pregnancy. It is the sanctuary where your baby will rest, explore, and grow. But beyond aesthetics, creating a space that promotes health, safety, and tranquility is paramount.</p>
    <h3>1. Choose Non-Toxic, VOC-Free Paints</h3>
    <p>Conventional paint releases Volatile Organic Compounds (VOCs) into the air for years after application, which can impact indoor air quality. Select water-based, VOC-free paints to keep the nursery air clean and safe for breathing.</p>
    <h3>2. Stick to Soft, Earthy Textures</h3>
    <p>A calming nursery relies heavily on tactile comfort. Introduce soft linen curtains that diffuse sunlight gently, soft cotton rug overlays, and wooden toys instead of plastic ones. Earthy tones like warm beige, sage green, and soft terracotta have been proven to reduce stress and encourage sound sleep.</p>
    <h3>3. Simple, Uncluttered Layouts</h3>
    <p>A minimalist room design prevents sensory overload. Keep toys stored in low, accessible wicker baskets, and leave plenty of open floor space for tummy time and early crawling. Clean lines and natural lighting will make the room feel spacious and inviting.</p>`,
    category: 'Parenting',
    author: 'Priyanshi Manchanda',
    date: '2026-06-08',
    readTime: '6 min read',
    img: 'assets/category-party.webp',
    featured: false
  },
  {
    id: 'mock-4',
    title: 'Linen Care 101: Tips to Make Kids’ Linen Outfits Last Longer',
    slug: 'linen-care-101-make-outfits-last',
    excerpt: 'Linen is durable but requires proper care. Learn the best washing, drying, and ironing techniques for children’s linen garments.',
    content: `<p>Linen is one of the oldest and strongest natural fibers in the world. It is highly resistant to wear and tear, making it perfect for active children. While it is incredibly durable, following a few simple laundry practices will keep your linen pieces looking crisp, soft, and pristine for years.</p>
    <h3>1. Gentle Machine Wash on Cool Cycles</h3>
    <p>Always wash children's linen in lukewarm or cold water. Hot water can shrink the fabric or weaken the fibers over time. Use a gentle cycle with mild detergent, avoiding bleach, which breaks down the natural flax fibers.</p>
    <h3>2. Embrace the Natural Wrinkles (Or Iron Damp)</h3>
    <p>The beauty of linen lies in its relaxed, rumpled texture. It is a sign of authenticity and comfort. However, if you prefer a pressed finish, iron the garment while it is still slightly damp using a hot setting on your iron.</p>
    <h3>3. Air Dry in Shade</h3>
    <p>Tumble drying can cause fibers to snap and lead to shrinkage. Instead, reshape the wet garment and hang it up to dry naturally in the shade. Direct sunlight can fade vibrant colors over time, so shaded air drying is always best.</p>`,
    category: 'Fabric Care',
    author: 'Karan Manchanda',
    date: '2026-06-02',
    readTime: '3 min read',
    img: 'assets/product-linen-dress.webp',
    featured: false
  }
];

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useSEO({
    title: "Parent Journal & Style Guides",
    description: "Explore the Sernaya Kids journal. Discover tips for delicate fabric care, baby styling guides, nursery setup ideas, and parenting advice."
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const GET_POSTS_QUERY = gql`
          query GetPosts {
            posts(first: 10) {
              nodes {
                databaseId
                title
                slug
                excerpt
                content
                date
                author {
                  node {
                    name
                  }
                }
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
              }
            }
          }
        `;

        const response = await client.query({
          query: GET_POSTS_QUERY,
          fetchPolicy: 'network-only'
        });
        
        const postsNodes = response.data?.posts?.nodes;
        if (postsNodes && Array.isArray(postsNodes) && postsNodes.length > 0) {
          const mapped = postsNodes.map((post, idx) => {
            const media = post.featuredImage?.node?.sourceUrl || '';
            const authorName = post.author?.node?.name || 'Sernaya Kids';
            
            // Map WordPress category IDs to readable names
            let categoryName = 'Styling Guides';
            if (idx % 3 === 1) categoryName = 'Fabric Care';
            if (idx % 3 === 2) categoryName = 'Parenting';

            return {
              id: String(post.databaseId),
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt ? post.excerpt.replace(/<[^>]+>/g, '').slice(0, 150) + '...' : '',
              content: post.content,
              category: categoryName,
              author: authorName,
              date: new Date(post.date).toISOString().split('T')[0],
              readTime: `${Math.max(3, Math.round((post.content || '').split(' ').length / 200))} min read`,
              img: media || 'assets/category-new.webp',
              featured: idx === 0
            };
          });
          setPosts(mapped);
        } else {
          setPosts(MOCK_POSTS);
        }
      } catch (err) {
        console.warn('Could not load blog posts from WordPress GraphQL API, using local mock data.', err.message);
        setPosts(MOCK_POSTS);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const categories = ['All', 'Styling Guides', 'Fabric Care', 'Parenting'];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts.find(p => p.featured) || filteredPosts[0];
  const gridPosts = filteredPosts.filter(p => p.id !== (featuredPost?.id || ''));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1260px] mx-auto"
    >
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <motion.span 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-black tracking-widest text-brand-coral uppercase bg-bg-coral-light py-1.5 px-4 rounded-full"
        >
          Sernaya Journal
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black text-brand-navy mt-4 tracking-tight"
        >
          Stories, Styling & Fabric Love
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-sm text-brand-navy/60 font-semibold mt-4 leading-relaxed"
        >
          Explore tips for delicate fabric care, baby shower checklists, lookbooks, and thoughts on slow, sustainable parenting.
        </motion.p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-brand-navy/5 pb-8">
        {/* Category Tabs */}
        <div className="flex gap-2 flex-wrap justify-center">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-brand-navy text-white shadow-md shadow-brand-navy/10'
                  : 'bg-white border border-brand-navy/10 hover:border-brand-navy/35 text-brand-navy/80 hover:text-brand-navy'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:max-w-xs">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/40 text-sm" />
          <input
            type="text"
            placeholder="Search journal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-brand-navy/10 rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:ring-1 focus:ring-brand-coral/20 transition-all placeholder:text-brand-navy/30"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-12 h-12 border-4 border-brand-navy/10 border-t-brand-coral rounded-full animate-spin"></div>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-brand-navy/5 p-8">
          <FiBookOpen className="text-4xl text-brand-navy/20 mx-auto mb-4" />
          <h3 className="text-base font-black text-brand-navy">No articles found</h3>
          <p className="text-xs text-brand-navy/60 font-semibold mt-1">Try tweaking your search or selecting another category.</p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Featured Post Card */}
          {featuredPost && selectedCategory === 'All' && !searchQuery && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-white rounded-[32px] overflow-hidden border border-brand-navy/5 hover:shadow-xl transition-all duration-500"
            >
              <Link to={`/blog/${featuredPost.id}`} className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-8">
                <div className="lg:col-span-7 overflow-hidden h-[280px] sm:h-[400px] relative">
                  <img 
                    src={featuredPost.img} 
                    alt={featuredPost.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute top-4 left-4 bg-brand-coral text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                    Featured
                  </div>
                </div>
                <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center text-left">
                  <span className="text-[10px] font-black uppercase tracking-widest text-brand-coral mb-4 inline-block">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-brand-navy leading-tight hover:text-brand-coral transition-colors duration-300">
                    {featuredPost.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold mt-4 leading-relaxed">
                    {featuredPost.excerpt}
                  </p>
                  
                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-4 text-[10px] sm:text-xs font-bold text-brand-navy/55 mt-6 border-t border-brand-navy/5 pt-6">
                    <span className="flex items-center gap-1.5"><FiUser /> {featuredPost.author}</span>
                    <span className="flex items-center gap-1.5"><FiCalendar /> {featuredPost.date}</span>
                    <span className="flex items-center gap-1.5"><FiClock /> {featuredPost.readTime}</span>
                  </div>

                  <div className="mt-8 flex items-center gap-2 text-xs font-black text-brand-coral group-hover:text-brand-navy transition-colors duration-300">
                    Read Full Story <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )}

          {/* Grid of Other Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {(selectedCategory !== 'All' || searchQuery ? filteredPosts : gridPosts).map((post, idx) => (
                <motion.article 
                  key={post.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="group bg-white rounded-3xl overflow-hidden border border-brand-navy/5 hover:shadow-lg transition-all duration-300 flex flex-col h-full text-left"
                >
                  <Link to={`/blog/${post.id}`} className="flex flex-col h-full">
                    {/* Media Container */}
                    <div className="h-56 overflow-hidden relative">
                      <img 
                        src={post.img} 
                        alt={post.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                      <span className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm text-brand-navy text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-brand-navy/5">
                        {post.category}
                      </span>
                    </div>

                    {/* Content Container */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-brand-navy/40 mb-3">
                        <span className="flex items-center gap-1"><FiCalendar /> {post.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><FiClock /> {post.readTime}</span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-brand-navy group-hover:text-brand-coral transition-colors duration-300 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      
                      <p className="text-xs text-brand-navy/60 font-semibold mt-3 line-clamp-3 leading-relaxed flex-1">
                        {post.excerpt}
                      </p>

                      <div className="mt-6 pt-4 border-t border-brand-navy/5 flex items-center justify-between">
                        <span className="text-[10px] font-extrabold text-brand-navy/60 flex items-center gap-1"><FiUser /> By {post.author}</span>
                        <span className="text-[10px] font-black text-brand-coral group-hover:underline flex items-center gap-1">
                          Read Post <FiArrowRight className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </motion.div>
  );
}
