import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { FiArrowLeft } from 'react-icons/fi';

export default function Invoice() {
  const { orderId } = useParams();
  const { orders } = useShop();

  // Find the requested order
  const order = orders.find(o => String(o.id) === String(orderId));

  if (!order || order.status === 'Payment Pending' || order.status === 'Checkout Draft') {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black text-brand-navy mb-4">Invoice Not Available</h2>
        <p className="text-xs sm:text-sm text-brand-navy/60 mb-6 font-semibold max-w-xs">
          {order?.status === 'Payment Pending' || order?.status === 'Checkout Draft'
            ? 'Invoices cannot be generated for orders with pending payment.'
            : `We couldn't locate an order with the ID #${orderId} in your history.`}
        </p>
        <Link 
          to="/orders" 
          className="bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-3.5 px-8 rounded-full transition-colors inline-flex items-center gap-2"
        >
          <FiArrowLeft /> Back to Orders
        </Link>
      </div>
    );
  }

  // Calculate fields dynamically
  const items = order.items || [];
  const calculatedSubtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Try to use stored values from WooCommerce, otherwise fall back to calculation
  const shippingCost = order.shippingCost !== undefined ? Number(order.shippingCost) : 0;
  const calculatedDiscount = order.discount !== undefined ? Number(order.discount) : Math.max(0, calculatedSubtotal + shippingCost - order.total);

  return (
    <div className="min-h-screen bg-[#fdf6ef] py-10 px-4 sm:px-6 md:py-16 text-left font-sans print:bg-white print:py-0 print:px-0">
      
      {/* Navigation & Action Bar - Hidden during printing */}
      <div className="max-w-[640px] mx-auto mb-6 flex justify-start items-center print:hidden">
        <Link 
          to="/orders" 
          className="text-xs font-bold text-brand-navy/60 hover:text-brand-coral transition-colors flex items-center gap-1.5"
        >
          <FiArrowLeft /> Back to Orders
        </Link>
      </div>

      {/* Main Invoice Card */}
      <div className="max-w-[640px] mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl shadow-[#f4a28e]/15 border border-brand-navy/5 print:border-none print:shadow-none print:rounded-none">
        
        {/* Header - Gradient */}
        <div className="bg-gradient-to-r from-[#ffd6c2] to-[#ffb6a3] p-8 md:px-10 flex justify-between items-center border-b border-brand-navy/5">
          <div>
            <img 
              src="/logo.webp" 
              alt="Sernaya Kids" 
              className="h-10 md:h-12 w-auto object-contain" 
            />
          </div>
          <div className="text-right">
            <h1 className="text-xl md:text-2xl font-black text-[#5c3a2e] tracking-wider uppercase leading-none">INVOICE</h1>
            <p className="text-xs text-[#7a4a3a] font-bold mt-1.5">#{order.id}</p>
          </div>
        </div>

        {/* Billing Info block */}
        <div className="p-8 md:px-10 pb-0 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Left Column: Billed To */}
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#e8806a] block mb-2">Billed To</span>
            <p className="text-sm font-black text-[#3f2d27]">{order.shippingDetails?.name || 'Customer'}</p>
            <div className="text-xs text-[#7a6a63] mt-1.5 space-y-1 leading-relaxed">
              <p>
                {order.shippingDetails?.address ? (
                  `${order.shippingDetails.address}, ${order.shippingDetails.city} - ${order.shippingDetails.pin}`
                ) : (
                  'Standard Shipping Address'
                )}
              </p>
              {order.shippingDetails?.phone && (
                <p className="mt-2.5">📞 {order.shippingDetails.phone}</p>
              )}
              {order.shippingDetails?.email && (
                <p>✉️ {order.shippingDetails.email}</p>
              )}
            </div>
          </div>

          {/* Right Column: Meta Info */}
          <div className="sm:text-right flex flex-col justify-between sm:items-end">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8897e] block sm:mb-1">Invoice Date</span>
                <span className="text-xs font-bold text-[#3f2d27]">{order.date}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#a8897e] block sm:mb-1">Payment Method</span>
                <span className="text-xs font-bold text-[#3f2d27]">UPI, Cards, NetBanking</span>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-0">
              <span className="inline-block bg-[#e6f7ea] text-[#2f9e50] text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
                Payment Received
              </span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="p-8 md:px-10 pb-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#fff4ec]">
                  <th className="text-left py-3 px-4 text-[10px] font-bold text-[#e8806a] uppercase tracking-wider rounded-l-xl">Item</th>
                  <th className="text-center py-3 px-4 text-[10px] font-bold text-[#e8806a] uppercase tracking-wider">Qty</th>
                  <th className="text-right py-3 px-4 text-[10px] font-bold text-[#e8806a] uppercase tracking-wider">Price</th>
                  <th className="text-right py-3 px-4 text-[10px] font-bold text-[#e8806a] uppercase tracking-wider rounded-r-xl">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ffe3d4]">
                {items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-bg-cream/20 transition-colors">
                    <td className="py-4 px-4 text-xs font-bold text-[#3f2d27] max-w-[200px]">
                      <p className="truncate font-black">{item.name}</p>
                      {item.color && (
                        <span className="text-[9px] text-[#7a6a63]/70 font-semibold block mt-0.5 uppercase">Color: {item.color} | Size: {item.size}</span>
                      )}
                    </td>
                    <td className="text-center py-4 px-4 text-xs text-[#7a6a63] font-bold">{item.quantity}</td>
                    <td className="text-right py-4 px-4 text-xs text-[#7a6a63] font-bold">₹{item.price.toFixed(2)}</td>
                    <td className="text-right py-4 px-4 text-xs font-black text-[#3f2d27]">₹{(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className="p-8 md:px-10 pb-0 flex flex-col items-end">
          <div className="w-full sm:max-w-[280px] space-y-3">
            <div className="flex justify-between text-xs text-[#7a6a63] font-semibold">
              <span>Subtotal</span>
              <span className="text-[#3f2d27] font-bold">₹{calculatedSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-[#7a6a63] font-semibold">
              <span>Shipping</span>
              <span className="text-[#3f2d27] font-bold">
                {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : '₹0.00'}
              </span>
            </div>
            {calculatedDiscount > 0 && (
              <div className="flex justify-between text-xs text-[#7a6a63] font-semibold text-green-600">
                <span>Discount</span>
                <span className="font-bold">-₹{calculatedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-dashed border-[#ffc7ae]">
              <span className="text-sm font-black text-[#3f2d27] uppercase">Total</span>
              <span className="text-lg font-black text-[#e8806a]">₹{order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="px-8 md:px-10 mt-8">
          <hr className="border-none border-t border-[#ffe3d4] m-0" />
        </div>

        {/* Footer info */}
        <div className="p-8 md:px-10 pb-10 text-center">
          <p className="text-xs font-black text-[#3f2d27]">Thank you for shopping with Sernaya Kids!</p>
          <p className="text-[11px] text-[#a8897e] mt-1.5 leading-relaxed">
            Questions about this bill? Call <strong className="text-[#e8806a]">+91-96435 41744</strong> or email <strong className="text-[#e8806a]">sernayakids@gmail.com</strong>
          </p>
          <p className="text-[10px] text-[#c2ab9f] mt-4 font-semibold uppercase tracking-wider">
            © 2026 Sernaya Kids. All rights reserved.
          </p>
        </div>

      </div>
    </div>
  );
}
