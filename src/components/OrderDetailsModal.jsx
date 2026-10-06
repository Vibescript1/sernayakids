import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShoppingBag, FiTruck, FiMapPin, FiPhone, FiCheckCircle, FiInfo } from 'react-icons/fi';

export default function OrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-brand-navy/40 backdrop-blur-sm pointer-events-auto"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-xl bg-white border border-brand-navy/5 rounded-[40px] p-6 sm:p-8 relative shadow-2xl z-10 max-h-[85vh] overflow-y-auto text-left print:p-0 print:border-0 print:shadow-none"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-brand-navy/50 hover:text-brand-coral hover:bg-bg-cream p-2 rounded-full transition-colors cursor-pointer print:hidden"
            aria-label="Close modal"
          >
            <FiX className="text-lg" />
          </button>

          {/* Modal Header */}
          <div className="mb-6 border-b border-brand-navy/5 pb-5 pr-10">
            <span className={`text-[10px] uppercase font-black py-1 px-3 rounded-full mb-3 inline-block ${
              order.status === 'Delivered' || order.status === 'Completed'
                ? 'bg-green-50 text-green-700 border border-green-200/50' 
                : 'bg-amber-50 text-amber-700 border border-amber-200/50'
            }`}>
              {order.status}
            </span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-brand-navy">
              Invoice #{order.id}
            </h3>
            <p className="text-xs text-brand-navy/45 font-bold mt-1">Placed on: {order.date}</p>
          </div>

          <div className="space-y-6">
            
            {/* Delivery address details card */}
            <div className="bg-bg-cream/40 border border-brand-navy/5 rounded-2xl p-4 sm:p-5">
              <h4 className="text-[10px] font-black uppercase text-brand-navy/45 tracking-widest mb-3 flex items-center gap-1.5">
                <FiMapPin className="text-brand-coral" /> Delivery Destination
              </h4>
              <div className="text-xs sm:text-sm font-semibold text-brand-navy/80 space-y-1">
                <p className="font-black text-brand-navy">{order.shippingDetails?.name || 'Customer'}</p>
                <p className="text-xs text-brand-navy/60">{order.shippingDetails?.phone || 'No phone'}</p>
                <p className="text-xs text-brand-navy/60">{order.shippingDetails?.email || ''}</p>
                <p className="text-xs sm:text-sm text-brand-navy/80 mt-2 border-t border-brand-navy/5 pt-2 leading-relaxed">
                  {order.shippingDetails?.address ? (
                    `${order.shippingDetails.address}, ${order.shippingDetails.city} - ${order.shippingDetails.pin}`
                  ) : (
                    'Standard Shipping Address'
                  )}
                </p>
              </div>
            </div>

            {/* Items List */}
            <div>
              <h4 className="text-[10px] font-black uppercase text-brand-navy/45 tracking-widest mb-3 flex items-center gap-1.5">
                <FiShoppingBag className="text-brand-coral" /> Order Summary
              </h4>
              <div className="divide-y divide-brand-navy/5 border border-brand-navy/5 rounded-2xl bg-bg-cream/10 p-4 sm:p-5">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-3.5 first:pt-0 last:pb-0 gap-4">
                    <div className="flex gap-4">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-12 h-16 bg-white border border-brand-navy/5 rounded-lg object-cover shrink-0" />
                      )}
                      <div className="flex flex-col justify-center text-xs font-semibold text-brand-navy/80">
                        <p className="font-black text-brand-navy">{item.name}</p>
                        <p className="text-[10px] text-brand-navy/50 font-bold mt-1 uppercase tracking-wider">
                          {item.color && `Color: ${item.color} | `}{item.size && `Size: ${item.size} | `}Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-black text-brand-navy flex items-center text-xs sm:text-sm">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Billing Receipt breakdown */}
            {(() => {
              const itemsList = order.items || [];
              const calculatedSubtotal = itemsList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const shippingCost = order.shippingCost !== undefined ? Number(order.shippingCost) : 0;
              const discount = order.discount !== undefined ? Number(order.discount) : Math.max(0, calculatedSubtotal + shippingCost - order.total);

              return (
                <div className="bg-bg-cream/40 border border-brand-navy/5 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm font-semibold text-brand-navy/80 space-y-2.5">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-bold text-brand-navy">₹{calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping Cost:</span>
                    <span className="font-bold text-brand-navy">
                      {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-700">
                      <span>Discount:</span>
                      <span className="font-bold">-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-brand-navy/5 pt-3 font-black text-brand-navy text-base">
                    <span className="flex items-center gap-1">Total Paid:</span>
                    <span className="text-brand-coral">₹{order.total.toFixed(2)}</span>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Action Footer Buttons */}
          <div className="mt-8 flex gap-3">
            <Link
              to="/shop"
              onClick={onClose}
              className="flex-1 bg-bg-cream hover:bg-brand-navy hover:text-white text-brand-navy text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors border border-brand-navy/5 text-center"
            >
              <FiShoppingBag /> Shop More
            </Link>
            <button
              onClick={onClose}
              className="flex-1 bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md shadow-brand-coral/15"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
