import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { FaInstagram, FaFacebookF, FaYoutube } from 'react-icons/fa6';
import { FiSend } from 'react-icons/fi';

export default function Footer({ setIsSizeModalOpen }) {
  const { showToast } = useShop();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (loading) return;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      showToast('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      showToast('Thank you for subscribing to Sernaya Kids club!');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <footer className="border-t text-[#bbbbbb] pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-[1260px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        
        {/* Brand details col */}
        <div className="lg:col-span-4 text-left">
          <Link to="/" className="inline-block mb-6 p-2 rounded-2xl">
            <img src="/logo.webp" alt="Sernaya Kids" className="h-24 w-auto" />
          </Link>
          <p className="text-xs text-black/80 leading-relaxed mb-4 font-semibold max-w-sm">
            Premium children wear made with care and love for childhood milestones.
          </p>
          <div className="text-xs text-black/75 font-semibold space-y-2 mb-6 text-left">
            <p>📞 Call/WhatsApp: <a href="tel:+919643541744" className="hover:text-brand-coral transition-colors">+91-96435 41744</a></p>
            <p>✉️ Email: <a href="mailto:Sernayakids@gmail.com" className="hover:text-brand-coral transition-colors">Sernayakids@gmail.com</a></p>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://www.instagram.com/sernayakids" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-pink-500 text-pink-500 border hover:text-white flex items-center justify-center text-xs transition-colors"
              aria-label="Visit our Instagram page"
            >
              <FaInstagram />
            </a>
            <a 
              href="https://www.facebook.com/share/1G9AdttWVK/" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-blue-600 text-blue-600 border hover:text-white flex items-center justify-center text-xs transition-colors"
              aria-label="Visit our Facebook page"
            >
              <FaFacebookF />
            </a>
            <a 
              href="https://www.youtube.com/@sernayakids" 
              target="_blank" 
              rel="noreferrer" 
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-600 text-red-600 border hover:text-white flex items-center justify-center text-xs transition-colors"
              aria-label="Visit our YouTube channel"
            >
              <FaYoutube />
            </a>
          </div>
        </div>

        {/* Quick Links col */}
        <div className="lg:col-span-2 text-left">
          <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-orange-600 mb-6">Explore</h3>
          <ul className="flex flex-col gap-3 text-xs font-semibold text-black/80">
            <li><Link to="/" className="hover:text-brand-coral transition-colors">Home Page</Link></li>
            <li><Link to="/shop" className="hover:text-brand-coral transition-colors">Shop Catalog</Link></li>
            <li><Link to="/shop?category=girls" className="hover:text-brand-coral transition-colors">Girls Collection</Link></li>
            <li><Link to="/shop?category=boys" className="hover:text-brand-coral transition-colors">Boys Collection</Link></li>
            <li><Link to="/shop?category=newborn" className="hover:text-brand-coral transition-colors">Newborn Sets</Link></li>
            {/* <li><Link to="/blog" className="hover:text-brand-coral transition-colors">Blog & Journal</Link></li> */}
          </ul>
        </div>

        {/* Support Links col */}
        <div className="lg:col-span-2 text-left">
          <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-orange-600 mb-6">Customer Care</h3>
          <ul className="flex flex-col gap-3 text-xs font-semibold text-black/80">
            <li><Link to="/contact" className="hover:text-brand-coral transition-colors">Contact Support</Link></li>
            <li><button onClick={() => setIsSizeModalOpen(true)} className="hover:text-brand-coral transition-colors text-left cursor-pointer">Size Guide Chart</button></li>
            <li><Link to="/about" className="hover:text-brand-coral transition-colors font-semibold">Brand Story</Link></li>
          </ul>
        </div>

        {/* Newsletter Registration col */}
        <div className="lg:col-span-4 text-left">
          <h3 className="font-heading text-xs font-bold uppercase tracking-widest text-orange-600 mb-6">Subscribe To Newsletter</h3>
          <p className="text-xs text-black/80 leading-relaxed mb-6 font-semibold">
            Subscribe to receive exclusive offers, new collection arrivals notifications, and style guides.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2 border-orange-300 text-black border rounded-full p-1.5 focus-within:border-brand-coral focus-within:ring-1 focus-within:ring-brand-coral transition-all">
            <input 
              type="email" 
              placeholder={loading ? "Subscribing..." : "Your email address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="flex-1 bg-transparent border-none text-black text-xs outline-none pl-3.5 disabled:opacity-50"
              required 
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-brand-coral hover:bg-brand-coral-hover text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend className="text-xs" />
            </button>
          </form>
        </div>

      </div>

      {/* Copyright row */}
      <div className="max-w-[1260px] mx-auto border-t border-white/10 pt-8 flex flex-col md:flex-row justify-center items-center gap-2 text-[10px] md:text-xs font-semibold text-black/80">
        <span>© {new Date().getFullYear()} Sernaya Kids. All Rights Reserved.</span>
        <div className="flex gap-6">
          <Link to="/privacy-policy" className="hover:text-brand-coral cursor-pointer">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
