import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiHeart, FiGlobe, FiShield } from 'react-icons/fi';
import useSEO from '../hooks/useSEO';

export default function About() {
  useSEO({
    title: "Brand Story & Founders",
    description: "Learn about the mission behind Sernaya Kids. Meticulously designing comfortable, premium kidswear collections for happy children."
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-12 text-left"
    >
      {/* Intro Hero Section */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-16">
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest bg-brand-coral/10 py-1.5 px-4 rounded-full inline-block">
            Our Journey
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-navy leading-tight">
            Crafting Childhood Memories with Care & Love
          </h1>
          <p className="text-sm text-brand-navy/80 leading-relaxed font-semibold">
            Sernaya Kids was born out of a simple need: to provide children with clothes that are as free, soft, and comfortable as their imaginations. We set out to design clothing that is perfect for daily play, adventures, and everyday childhood milestones.
          </p>
          <p className="text-sm text-brand-navy/60 leading-relaxed font-semibold">
            We design everyday play-wear and cozy loungewear collections that kids love to wear, combining high-quality stitching, adorable patterns, and parent-approved durability.
          </p>
        </div>
        <div className="lg:col-span-6 relative aspect-[16/11] rounded-3xl overflow-hidden shadow-lg border border-brand-navy/5">
          <img src="assets/hero-kids.jpg" alt="Children playing outdoors" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </div>
      </section>

      {/* Core Values / Philosophy grid */}
      <section className="bg-white border border-brand-navy/5 p-8 md:p-12 rounded-[40px] shadow-sm mb-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest block mb-2">Our Philosophy</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">Built On Trust, Comfort & Value</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-bg-pink-light rounded-full flex items-center justify-center text-brand-pink text-xl shrink-0">
              <FiHeart />
            </div>
            <h3 className="text-base font-black text-brand-navy">Cozy Comfort</h3>
            <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold leading-relaxed">
              Super-soft fabric selections that feel gentle on the skin, featuring tagless labels and flat-locked seams.
            </p>
          </div>

          <div className="space-y-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-bg-blue-light rounded-full flex items-center justify-center text-brand-blue text-xl shrink-0">
              <FiGlobe />
            </div>
            <h3 className="text-base font-black text-brand-navy">Playful Designs</h3>
            <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold leading-relaxed">
              Fun and functional styles designed to support free movement and comfortable daily crawls and play.
            </p>
          </div>

          <div className="space-y-4 flex flex-col items-center">
            <div className="w-12 h-12 bg-bg-lavender-light rounded-full flex items-center justify-center text-brand-lavender text-xl shrink-0">
              <FiShield className="text-xl" />
            </div>
            <h3 className="text-base font-black text-brand-navy">Play-Proof Quality</h3>
            <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold leading-relaxed">
              Sturdy double-lock stitches designed to last through mud, playground slides, and multiple machine washes.
            </p>
          </div>
        </div>
      </section>

      {/* Sustainable Fabrics detail sections */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
        <div className="lg:col-span-6 order-last lg:order-first relative aspect-[4/3] rounded-3xl overflow-hidden shadow-md">
          <img src="assets/category-new.webp" alt="Linen and cotton processing" className="w-full h-full object-cover" loading="lazy" decoding="async" />
        </div>
        <div className="lg:col-span-6 space-y-6">
          <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest mb-2 block">Everyday Playwear</span>
          <h2 className="text-2xl sm:text-3xl font-black text-brand-navy leading-tight">Why Choose Sernaya Kids Outfits?</h2>
          <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed font-semibold">
            We design everyday clothing that keeps kids happy, active, and comfortable. Our fits are carefully tailored to support unrestricted play, crawls, and runs while making dressing simple and quick for parents.
          </p>

          <ul className="space-y-3.5 text-xs sm:text-sm font-semibold text-brand-navy/80">
            <li className="flex gap-2.5 items-start">
              <FiCheckCircle className="text-brand-coral shrink-0 mt-0.5" />
              <span><strong>Comfort-First Fit:</strong> Generous cuts and stretchable fits that support active play and daily movement without tightness.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <FiCheckCircle className="text-brand-coral shrink-0 mt-0.5" />
              <span><strong>Parent-Friendly Dressing:</strong> Smart snaps, wide necklines, and elastic waistbands that make outfit changes and diaper breaks hassle-free.</span>
            </li>
            <li className="flex gap-2.5 items-start">
              <FiCheckCircle className="text-brand-coral shrink-0 mt-0.5" />
              <span><strong>Superb Quality & Value:</strong> Resilient fabrics and strong stitches built to survive slides, spills, and endless laundry cycles.</span>
            </li>
          </ul>

          <div className="pt-4">
            <Link to="/shop" className="bg-brand-navy hover:bg-black text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-lg">Shop Playproof Styles</Link>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="border-t border-brand-navy/40 pt-16 mb-12">
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest block mb-2">Our Leaders</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-navy">Meet the Founders</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {/* Priyanshi */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-56 h-56 rounded-full overflow-hidden shadow-md border border-brand-navy/5">
              <img src="assets/priyanshi-manchanda-founder.webp" alt="Priyanshi Manchanda - Founder" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-navy">Priyanshi Manchanda</h3>
              <p className="text-xs font-bold text-brand-coral uppercase tracking-widest mt-1">Founder</p>
            </div>
            <p className="text-xs text-brand-navy/60 font-semibold leading-relaxed max-w-xs">
              The visionary force behind Sernaya Kids, dedicated to designing comfortable, premium collections that let children explore the world safely and comfortably.
            </p>
          </div>

          {/* Karan */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-56 h-56 rounded-full overflow-hidden shadow-md border border-brand-navy/5">
              <img src="assets/karan-manchanda-co-founder.webp" alt="Karan Manchanda - Co-Founder" className="w-full h-full object-cover" loading="lazy" decoding="async" />
            </div>
            <div>
              <h3 className="text-lg font-black text-brand-navy">Karan Manchanda</h3>
              <p className="text-xs font-bold text-brand-coral uppercase tracking-widest mt-1">Co-Founder</p>
            </div>
            <p className="text-xs text-brand-navy/60 font-semibold leading-relaxed max-w-xs">
              Steering our operations and quality systems, committed to ensuring every garment meets high standards of ethical craftsmanship and play-proof durability.
            </p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
