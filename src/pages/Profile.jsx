import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';
import { FiUser, FiShoppingBag, FiMapPin, FiLogOut, FiEdit, FiCheck } from 'react-icons/fi';
import OrderDetailsModal from '../components/OrderDetailsModal';

export default function Profile() {
  const { user, orders, logoutUser, updateProfile, showToast } = useShop();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'orders'
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', city: '', pin: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setEditForm({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pin: user.pin || ''
      });
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (loading) return;

    const nothingChanged = 
      editForm.name.trim() === (user.name || '').trim() &&
      editForm.phone.trim() === (user.phone || '').trim() &&
      editForm.address.trim() === (user.address || '').trim() &&
      editForm.city.trim() === (user.city || '').trim() &&
      editForm.pin.trim() === (user.pin || '').trim();

    if (nothingChanged) {
      showToast('No changes detected in profile settings.');
      setIsEditing(false);
      return;
    }

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const phoneRegex = /^(?:\+91[\-\s]?)?[6-9]\d{9}$/;
    const cityRegex = /^[A-Za-z\s]{2,50}$/;
    const pinRegex = /^[1-9]\d{5}$/;

    if (!nameRegex.test(editForm.name.trim())) {
      showToast('Please enter a valid name (2-50 characters, letters only).');
      return;
    }
    if (editForm.phone && !phoneRegex.test(editForm.phone.trim())) {
      showToast('Please enter a valid Indian phone number.');
      return;
    }
    if (editForm.city && !cityRegex.test(editForm.city.trim())) {
      showToast('Please enter a valid city name.');
      return;
    }
    if (editForm.pin && !pinRegex.test(editForm.pin.trim())) {
      showToast('Please enter a valid 6-digit postal PIN code.');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(editForm);
      setIsEditing(false);
    } catch (err) {
      showToast('Failed to update profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-10 text-left"
    >
      <div className="border-b border-brand-navy/5 pb-6 mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-navy mb-2 flex items-center gap-2">
            <FiUser className="text-brand-coral" /> My Account
          </h1>
          <p className="text-xs sm:text-sm text-brand-navy/60 font-semibold">
            Manage your personal credentials, shipping addresses, and check order statuses.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-brand-navy hover:bg-red-500 text-white text-xs font-bold py-2.5 px-6 rounded-full flex items-center gap-2 transition-colors cursor-pointer w-fit self-start sm:self-auto"
        >
          <FiLogOut /> Logout
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-3 bg-white border border-brand-navy/5 p-4 rounded-2xl space-y-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'profile' ? 'bg-bg-pink-light/60 text-brand-coral' : 'hover:bg-bg-cream/50 text-brand-navy/70'}`}
          >
            <FiUser /> Account details
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left px-4 py-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer ${activeTab === 'orders' ? 'bg-bg-pink-light/60 text-brand-coral' : 'hover:bg-bg-cream/50 text-brand-navy/70'}`}
          >
            <FiShoppingBag /> Order History
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="lg:col-span-9">
          {activeTab === 'profile' && (
            <div className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[32px] shadow-sm">
              <div className="flex justify-between items-center border-b border-brand-navy/5 pb-4 mb-6">
                <h3 className="font-heading text-base font-black text-brand-navy">Personal Details</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs font-bold text-brand-coral hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FiEdit /> Edit Details
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-xs font-bold text-brand-navy/40 hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs sm:text-sm font-semibold text-brand-navy/80">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-navy/45 block">Full Name</span>
                    <p className="text-brand-navy font-black text-base">{user.name}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-navy/45 block">Email Address</span>
                    <p>{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-navy/45 block">Phone Number</span>
                    <p>{user.phone || 'Not specified'}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-brand-navy/45 block">Default Address</span>
                    <p>{user.address ? `${user.address}, ${user.city} - ${user.pin}` : 'Not specified'}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                        disabled={loading}
                        className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+91-0000000000"
                        disabled={loading}
                        className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Street Address</label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Apt, Locality, House No."
                      disabled={loading}
                      className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">City</label>
                      <input
                        type="text"
                        value={editForm.city}
                        onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                        placeholder="New Delhi"
                        disabled={loading}
                        className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Postal Pin</label>
                      <input
                        type="text"
                        value={editForm.pin}
                        onChange={(e) => setEditForm(prev => ({ ...prev, pin: e.target.value }))}
                        placeholder="110001"
                        disabled={loading}
                        className="bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 px-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-coral hover:bg-brand-coral-hover text-white text-xs font-bold py-2.5 px-6 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiCheck /> {loading ? 'Saving...' : 'Save Profile Settings'}
                  </button>
                </form>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white border border-brand-navy/5 p-6 sm:p-8 rounded-[32px] shadow-sm space-y-6">
              <h3 className="font-heading text-base font-black text-brand-navy border-b border-brand-navy/5 pb-4 mb-4">Orders History</h3>

              {orders.length === 0 ? (
                <p className="text-xs text-brand-navy/60 font-semibold py-6">You have not placed any orders yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 3).map(order => (
                    <div key={order.id} className="border border-brand-navy/10 rounded-2xl p-4 sm:p-6 text-xs sm:text-sm font-semibold text-brand-navy/80 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between border-b border-brand-navy/5 pb-3 gap-2">
                        <div>
                          <p className="text-brand-navy font-black">Order ID: {order.id}</p>
                          <p className="text-[10px] text-brand-navy/50 font-bold mt-1">Placed on: {order.date}</p>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className={`text-[10px] uppercase font-bold py-1 px-3 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="divide-y divide-brand-navy/5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between py-2.5">
                            <div className="text-left">
                              <p className="font-black text-brand-navy">{item.name}</p>
                              <p className="text-[10px] text-brand-navy/50 font-bold mt-0.5">Color: {item.color} | Size: {item.size} | Qty: {item.quantity}</p>
                            </div>
                            <span className="font-black text-brand-navy">Rs. {item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t border-brand-navy/5 pt-3.5 font-black text-brand-navy">
                        <div>
                          <span className="text-[10px] text-brand-navy/40 font-bold block text-left mb-0.5">Total Paid</span>
                          <span className="text-brand-coral">Rs. {order.total}</span>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-bg-cream hover:bg-brand-navy hover:text-white text-brand-navy text-[10px] font-bold py-2 px-4 rounded-full cursor-pointer transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length > 3 && (
                    <div className="pt-4 text-center">
                      <Link to="/orders" className="text-xs font-bold text-brand-coral hover:underline inline-flex items-center gap-1">
                        View All Orders <FiShoppingBag className="inline" />
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details Popup Modal */}
      <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </motion.div>
  );
}
