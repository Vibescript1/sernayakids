import React, { createContext, useContext, useEffect } from 'react';
import { useShopStore, getDerivedShopState } from '../store/useShopStore';
import { useAuthStore } from '../store/useAuthStore';
import { useAuth } from './AuthContext';

const ShopContext = createContext();

export const PRODUCTS = [];
export const TESTIMONIALS = [];

export const ShopProvider = ({ children }) => {
  const { user, login: loginUser, register: registerUser, logout: logoutUser, updateProfile } = useAuth();
  
  const fetchWooCommerceProducts = useShopStore(state => state.fetchWooCommerceProducts);
  const fetchUserOrders = useShopStore(state => state.fetchUserOrders);
  const syncOnAuthChange = useShopStore(state => state.syncOnAuthChange);

  // Fetch products and testimonials on mount
  useEffect(() => {
    fetchWooCommerceProducts();
  }, [fetchWooCommerceProducts]);

  // Sync user orders and migrate cart on auth change
  useEffect(() => {
    fetchUserOrders();
    syncOnAuthChange();
  }, [user, fetchUserOrders, syncOnAuthChange]);

  const storeState = useShopStore();
  const derived = getDerivedShopState(storeState);

  const contextValue = {
    PRODUCTS: storeState.products,
    TESTIMONIALS: storeState.testimonials,
    loadingCatalog: storeState.loadingCatalog,
    loadingTestimonials: storeState.loadingTestimonials,
    cart: storeState.cart,
    wishlist: storeState.wishlist,
    toasts: storeState.toasts,
    couponCode: storeState.couponCode,
    appliedDiscount: storeState.appliedDiscount,
    selectedColors: storeState.selectedColors,
    setSelectedColors: storeState.setSelectedColors,
    showToast: storeState.showToast,
    addToCart: storeState.addToCart,
    updateQty: storeState.updateQty,
    removeFromCart: storeState.removeFromCart,
    toggleWishlist: storeState.toggleWishlist,
    handleApplyCoupon: storeState.handleApplyCoupon,
    handleRemoveCoupon: storeState.handleRemoveCoupon,
    syncCouponFromServer: storeState.syncCouponFromServer,
    clearCart: storeState.clearCart,
    user,
    orders: storeState.orders,
    loginUser,
    registerUser,
    logoutUser,
    updateProfile,
    createWooCommerceOrder: storeState.createWooCommerceOrder,
    syncCartFromBackend: storeState.syncCartFromBackend,
    fetchUserOrders,
    ...derived
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (context) return context;

  // Direct store hook fallback if used outside Provider
  const storeState = useShopStore();
  const authState = useAuthStore();
  const derived = getDerivedShopState(storeState);
  
  return {
    PRODUCTS: storeState.products,
    TESTIMONIALS: storeState.testimonials,
    loadingCatalog: storeState.loadingCatalog,
    loadingTestimonials: storeState.loadingTestimonials,
    cart: storeState.cart,
    wishlist: storeState.wishlist,
    toasts: storeState.toasts,
    couponCode: storeState.couponCode,
    appliedDiscount: storeState.appliedDiscount,
    selectedColors: storeState.selectedColors,
    setSelectedColors: storeState.setSelectedColors,
    showToast: storeState.showToast,
    addToCart: storeState.addToCart,
    updateQty: storeState.updateQty,
    removeFromCart: storeState.removeFromCart,
    toggleWishlist: storeState.toggleWishlist,
    handleApplyCoupon: storeState.handleApplyCoupon,
    handleRemoveCoupon: storeState.handleRemoveCoupon,
    syncCouponFromServer: storeState.syncCouponFromServer,
    clearCart: storeState.clearCart,
    orders: storeState.orders,
    loginUser: authState.login,
    registerUser: authState.register,
    logoutUser: authState.logout,
    updateProfile: authState.updateProfile,
    createWooCommerceOrder: storeState.createWooCommerceOrder,
    syncCartFromBackend: storeState.syncCartFromBackend,
    ...derived
  };
};
