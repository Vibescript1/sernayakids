import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaXmark } from 'react-icons/fa6';
import { FiSend } from 'react-icons/fi';

export default function WhatsAppButton() {
  const [isOpen, setIsOpen] = useState(false);

  const whatsappNumber = '919643541744';
  const customMessage = encodeURIComponent("Hi Sernaya Kids! I'd love to know more about your premium outfits.");
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${customMessage}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 font-body text-left">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="absolute bottom-18 right-0 bg-white rounded-3xl overflow-hidden shadow-2xl border border-black/5 w-80 md:w-96"
          >
            {/* Widget Header */}
            <div className="bg-[#075E54] text-white p-5 flex items-center gap-4 relative">
              <div className="relative">
                <img 
                  src="/assets/priyanshi-manchanda-founder.webp" 
                  alt="Priyanshi Manchanda - Founder" 
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#075E54] animate-pulse"></span>
              </div>
              <div>
                <h4 className="text-sm font-black tracking-wide leading-none">Priyanshi Manchanda</h4>
                <span className="text-[10px] text-white/70 font-semibold mt-1 block">Founder, Sernaya Kids</span>
                <span className="text-[9px] bg-white/10 text-white/90 py-0.5 px-2 rounded-full mt-1.5 inline-block font-extrabold">Online & Ready</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white cursor-pointer transition-colors"
                aria-label="Close chat window"
              >
                <FaXmark size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-6 bg-[#E5DDD5] max-h-52 overflow-y-auto space-y-4">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm text-xs font-semibold text-brand-navy leading-relaxed max-w-[85%]">
                <p>Hello! Thanks for visiting Sernaya Kids. 👋</p>
                <p className="mt-2">How can I help you pick the perfect premium outfit or custom set for your little one today?</p>
              </div>
              <span className="text-[9px] text-brand-navy/40 font-bold block ml-1 text-left">Just now</span>
            </div>

            {/* Chat Footer Button */}
            <div className="p-4 bg-white border-t border-black/5 flex items-center justify-between gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-extrabold py-3.5 px-6 rounded-full flex items-center justify-center gap-2 shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
              >
                <FaWhatsapp className="text-base" /> Start Chat on WhatsApp
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pulsing Chat Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:bg-[#20ba59] transition-colors relative cursor-pointer group"
        aria-label="Toggle WhatsApp Chat"
      >
        <span className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-25 group-hover:hidden"></span>
        {isOpen ? <FaXmark className="text-xl" /> : <FaWhatsapp className="text-2xl" />}
      </motion.button>
    </div>
  );
}
