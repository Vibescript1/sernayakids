import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi';

const BANNERS = [
  '/banner 1.png',
  '/assets/sale-20.png',
];

const slideVariants = {
  enter: (dir) => ({
    x: dir > 0 ? '100%' : '-100%',
    opacity: 0
  }),
  center: {
    x: 0,
    opacity: 1
  },
  exit: (dir) => ({
    x: dir < 0 ? '100%' : '-100%',
    opacity: 0
  })
};

export default function DesktopCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const timer = useRef(null);

  const startAutoplay = () => {
    stopAutoplay();
    timer.current = setInterval(() => {
      setDirection(1);
      setIndex(prev => (prev + 1) % BANNERS.length);
    }, 6000);
  };

  const stopAutoplay = () => {
    if (timer.current) clearInterval(timer.current);
  };

  useEffect(() => {
    // Preload all banner images in background for instant slide transitions
    BANNERS.forEach((src) => {
      const img = new Image();
      img.src = src;
    });

    startAutoplay();
    return () => stopAutoplay();
  }, []);

  return (
    <section
      className="relative z-0 overflow-hidden border-b border-brand-navy/5 w-full bg-bg-cream aspect-[16/9]"
    >
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <Link to="/shop" className="w-full h-full block">
            <img
              src={BANNERS[index]}
              alt={`Sernaya Kids Banner ${index + 1}`}
              className="w-full h-full object-cover"
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
          </Link>
        </motion.div>
      </AnimatePresence>

      {/* Slider Controls */}
      <button
        onClick={() => {
          stopAutoplay();
          setDirection(-1);
          setIndex(prev => (prev - 1 + BANNERS.length) % BANNERS.length);
          startAutoplay();
        }}
        className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white text-brand-navy flex items-center justify-center shadow-md hover:text-brand-coral transition-colors z-20 cursor-pointer"
        aria-label="Previous Slide"
      >
        <FiArrowLeft className="text-sm sm:text-lg" />
      </button>
      <button
        onClick={() => {
          stopAutoplay();
          setDirection(1);
          setIndex(prev => (prev + 1) % BANNERS.length);
          startAutoplay();
        }}
        className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 hover:bg-white text-brand-navy flex items-center justify-center shadow-md hover:text-brand-coral transition-colors z-20 cursor-pointer"
        aria-label="Next Slide"
      >
        <FiArrowRight className="text-sm sm:text-lg" />
      </button>

      {/* Slider Dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-2.5 z-20">
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              stopAutoplay();
              setDirection(i > index ? 1 : -1);
              setIndex(i);
              startAutoplay();
            }}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all cursor-pointer ${index === i ? 'bg-brand-coral w-5 sm:w-6' : 'bg-brand-navy/30'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
