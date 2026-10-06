import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiClock, FiPlus, FiMinus, FiSend } from 'react-icons/fi';
import useSEO from '../hooks/useSEO';

export default function Contact() {
  const { showToast } = useShop();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [activeFaq, setActiveFaq] = useState(null);

  useSEO({
    title: "Contact Support & FAQs",
    description: "Get in touch with Sernaya Kids support desk. Check frequently asked questions, helpline numbers, emails, and store location in Hauz Khas."
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (loading) return;

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!nameRegex.test(form.name.trim())) {
      showToast('Please enter a valid name (2-50 characters, letters only).');
      return;
    }
    if (!emailRegex.test(form.email.trim())) {
      showToast('Please enter a valid email address.');
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      showToast('Message must be at least 10 characters long.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      showToast('Support ticket query submitted successfully!');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1200);
  };

  const handleInputChange = (e) => {
    if (loading) return;
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const FAQS = [
    {
      q: 'What makes Sernaya Kids garments special?',
      a: 'Sernaya Kids focuses on premium design, utilizing carefully selected soft fabrics that are gentle on children\'s skin, ensuring durability and style for daily adventures.'
    },
    {
      q: 'What is the standard delivery timeline?',
      a: 'We ship orders within 24-48 business hours. Major metropolitan areas across India receive packages in 3-5 working days. Other states take up to 7 working days.'
    },
    {
      q: 'Can I return an item if the size does not fit?',
      a: 'Yes, absolutely! Sernaya Kids offers a hassle-free 7 days exchange or return window. Make sure tags are intact and garments are unwashed.'
    },
    {
      q: 'Where are Sernaya Kids garments designed?',
      a: 'All our clothes are designed locally in India, supporting artisan weaving mills and guaranteeing ethical worker safety wages.'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-10 text-left"
    >
      <div className="border-b border-brand-navy/5 pb-6 mb-10">
        <h1 className="text-3xl font-black text-brand-navy mb-2">Connect With Sernaya</h1>
        <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
          Reach our dedicated support team or browse popular answers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        
        {/* Left Column: Support Form */}
        <div className="lg:col-span-7 bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[32px] shadow-sm">
          <h3 className="font-heading text-lg font-black text-brand-navy mb-6">Send A Query</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="Rahul Verma"
                  className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  placeholder="rahul@example.com"
                  className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="Size guide query, Customization request, etc."
                className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Message *</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleInputChange}
                required
                disabled={loading}
                rows="4"
                placeholder="How can we help you?"
                className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md shadow-brand-coral/15 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiSend /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>

        {/* Right Column: Details & Contact Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-bg-pink-light/40 border border-brand-navy/5 p-6 rounded-2xl space-y-4">
            <h4 className="font-heading text-xs font-bold uppercase tracking-widest text-brand-coral">Support Details</h4>
            
            <div className="flex gap-4 items-start text-xs sm:text-sm font-semibold text-brand-navy/80">
              <FiPhone className="text-brand-coral text-base mt-0.5 shrink-0" />
              <div>
                <p className="font-black">Call Helpline</p>
                <p className="text-brand-navy/60 text-xs">+91-96435 41744</p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs sm:text-sm font-semibold text-brand-navy/80">
              <FiMail className="text-brand-coral text-base mt-0.5 shrink-0" />
              <div>
                <p className="font-black">Email Support</p>
                <p className="text-brand-navy/60 text-xs">Sernayakids@gmail.com</p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs sm:text-sm font-semibold text-brand-navy/80">
              <FiMapPin className="text-brand-coral text-base mt-0.5 shrink-0" />
              <div>
                <p className="font-black">Address</p>
                <p className="text-brand-navy/60 text-xs">Hauz Khas Village, New Delhi, India</p>
              </div>
            </div>

            <div className="flex gap-4 items-start text-xs sm:text-sm font-semibold text-brand-navy/80">
              <FiClock className="text-brand-coral text-base mt-0.5 shrink-0" />
              <div>
                <p className="font-black">Working Hours</p>
                <p className="text-brand-navy/60 text-xs">Monday - Saturday (09:00 - 16:00h)</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* FAQ accordions */}
      <section className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[32px] shadow-sm">
        <h3 className="font-heading text-lg font-black text-brand-navy mb-8 text-center">Frequently Asked Questions</h3>
        <div className="max-w-2xl mx-auto space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="border-b border-brand-navy/10 pb-4">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full flex justify-between items-center text-xs sm:text-sm font-black text-brand-navy py-2 text-left hover:text-brand-coral transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <FiMinus className="text-brand-coral" /> : <FiPlus className="text-brand-coral" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs sm:text-sm text-brand-navy/70 leading-relaxed font-semibold mt-2.5">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

    </motion.div>
  );
}
