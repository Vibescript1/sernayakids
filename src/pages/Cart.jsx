import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingBag, FiTrash2, FiPlus, FiMinus, FiArrowRight,
  FiGift, FiCheckCircle, FiChevronRight, FiCreditCard, FiTruck, FiEdit,
  FiAlertTriangle
} from 'react-icons/fi';
import axios from 'axios';
import { stripHtml } from '../utils/sanitize';
import { fbqTrack } from '../utils/pixel';
import { getAuthToken } from '../apollo';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart, updateQty, removeFromCart, cartSubtotal, discountAmount,
    discountedSubtotal, isFreeShipping, shippingCost, cartTotal,
    handleApplyCoupon, handleRemoveCoupon, couponCode, appliedDiscount, shippingThreshold, clearCart, showToast,
    createWooCommerceOrder, user, updateProfile, syncCouponFromServer, syncCartFromBackend, PRODUCTS,
    fetchUserOrders
  } = useShop();

  const [couponInput, setCouponInput] = useState('');
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart', 'shipping', 'complete'
  const [placedOrderId, setPlacedOrderId] = useState('');
  const [failedPaymentOrderId, setFailedPaymentOrderId] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(true);

  useEffect(() => {
    if (checkoutStep === 'payment-failed') {
      const timer = setTimeout(() => {
        clearCart();
        navigate('/orders');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [checkoutStep, navigate, clearCart]);
  const [shippingRateSelected, setShippingRateSelected] = useState(false);
  const [availableRates, setAvailableRates] = useState([]);
  const [shippingDetails, setShippingDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    pin: '',
    state: 'DL',
    payment: 'card'
  });

  useEffect(() => {
    if (!shippingRateSelected && availableRates.length > 0) {
      const selectRate = async () => {
        try {
          const firstRate = availableRates[0];
          await createWooCommerceOrder.selectRate(firstRate.rate_id);
          setShippingRateSelected(true);
        } catch (err) {
          console.error("Failed to auto-select shipping rate", err);
        }
      };
      selectRate();
    }
  }, [availableRates, shippingRateSelected, createWooCommerceOrder]);

  // H-4 fix: Lazily load the Razorpay checkout script only when the user initiates a card payment.
  // This avoids loading ~90KB for every cart visitor (especially COD users) and removes the
  // unconditional eager load. The script is cached by the browser after the first load.
  const loadRazorpayScript = useCallback(() => new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return; } // already loaded
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.crossOrigin = 'anonymous';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Razorpay payment script. Please check your connection.'));
    document.body.appendChild(script);
  }), []);

  // Fetch existing coupons/cart on component mount
  useEffect(() => {
    const fetchCartCoupons = async () => {
      try {
        await syncCartFromBackend();
        if (couponCode) {
          setCouponInput(couponCode);
        }
      } catch (err) {
        console.warn('Failed to fetch cart coupons', err);
      }
    };
    fetchCartCoupons();
  }, [syncCartFromBackend, couponCode]);


  // Guard checkout steps and pre-populate fields when logged-in session is active
  useEffect(() => {
    if (!user && checkoutStep === 'shipping') {
      setCheckoutStep('cart');
    }
    if (user) {
      setShippingDetails(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        address: user.address || prev.address,
        city: user.city || prev.city,
        pin: user.pin || prev.pin,
        state: user.state || prev.state || 'DL'
      }));
      // Set to read-only mode if they already have an address saved
      if (user.address && user.city && user.pin) {
        setIsEditingAddress(false);
      } else {
        setIsEditingAddress(true);
      }
    }
  }, [user, checkoutStep]);

  useEffect(() => {
    if (checkoutStep === 'cart') {
      setShippingRateSelected(false);
    }
  }, [checkoutStep]);

  // Track InitiateCheckout on Meta Pixel when checkoutStep changes to shipping
  useEffect(() => {
    if (checkoutStep === 'shipping' && cart && cart.length > 0) {
      fbqTrack('InitiateCheckout', {
        content_ids: cart.map(item => item.id),
        content_type: 'product',
        num_items: cart.reduce((acc, item) => acc + item.quantity, 0),
        value: cartTotal || 0,
        currency: 'INR',
      });
    }
  }, [checkoutStep, cart, cartTotal]);

  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (isSubmittingOrder) return;
    const couponRegex = /^[a-zA-Z0-9]{3,15}$/;
    if (!couponRegex.test(couponInput.trim())) {
      showToast('Please enter a valid coupon code (3-15 alphanumeric characters).');
      return;
    }
    handleApplyCoupon(couponInput.trim().toUpperCase());
  };

  const handleInputChange = (e) => {
    if (isSubmittingOrder) return;
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (isSubmittingOrder) return;

    const nameRegex = /^[A-Za-z0-9\s._-]{2,50}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;
    const cityRegex = /^[A-Za-z\s]{2,50}$/;
    const pinRegex = /^[1-9]\d{5}$/;

    if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address) {
      showToast('Please fill in all required shipping fields.');
      return;
    }

    if (!nameRegex.test(shippingDetails.name.trim())) {
      showToast('Please enter a valid recipient name (2-50 characters, letters, numbers, spaces, dots, dashes, underscores only).');
      return;
    }
    if (!emailRegex.test(shippingDetails.email.trim())) {
      showToast('Please enter a valid email address.');
      return;
    }
    if (!phoneRegex.test(shippingDetails.phone.trim())) {
      showToast('Please enter a valid Indian contact phone number.');
      return;
    }
    if (!cityRegex.test(shippingDetails.city.trim())) {
      showToast('Please enter a valid city name.');
      return;
    }
    if (!pinRegex.test(shippingDetails.pin.trim())) {
      showToast('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setIsSubmittingOrder(true);
    showToast('Processing order details...');

    // Save/update user's address if details changed
    if (user) {
      const addressChanged =
        shippingDetails.phone !== user.phone ||
        shippingDetails.address !== user.address ||
        shippingDetails.city !== user.city ||
        shippingDetails.pin !== user.pin ||
        shippingDetails.state !== user.state;

      if (addressChanged) {
        try {
          await updateProfile({
            phone: shippingDetails.phone,
            address: shippingDetails.address,
            city: shippingDetails.city,
            pin: shippingDetails.pin,
            state: shippingDetails.state
          });
        } catch (err) {
          console.warn('Failed to update address in profile during checkout', err);
        }
      }
    }

    // Strip HTML from all shipping fields before any API call
    const safeShipping = {
      name: stripHtml(shippingDetails.name),
      email: stripHtml(shippingDetails.email),
      phone: stripHtml(shippingDetails.phone),
      address: stripHtml(shippingDetails.address),
      city: stripHtml(shippingDetails.city),
      pin: stripHtml(shippingDetails.pin),
      state: stripHtml(shippingDetails.state),
      payment: shippingDetails.payment, // enum from <select>, no sanitization needed
    };

    try {

      if (shippingDetails.payment === 'card') {
        // Validate that the Razorpay key is configured
        const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
        if (!rzpKey) {
          showToast('Payment gateway is not configured. Please contact support.');
          setIsSubmittingOrder(false);
          return;
        }

        // H-4 fix: Lazy-load Razorpay script only now (not on page mount)
        try {
          await loadRazorpayScript();
        } catch {
          showToast('Payment system could not be loaded. Please check your internet connection.');
          setIsSubmittingOrder(false);
          return;
        }

        showToast('Initializing order...');

        // 1. Create WooCommerce order first
        let orderId = '';
        try {
          orderId = await createWooCommerceOrder(safeShipping, cart, cartTotal, {});
        } catch (err) {
          console.error("WooCommerce order creation failed:", err);
          showToast(err.message || 'Could not create order. Please check stock and try again.');
          setIsSubmittingOrder(false);
          return;
        }

        const numericOrderId = orderId.replace('SK-', '');

        // 2. Request a server-side Razorpay order
        let rzpOrderId = '';
        let paymentAmountPaise = Math.round(cartTotal * 100); // fallback if parsing fails

        try {
          if (!paymentAmountPaise || isNaN(paymentAmountPaise) || paymentAmountPaise <= 0) {
            paymentAmountPaise = Math.round((cartTotal || 0) * 100);
          }

          if (paymentAmountPaise <= 0) {
            throw new Error("Cart total is zero. Cannot initialize payment.");
          }

          console.log("paymentAmountPaise", paymentAmountPaise, "cartTotal", cartTotal);

          // Request a server-side Razorpay order
          const jwtToken = getAuthToken();
          const authHeaders = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};

          const orderRes = await axios.post(`/wp-json/sernaya/v1/create-razorpay-order?amount=${paymentAmountPaise}`, {
            amount: paymentAmountPaise
          }, {
            headers: {
              ...authHeaders
            },
            withCredentials: true
          });

          rzpOrderId = orderRes.data.id;
          paymentAmountPaise = orderRes.data.amount;

        } catch (error) {
          console.error("Razorpay order creation failed:", error);
          showToast('Could not initialize payment with server. Please try again.');
          setIsSubmittingOrder(false);
          return;
        }

        const options = {
          key: rzpKey,
          amount: paymentAmountPaise,
          currency: 'INR',
          order_id: rzpOrderId, // Anchor the payment to the server-side order

          name: 'Sernaya Kids',
          description: `Order #${orderId}`,
          image: '/logo.webp',
          handler: async function (response) {
            showToast('Payment received! Finalizing order...');
            const jwtToken = getAuthToken();
            const authHeaders = jwtToken ? { 'Authorization': `Bearer ${jwtToken}` } : {};
            try {
              // Update status and verify payment on the server
              await axios.post('/wp-json/sernaya/v1/complete-payment', {
                orderId: numericOrderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id || '',
                razorpay_signature: response.razorpay_signature || '',
              }, {
                headers: {
                  'Content-Type': 'application/json',
                  ...authHeaders
                },
                withCredentials: true
              });

              // Send notification to admin when payment succeeds and order status is updated to processing
              try {
                await axios.post('/wp-json/sernaya/v1/notify-admin-order', {
                  orderId: numericOrderId
                }, {
                  headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                  },
                  withCredentials: true
                });
              } catch (emailErr) {
                console.warn('Failed to trigger admin email notification for card payment:', emailErr.message);
              }

              // Track Purchase on Meta Pixel
              fbqTrack('Purchase', {
                content_ids: cart.map(item => item.id),
                content_type: 'product',
                value: cartTotal || 0,
                currency: 'INR',
                num_items: cart.reduce((acc, item) => acc + item.quantity, 0),
                order_id: orderId,
              });

              setPlacedOrderId(orderId);
              setCheckoutStep('complete');
              clearCart();
              try {
                await fetchUserOrders();
              } catch (fetchErr) {
                console.error("Failed to fetch user orders:", fetchErr);
              }
              navigate('/orders');
            } catch (err) {
              // Payment succeeded but status update failed.
              // Show the payment ID so the customer can reach support.
              showToast(
                `Payment captured (ID: ${response.razorpay_payment_id}) but status update failed. ` +
                `Please contact support@sernayakids.com with this payment ID.`
              );
              setIsSubmittingOrder(false);
            }
          },
          prefill: {
            name: safeShipping.name,
            email: safeShipping.email,
            contact: safeShipping.phone,
          },
          theme: { color: '#e87a5d' },
          modal: {
            ondismiss: function () {
              showToast('Payment cancelled. Retrying payment can be done from Order History.');
              setFailedPaymentOrderId(orderId);
              setCheckoutStep('payment-failed');
              setIsSubmittingOrder(false);
            }
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        const orderId = await createWooCommerceOrder(safeShipping, cart, cartTotal);
        // Track Purchase on Meta Pixel
        fbqTrack('Purchase', {
          content_ids: cart.map(item => item.id),
          content_type: 'product',
          value: cartTotal || 0,
          currency: 'INR',
          num_items: cart.reduce((acc, item) => acc + item.quantity, 0),
          order_id: orderId,
        });

        setPlacedOrderId(orderId);
        setCheckoutStep('complete');
        clearCart();
        navigate('/orders');
      }
    } catch (err) {
      showToast('Unable to place your order. Please try again or contact support.');
      setIsSubmittingOrder(false);
    }
  };

  const thresholdRemaining = shippingThreshold - cartSubtotal;

  if (checkoutStep === 'payment-failed') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[1260px] mx-auto px-6 py-20 text-center"
      >
        <div className="bg-white border border-brand-navy/5 p-8 md:p-16 rounded-[40px] max-w-xl mx-auto shadow-lg text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-brand-coral text-4xl mx-auto mb-8 animate-bounce">
            <FiAlertTriangle />
          </div>
          <h2 className="text-3xl font-black text-brand-navy mb-4">Payment Not Completed</h2>
          <p className="text-sm text-brand-navy/60 font-semibold mb-8 max-w-sm mx-auto leading-relaxed">
            The payment process was closed or cancelled. Your order has been registered as <strong>#{failedPaymentOrderId}</strong> with a status of <strong>Pending Payment</strong>. Retrying payment can be done directly from your profile's Order History.
          </p>
          <p className="text-xs text-brand-navy/40 font-bold mb-8">
            Redirecting to your orders list in a few seconds...
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                clearCart();
                navigate('/orders');
              }}
              className="inline-flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md transition-all cursor-pointer"
            >
              Go to Orders <FiShoppingBag />
            </button>
            <Link to="/" className="inline-flex items-center justify-center gap-2 bg-bg-cream hover:bg-bg-cream/80 text-brand-navy text-xs font-bold py-3.5 px-8 rounded-full border border-brand-navy/5 transition-all">
              Back to Home <FiArrowRight />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  if (checkoutStep === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-[1260px] mx-auto px-6 py-20 text-center"
      >
        <div className="bg-white border border-brand-navy/5 p-8 md:p-16 rounded-[40px] max-w-xl mx-auto shadow-lg text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-4xl mx-auto mb-8 animate-bounce">
            <FiCheckCircle />
          </div>
          <h2 className="text-3xl font-black text-brand-navy mb-4">Order Placed Successfully!</h2>
          <p className="text-sm text-brand-navy/60 font-semibold mb-8 max-w-sm mx-auto leading-relaxed">
            Thank you for shopping with Sernaya Kids! Your order has been registered under <strong>#{placedOrderId}</strong>. We will dispatch details to your phone shortly.
          </p>
          <div className="bg-bg-cream rounded-2xl p-6 text-left text-xs font-semibold text-brand-navy/80 mb-8 border border-brand-navy/5">
            <h4 className="font-black text-sm text-brand-navy mb-3 uppercase tracking-wider">Delivery Destination</h4>
            <p className="mb-1"><strong>Name:</strong> {shippingDetails.name}</p>
            <p className="mb-1"><strong>Contact:</strong> {shippingDetails.phone}</p>
            <p className="mb-1"><strong>Address:</strong> {shippingDetails.address}, {shippingDetails.city} - {shippingDetails.pin}</p>
            <p><strong>Method:</strong> {shippingDetails.payment === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid Digital Card'}</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md shadow-brand-coral/15 transition-all">
            Continue Shopping <FiArrowRight />
          </Link>
        </div>
      </motion.div>
    );
  }

  if (isSubmittingOrder) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-[1260px] mx-auto px-6 py-20 text-center min-h-[60vh] flex items-center justify-center"
      >
        <div className="bg-white border border-brand-navy/5 p-8 md:p-16 rounded-[40px] max-w-xl mx-auto shadow-lg text-center space-y-6">
          <div className="w-16 h-16 border-4 border-brand-coral border-t-transparent rounded-full animate-spin mx-auto"></div>
          <h2 className="text-2xl font-black text-brand-navy">Processing Your Order</h2>
          <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold max-w-sm mx-auto leading-relaxed">
            Please wait while we set up the secure payment gateway. Do not refresh this page or close the window.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-10 text-left"
    >
      <div className="border-b border-brand-navy/5 pb-6 mb-8">
        <h1 className="text-3xl font-black text-brand-navy mb-2 flex items-center gap-2">
          <FiShoppingBag className="text-brand-coral" /> Shopping Bag
        </h1>
        <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
          {checkoutStep === 'cart' ? 'Review items in your cart before checkout.' : 'Specify delivery address and select payment type.'}
        </p>
      </div>

      {cart.length === 0 && checkoutStep !== 'complete' ? (
        <div className="text-center py-20 bg-white border border-brand-navy/5 rounded-[32px] max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-bg-blue-light rounded-full flex items-center justify-center text-brand-navy text-2xl mx-auto mb-6">
            <FiShoppingBag />
          </div>
          <h2 className="text-xl font-black text-brand-navy mb-3">Your Shopping Bag is Empty</h2>
          <p className="text-xs sm:text-sm text-brand-navy/50 font-semibold mb-8 max-w-xs mx-auto">
            You haven't added any outfits to your bag yet. Let's find something cute!
          </p>
          <Link to="/shop" className="inline-flex items-center gap-2 bg-brand-navy hover:bg-black text-white text-xs font-bold py-3.5 px-8 rounded-full shadow-md transition-all">
            Browse Shop <FiArrowRight />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left panel */}
          <div className="lg:col-span-8 space-y-6">

            {/* Step 1: Cart Items review */}
            {checkoutStep === 'cart' && (
              <div className="space-y-4">
                {/* Shipping alert */}
                {thresholdRemaining > 0 ? (
                  <div className="bg-bg-coral-light border border-brand-coral/10 p-4 rounded-2xl flex items-center justify-between text-xs font-semibold text-brand-navy/80">
                    <span className="flex items-center gap-2"><FiTruck className="text-brand-coral" /> Spend <strong>Rs. {thresholdRemaining}</strong> more for <strong>FREE Shipping</strong>!</span>
                    <Link to="/shop" className="text-brand-coral hover:underline">Add items</Link>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold text-green-700">
                    <FiCheckCircle /> <span>Congratulations! Your order qualifies for <strong>FREE Delivery</strong>.</span>
                  </div>
                )}

                {/* Cart Table List */}
                <div className="bg-white border border-brand-navy/5 rounded-[24px] overflow-hidden p-6 divide-y divide-brand-navy/5">
                  {cart.map((item, idx) => (
                    <div key={`${item.id}-${item.color}-${item.size}`} className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 ${idx === 0 ? 'pt-0' : ''} ${idx === cart.length - 1 ? 'pb-0' : ''}`}>
                      <div className="flex items-center gap-4">
                        <img src={item.img} alt={item.name} className="w-16 h-16 rounded-2xl object-cover shrink-0" />
                        <div className="text-left">
                          <h4 className="text-xs sm:text-sm font-black text-brand-navy hover:text-brand-coral transition-colors">
                            <Link to={`/product/${item.id}`}>{item.name}</Link>
                          </h4>
                          <div className="flex gap-4 text-[10px] text-brand-navy/55 font-bold uppercase mt-1">
                            <span>Color: <strong>{item.color}</strong></span>
                            <span>Size: <strong>{item.size}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Selector & Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        <div className="flex items-center justify-between border border-brand-navy/15 rounded-full p-1 w-24 bg-bg-cream">
                          <button onClick={() => updateQty(item.id, item.color, item.size, -1)} className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-brand-navy/60 hover:text-brand-coral cursor-pointer"><FiMinus className="text-[10px]" /></button>
                          <span className="text-[11px] font-extrabold text-brand-navy">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, item.color, item.size, 1)} className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-brand-navy/60 hover:text-brand-coral cursor-pointer"><FiPlus className="text-[10px]" /></button>
                        </div>

                        {(() => {
                          const productObj = PRODUCTS?.find(p =>
                            String(p.id) === String(item.id) ||
                            (parseInt(p.id, 10) === parseInt(item.id, 10) && !isNaN(parseInt(p.id, 10)))
                          );
                          const isTwentyPercentOff = productObj ? productObj.isTwentyPercentOff : item.isTwentyPercentOff;
                          const isSale20 = couponCode && couponCode.toUpperCase() === 'SALE20';
                          const hasDiscount = appliedDiscount > 0 && (isSale20 ? isTwentyPercentOff : true);

                          if (hasDiscount) {
                            const discountedTotal = Math.round(item.price * item.quantity * (1 - appliedDiscount));
                            return (
                              <div className="flex flex-col items-end w-20 text-right shrink-0">
                                <span className="text-[10px] text-brand-navy/35 font-extrabold line-through">Rs. {item.price * item.quantity}</span>
                                <span className="text-sm font-black text-[#2f9e50]">Rs. {discountedTotal}</span>
                              </div>
                            );
                          }
                          return (
                            <span className="text-sm font-black text-brand-navy w-20 text-right">Rs. {item.price * item.quantity}</span>
                          );
                        })()}

                        <button onClick={() => removeFromCart(item.id, item.color, item.size)} className="text-brand-navy/40 hover:text-brand-coral cursor-pointer" aria-label="Delete item">
                          <FiTrash2 className="text-base" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Shipping Form */}
            {checkoutStep === 'shipping' && (
              <form onSubmit={handlePlaceOrder} className="bg-white border border-brand-navy/5 rounded-[24px] p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-brand-navy/5 pb-4">
                  <h3 className="font-heading text-base font-black text-brand-navy">Shipping Details</h3>
                  <button type="button" onClick={() => setCheckoutStep('cart')} className="text-[10px] uppercase font-black text-brand-coral hover:underline">Back to Cart</button>
                </div>

                {!isEditingAddress ? (
                  <div className="space-y-4 text-left">
                    <div className="bg-bg-cream/50 border border-brand-navy/5 rounded-2xl p-5 space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-brand-navy/50 uppercase tracking-wider">Deliver To</p>
                          <p className="text-base font-black text-brand-navy mt-1">{shippingDetails.name}</p>
                          <p className="text-xs text-brand-navy/60 font-semibold mt-0.5">{shippingDetails.phone} | {shippingDetails.email}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingAddress(true)}
                          className="text-xs font-bold text-brand-coral hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <FiEdit className="text-[10px]" /> Edit Address
                        </button>
                      </div>
                      <div className="border-t border-brand-navy/5 pt-3">
                        <p className="text-xs font-bold text-brand-navy/50 uppercase tracking-wider">Address Details</p>
                        <p className="text-xs sm:text-sm font-semibold text-brand-navy/80 mt-1 leading-relaxed">
                          {shippingDetails.address}, {shippingDetails.city} - {shippingDetails.pin}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col text-left">
                        <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Recipient Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={shippingDetails.name}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmittingOrder}
                          placeholder="Sarah Smith"
                          className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={shippingDetails.email}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmittingOrder}
                          placeholder="sarah@example.com"
                          className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Contact Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={shippingDetails.phone}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmittingOrder}
                          placeholder="+91-9876543210"
                          className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col text-left">
                      <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Street Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingDetails.address}
                        onChange={handleInputChange}
                        required
                        disabled={isSubmittingOrder}
                        placeholder="Apt, Suite, Street Address, Locality"
                        className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex flex-col text-left">
                        <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">City *</label>
                        <input
                          type="text"
                          name="city"
                          value={shippingDetails.city}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmittingOrder}
                          placeholder="New Delhi"
                          className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">State / Region *</label>
                        <select
                          name="state"
                          value={shippingDetails.state}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmittingOrder}
                          className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <option value="AN">Andaman and Nicobar Islands (AN)</option>
                          <option value="AP">Andhra Pradesh (AP)</option>
                          <option value="AR">Arunachal Pradesh (AR)</option>
                          <option value="AS">Assam (AS)</option>
                          <option value="BR">Bihar (BR)</option>
                          <option value="CH">Chandigarh (CH)</option>
                          <option value="CG">Chhattisgarh (CG)</option>
                          <option value="DN">Dadra and Nagar Haveli and Daman and Diu (DN)</option>
                          <option value="DL">Delhi (DL)</option>
                          <option value="GA">Goa (GA)</option>
                          <option value="GJ">Gujarat (GJ)</option>
                          <option value="HR">Haryana (HR)</option>
                          <option value="HP">Himachal Pradesh (HP)</option>
                          <option value="JK">Jammu and Kashmir (JK)</option>
                          <option value="JH">Jharkhand (JH)</option>
                          <option value="KA">Karnataka (KA)</option>
                          <option value="KL">Kerala (KL)</option>
                          <option value="LA">Ladakh (LA)</option>
                          <option value="LD">Lakshadweep (LD)</option>
                          <option value="MP">Madhya Pradesh (MP)</option>
                          <option value="MH">Maharashtra (MH)</option>
                          <option value="MN">Manipur (MN)</option>
                          <option value="ML">Meghalaya (ML)</option>
                          <option value="MZ">Mizoram (MZ)</option>
                          <option value="NL">Nagaland (NL)</option>
                          <option value="OR">Odisha (OR)</option>
                          <option value="PY">Puducherry (PY)</option>
                          <option value="PB">Punjab (PB)</option>
                          <option value="RJ">Rajasthan (RJ)</option>
                          <option value="SK">Sikkim (SK)</option>
                          <option value="TN">Tamil Nadu (TN)</option>
                          <option value="TG">Telangana (TG)</option>
                          <option value="TR">Tripura (TR)</option>
                          <option value="UP">Uttar Pradesh (UP)</option>
                          <option value="UK">Uttarakhand (UK)</option>
                          <option value="WB">West Bengal (WB)</option>
                        </select>
                      </div>
                      <div className="flex flex-col text-left">
                        <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">ZIP / Postal Pin *</label>
                        <input
                          type="text"
                          name="pin"
                          value={shippingDetails.pin}
                          onChange={handleInputChange}
                          required
                          disabled={isSubmittingOrder}
                          placeholder="110001"
                          className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    {user?.address && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (!shippingDetails.name || !shippingDetails.phone || !shippingDetails.address) {
                              showToast('Please fill in all required shipping fields.');
                            } else {
                              setIsEditingAddress(false);
                            }
                          }}
                          className="text-[10px] uppercase font-black text-brand-navy/60 hover:text-brand-coral cursor-pointer"
                        >
                          Cancel / Use Saved Address
                        </button>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <h4 className="text-xs font-bold text-brand-navy/70 uppercase tracking-widest text-left mb-4">Payment Method</h4>
                  <div className="flex items-center gap-3 border border-brand-coral bg-bg-coral-light/20 p-4 rounded-2xl">
                    <div className="w-4 h-4 bg-brand-coral rounded-full flex items-center justify-center text-white shrink-0">
                      <FiCheckCircle className="text-[10px]" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-brand-navy block">Razorpay (Cards/UPI/Netbanking)</span>
                      <span className="text-[9px] text-brand-navy/50 font-bold">Secure online payment processed instantly.</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOrder}
                  className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-brand-coral/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingOrder ? (
                    <span className="flex items-center gap-2 animate-pulse">Processing Order...</span>
                  ) : (
                    <>
                      <FiCheckCircle /> Confirm & Place Order (Rs. {cartTotal.toFixed(0)})
                    </>
                  )}
                </button>
              </form>
            )}

          </div>

          {/* Right panel: Summary card */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="bg-white border border-brand-navy/5 p-6 rounded-[24px]">
              <h3 className="font-heading text-sm font-black text-brand-navy border-b border-brand-navy/5 pb-4 mb-6 uppercase tracking-wider">Order Summary</h3>

              {/* Promo Coupon apply */}
              {checkoutStep !== 'complete' && (
                <div className="mb-6 border-b border-brand-navy/5 pb-6">
                  {couponCode ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-full py-2 px-4 text-xs font-bold text-green-700">
                      <span>Applied: {couponCode}</span>
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveCoupon();
                          setCouponInput('');
                        }}
                        className="text-red-500 hover:text-red-700 font-extrabold uppercase ml-2 text-[10px] tracking-wider cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleCouponSubmit} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="COUPON CODE"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={isSubmittingOrder}
                        className="flex-1 bg-bg-cream border border-brand-navy/15 rounded-full py-2 px-4 text-xs font-bold text-brand-navy uppercase outline-none focus:border-brand-coral disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={isSubmittingOrder}
                        className="bg-brand-navy hover:bg-brand-coral text-white text-xs font-bold py-2 px-5 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Order stats list */}
              <div className="flex flex-col gap-3.5 mb-6 text-xs sm:text-sm font-semibold text-brand-navy/80">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>Rs. {cartSubtotal}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span className="flex items-center gap-1"><FiGift /> Promo Coupon ({Math.round(appliedDiscount * 100)}%):</span>
                    <span>-Rs. {discountAmount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Delivery:</span>
                  <span>{isFreeShipping ? 'FREE' : `Rs. ${shippingCost}`}</span>
                </div>
                <div className="flex justify-between border-t border-brand-navy/5 pt-4 text-sm sm:text-base font-black text-brand-navy">
                  <span>Total Order Cost:</span>
                  <span className="text-brand-coral">Rs. {cartTotal.toFixed(0)}</span>
                </div>
              </div>

              {checkoutStep === 'cart' && (
                user ? (
                  <button
                    onClick={() => setCheckoutStep('shipping')}
                    className="w-full bg-brand-navy hover:bg-black text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
                  >
                    Proceed to Checkout <FiChevronRight />
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-[11px] text-brand-navy/60 font-semibold text-center leading-normal">
                      Please log in or register to complete your order.
                    </p>
                    <Link
                      to="/login"
                      className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-brand-coral/15 transition-all text-center"
                    >
                      Login / Register to Checkout <FiArrowRight />
                    </Link>
                  </div>
                )
              )}
            </div>

            {/* Simulated support block */}
            <div className="bg-bg-blue-light/50 border border-brand-navy/5 p-5 rounded-2xl">
              <h4 className="text-xs font-black text-brand-navy mb-2 flex items-center gap-1.5"><FiCreditCard /> Secure Checkouts</h4>
              <p className="text-[10px] sm:text-xs text-brand-navy/60 font-semibold leading-relaxed">
                All data transfers are mock-simulated with high-level encryption standards. If you need helper guidance, reach Sernaya helpdesk.
              </p>
            </div>
          </div>

        </div>
      )}
    </motion.div>
  );
}
