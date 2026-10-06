import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const checkActiveSession = useAuthStore(state => state.checkActiveSession);
  const loadingSession = useAuthStore(state => state.loadingSession);

  useEffect(() => {
    checkActiveSession();
  }, [checkActiveSession]);

  const storeState = useAuthStore();

  return (
    <AuthContext.Provider value={{
      user: storeState.user,
      loadingSession: storeState.loadingSession,
      login: storeState.login,
      register: storeState.register,
      logout: storeState.logout,
      updateProfile: storeState.updateProfile,
      isAuthenticated: !!storeState.user,
    }}>
      {!loadingSession && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context) return context;
  
  // Direct store hook fallback if used outside Provider
  const storeState = useAuthStore();
  return {
    user: storeState.user,
    loadingSession: storeState.loadingSession,
    login: storeState.login,
    register: storeState.register,
    logout: storeState.logout,
    updateProfile: storeState.updateProfile,
    isAuthenticated: !!storeState.user,
  };
};