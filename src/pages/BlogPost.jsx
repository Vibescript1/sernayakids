import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiUser, FiCalendar, FiBookOpen, FiShare2, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';
import { client } from '../apollo';
import { gql } from '@apollo/client';
import DOMPurify from 'dompurify';
import useSEO from '../hooks/useSEO';

// Fallback mock posts (must match Blog.jsx mock posts for full catalog lookup)
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

export default function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  useSEO({
    title: post ? post.title : 'Journal Entry',
    description: post ? post.excerpt : 'Read Sernaya Kids parenting stories and baby care journal entries.',
    ogImage: post ? post.img : 'logo.webp',
    ogType: 'article'
  });

  useEffect(() => {
    const fetchPostData = async () => {
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
        
        let postsList = [];
        const postsNodes = response.data?.posts?.nodes;

        if (postsNodes && Array.isArray(postsNodes) && postsNodes.length > 0) {
          postsList = postsNodes.map((p, idx) => {
            const media = p.featuredImage?.node?.sourceUrl || '';
            const authorName = p.author?.node?.name || 'Sernaya Kids';
            
            let categoryName = 'Styling Guides';
            if (idx % 3 === 1) categoryName = 'Fabric Care';
            if (idx % 3 === 2) categoryName = 'Parenting';

            return {
              id: String(p.databaseId),
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt ? p.excerpt.replace(/<[^>]+>/g, '').slice(0, 150) + '...' : '',
              content: p.content,
              category: categoryName,
              author: authorName,
              date: new Date(p.date).toISOString().split('T')[0],
              readTime: `${Math.max(3, Math.round((p.content || '').split(' ').length / 200))} min read`,
              img: media || 'assets/category-new.webp',
              featured: idx === 0
            };
          });
          setAllPosts(postsList);
        } else {
          setAllPosts(MOCK_POSTS);
          postsList = MOCK_POSTS;
        }

        // Find the specific post by id
        const found = postsList.find(p => p.id === id);
        if (found) {
          setPost(found);
        } else {
          // Try fallback check in mocks directly
          const fallbackFound = MOCK_POSTS.find(p => p.id === id);
          if (fallbackFound) {
            setPost(fallbackFound);
          } else {
            // Not found at all, navigate back to blog
            navigate('/blog');
          }
        }
      } catch (err) {
        console.warn('Could not load blog posts from WordPress GraphQL API, using local mock data.', err.message);
        setAllPosts(MOCK_POSTS);
        const fallbackFound = MOCK_POSTS.find(p => p.id === id);
        if (fallbackFound) {
          setPost(fallbackFound);
        } else {
          navigate('/blog');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
    // Scroll to top when post changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, navigate]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-48">
        <div className="w-12 h-12 border-4 border-brand-navy/10 border-t-brand-coral rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-24 px-6">
        <h2 className="text-xl font-black text-brand-navy">Article Not Found</h2>
        <Link to="/blog" className="text-brand-coral font-black mt-4 inline-block hover:underline">
          Back to Journal
        </Link>
      </div>
    );
  }

  // Get 3 related posts (excluding current post)
  const relatedPosts = allPosts
    .filter(p => p.id !== post.id)
    .slice(0, 3);

  return (
    <motion.article 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-bg-cream text-brand-navy"
    >
      {/* Hero Header Area */}
      <div className="max-w-[1260px] mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        {/* Navigation row */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/blog" 
            className="flex items-center gap-2 text-xs font-black uppercase text-brand-navy/60 hover:text-brand-coral transition-colors"
          >
            <FiArrowLeft /> Back to Journal
          </Link>

          <button 
            onClick={handleShare}
            className="flex items-center gap-2 text-xs font-black uppercase text-brand-navy/60 hover:text-brand-coral transition-colors cursor-pointer border border-brand-navy/10 bg-white py-2 px-4 rounded-full"
          >
            {shared ? (
              <>
                <FiCheckCircle className="text-green-500" /> Link Copied
              </>
            ) : (
              <>
                <FiShare2 /> Share Article
              </>
            )}
          </button>
        </div>

        {/* Title and Metadata */}
        <div className="max-w-3xl text-left mb-10">
          <span className="text-xs font-black tracking-widest text-brand-coral uppercase bg-bg-coral-light py-1.5 px-4 rounded-full inline-block mb-4">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-brand-navy tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-brand-navy/60 mt-6 border-y border-brand-navy/5 py-4">
            <span className="flex items-center gap-2"><FiUser className="text-brand-coral text-sm" /> By {post.author}</span>
            <span className="flex items-center gap-2"><FiCalendar className="text-brand-coral text-sm" /> Published {post.date}</span>
            <span className="flex items-center gap-2"><FiClock className="text-brand-coral text-sm" /> {post.readTime}</span>
          </div>
        </div>
      </div>

      {/* Featured Banner Image */}
      <div className="w-full max-w-[1260px] mx-auto h-[250px] sm:h-[450px] overflow-hidden rounded-3xl sm:px-6 lg:px-8 mb-12">
        <img 
          src={`/${post.img}`} 
          alt={post.title} 
          className="w-full h-full object-cover rounded-3xl"
        />
      </div>

      {/* Article Body Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-24">
        {/* Render HTML content with custom styled typography classes */}
        <div 
          className="blog-content text-left text-sm sm:text-base text-brand-navy/85 font-medium leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, {
            ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'span', 'strong', 'em', 'img', 'br', 'a'],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel'],
            ALLOW_UNKNOWN_PROTOCOLS: false,
          }) }}
        />
      </div>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-brand-navy/8 bg-white/40 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1260px] mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-brand-navy text-left mb-10 tracking-tight">
              Other Journal Entries You Might Enjoy
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedPosts.map(p => (
                <article 
                  key={p.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-brand-navy/5 hover:shadow-lg transition-all duration-300 flex flex-col text-left"
                >
                  <Link to={`/blog/${p.id}`} className="flex flex-col h-full">
                    <div className="h-48 overflow-hidden relative">
                      <img 
                        src={`/${p.img}`} 
                        alt={p.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                      <span className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-brand-navy text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-brand-navy/5">
                        {p.category}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 text-[9px] font-bold text-brand-navy/40 mb-2">
                        <span className="flex items-center gap-1"><FiCalendar /> {p.date}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><FiClock /> {p.readTime}</span>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-brand-navy group-hover:text-brand-coral transition-colors duration-300 line-clamp-2 leading-snug">
                        {p.title}
                      </h3>
                      
                      <p className="text-xs text-brand-navy/60 font-semibold mt-2.5 line-clamp-2 leading-relaxed flex-1">
                        {p.excerpt}
                      </p>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Global CSS Inject to style WordPress HTML content markup inside blog-content container */}
      <style>{`
        .blog-content p {
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: #1a2e40;
        }
        .blog-content h2, .blog-content h3 {
          font-family: 'Lato', sans-serif;
          font-weight: 900;
          color: #0A1E33;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .blog-content h2 {
          font-size: 1.5rem;
        }
        .blog-content h3 {
          font-size: 1.25rem;
        }
        .blog-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
          line-height: 1.7;
        }
        .blog-content strong {
          color: #0A1E33;
          font-weight: 800;
        }
      `}</style>
    </motion.article>
  );
}
