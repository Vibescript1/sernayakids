import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FiLock, FiFolder, FiActivity, FiUsers, FiShield, 
  FiDisc, FiUserCheck, FiRefreshCw, FiArrowRight 
} from 'react-icons/fi';

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('collect');

  const SECTIONS = [
    { id: 'intro', label: 'Overview', icon: <FiLock /> },
    { id: 'collect', label: 'Information We Collect', icon: <FiFolder /> },
    { id: 'use', label: 'Use of Information', icon: <FiActivity /> },
    { id: 'share', label: 'Sharing of Information', icon: <FiUsers /> },
    { id: 'security', label: 'Data Security', icon: <FiShield /> },
    { id: 'cookies', label: 'Cookies & Browsing', icon: <FiDisc /> },
    { id: 'responsibility', label: 'Customer Responsibility', icon: <FiUserCheck /> },
    { id: 'returns', label: 'Returns & Refunds', icon: <FiRefreshCw /> },
  ];

  const handleScroll = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-12 text-left min-h-screen"
    >
      {/* Page Header */}
      <div className="border-b border-brand-navy/5 pb-8 mb-12 bg-white/40 p-8 rounded-[32px] backdrop-blur-sm border border-white">
        <span className="text-xs font-extrabold text-brand-coral uppercase tracking-widest bg-brand-coral/10 py-1.5 px-4 rounded-full inline-block mb-4 animate-pulse">
          Legal & Safety
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-brand-navy leading-none mb-3">Privacy Policy</h1>
        <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold max-w-xl">
          At Sernaya Kids, we value your privacy and are committed to protecting your personal details. Learn how your data is collected, processed, and safeguarded.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Sticky Left Sidebar Navigation */}
        <aside className="hidden lg:block lg:col-span-4 sticky top-24 bg-white border border-brand-navy/5 p-6 rounded-[28px] shadow-sm">
          <h3 className="font-heading text-xs font-bold text-brand-navy/50 uppercase tracking-widest mb-6 px-3">Table of Contents</h3>
          <div className="flex flex-col gap-2.5">
            {SECTIONS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => handleScroll(sec.id)}
                className={`flex items-center gap-3.5 w-full text-left py-3 px-4 rounded-2xl text-xs font-extrabold tracking-wider transition-all cursor-pointer ${activeSection === sec.id ? 'bg-brand-navy text-white shadow-md' : 'text-brand-navy/70 hover:bg-bg-pink-light/45 hover:text-brand-coral'}`}
              >
                <span className="text-base shrink-0">{sec.icon}</span>
                <span className="truncate">{sec.label}</span>
                {activeSection === sec.id && <FiArrowRight className="ml-auto text-[10px] animate-pulse" />}
              </button>
            ))}
          </div>
        </aside>

        {/* Policy Content Sections */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Overview */}
          <motion.div 
            id="intro"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-brand-coral">
              <div className="w-10 h-10 rounded-full bg-brand-coral/10 flex items-center justify-center text-lg shrink-0">
                <FiLock />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Overview</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              This Privacy Policy explains how your data is collected, used, and safeguarded when you visit or make a purchase from our website, <a href="https://sernayakids.com/" target="_blank" rel="noreferrer" className="text-brand-coral hover:underline font-black">https://sernayakids.com/</a>. We follow strict international GOTS safety frameworks to protect our user base.
            </p>
          </motion.div>

          {/* Info Collect */}
          <motion.div 
            id="collect"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-brand-pink">
              <div className="w-10 h-10 rounded-full bg-brand-pink/10 flex items-center justify-center text-lg shrink-0">
                <FiFolder />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Information We Collect</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              When you interact with our website, we may collect personal details such as your name, contact number, email address, and shipping or billing address. Payment-related information is processed securely through trusted third-party payment gateways, and we do not store your card or banking details on our servers.
            </p>
          </motion.div>

          {/* Use Info */}
          <motion.div 
            id="use"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-brand-blue">
              <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center text-lg shrink-0">
                <FiActivity />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Use of Information</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              The information collected is used to process your orders, manage deliveries, and provide timely updates regarding your purchase. It also helps us improve our website, enhance customer experience, and offer better services. In some cases, we may use your contact details to share important updates or promotional communication.
            </p>
          </motion.div>

          {/* Share Info */}
          <motion.div 
            id="share"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-brand-lavender">
              <div className="w-10 h-10 rounded-full bg-brand-lavender/10 flex items-center justify-center text-lg shrink-0">
                <FiUsers />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Sharing of Information</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              Sernaya Kids does not sell, rent, or trade your personal information to third parties. Your data is only shared with reliable service providers such as logistics partners and payment gateways, strictly for the purpose of order processing and delivery.
            </p>
          </motion.div>

          {/* Security */}
          <motion.div 
            id="security"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-green-600">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-lg shrink-0">
                <FiShield />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Data Security</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              We take appropriate measures to ensure that your personal information remains secure. All transactions are handled through secure systems, and we follow standard practices to protect your data from unauthorized access or misuse.
            </p>
          </motion.div>

          {/* Cookies */}
          <motion.div 
            id="cookies"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-amber-500">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-lg shrink-0">
                <FiDisc />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Cookies</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              Our website may use cookies to improve functionality and enhance your browsing experience. These cookies help us understand user behavior and optimize website performance. You may choose to disable cookies through your browser settings if preferred.
            </p>
          </motion.div>

          {/* Customer Responsibility */}
          <motion.div 
            id="responsibility"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-cyan-600">
              <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-lg shrink-0">
                <FiUserCheck />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Customer Responsibility</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              Customers are requested to provide accurate and complete information while placing an order. Sernaya Kids will not be responsible for any issues arising due to incorrect details such as wrong address, contact number, or incorrect size selection.
            </p>
          </motion.div>

          {/* Returns & Exchange */}
          <motion.div 
            id="returns"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-pink-light/35 border border-brand-coral/15 p-6 sm:p-8 rounded-[28px] shadow-sm hover:border-brand-coral/30 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-4 text-brand-coral">
              <div className="w-10 h-10 rounded-full bg-brand-coral/10 flex items-center justify-center text-lg shrink-0">
                <FiRefreshCw />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-brand-navy">Returns, Exchanges & Refunds</h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-navy/75 leading-relaxed font-semibold">
              Sernaya Kids follows a strict policy regarding returns and exchanges. <strong>Returns are not accepted</strong>. Exchanges are only applicable in case of defective products, and a proper unboxing video is required as proof. Size exchange is available with an additional charge. <strong>Refunds are not provided under any circumstances</strong>. Customers are advised to review all policies carefully before placing an order.
            </p>
          </motion.div>

        </section>

      </div>
    </motion.div>
  );
}
