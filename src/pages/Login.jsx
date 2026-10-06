import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Login() {
  const { user, loginUser, registerUser, cart } = useShop();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [formData, setFormData] = useState({ name: 'Shivam', email: 'shivam870045@gmail.com', password: 'shivam12' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cooldown / lock states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTime, setLockoutTime] = useState(0); // in seconds
  
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (cart && cart.length > 0) {
        navigate('/cart');
      } else {
        navigate('/profile');
      }
    }
  }, [user, cart, navigate]);

  // Countdown timer effect
  useEffect(() => {
    if (lockoutTime <= 0) return;
    const timer = setInterval(() => {
      setLockoutTime(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutTime]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (lockoutTime > 0) {
      setError(`Too many failed attempts. Please wait ${lockoutTime} seconds.`);
      return;
    }

    setError('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    // M-6 fix: removed 20-char maximum cap; minimum raised to 8 per NIST SP 800-63B
    const passwordRegex = /^.{8,}$/;

    if (!emailRegex.test(formData.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      if (isLoginTab) {
        const result = await loginUser(formData.email, formData.password);
        if (result && result.success) {
          setFailedAttempts(0); // Reset failures on success
          if (cart && cart.length > 0) {
            navigate('/cart');
          } else {
            navigate('/profile');
          }
        } else {
          const nextFailCount = failedAttempts + 1;
          setFailedAttempts(nextFailCount);
          
          let lockSecs = 0;
          if (nextFailCount >= 5) {
            lockSecs = 60; // 60s lockout for 5+ failures
          } else if (nextFailCount >= 3) {
            lockSecs = 30; // 30s lockout for 3+ failures
          }

          if (lockSecs > 0) {
            setLockoutTime(lockSecs);
            setError(`Too many failed attempts. Access locked for ${lockSecs} seconds.`);
          } else {
            const cleanMessage = result?.message 
              ? result.message.replace(/<[^>]+>/g, '').trim() 
              : 'Login failed. Please check your credentials.';
            setError(`${cleanMessage} (Attempt ${nextFailCount}/3 before lockout)`);
          }
          setLoading(false);
        }
      } else {
        if (!nameRegex.test(formData.name.trim())) {
          setError('Please enter a valid name (2-50 characters, letters only).');
          setLoading(false);
          return;
        }

        const result = await registerUser(formData.name, formData.email, formData.password);
        if (result && result.success) {
          if (cart && cart.length > 0) {
            navigate('/cart');
          } else {
            navigate('/profile');
          }
        } else {
          const cleanMessage = result?.message 
            ? result.message.replace(/<[^>]+>/g, '').trim() 
            : 'Registration failed. Please check your details.';
          setError(cleanMessage);
          setLoading(false);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    if (loading || lockoutTime > 0) return;
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="max-w-[1260px] mx-auto px-6 py-16 text-center"
    >
      <div className="bg-white border border-brand-navy/5 max-w-md mx-auto rounded-[32px] overflow-hidden shadow-lg p-6 sm:p-8">
        
        {/* Toggle tabs */}
        <div className="flex border-b border-brand-navy/5 mb-8">
          <button
            onClick={() => setIsLoginTab(true)}
            className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest border-b-2 cursor-pointer transition-all ${isLoginTab ? 'border-brand-coral text-brand-coral' : 'border-transparent text-brand-navy/50'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLoginTab(false)}
            className={`flex-1 pb-4 text-xs font-black uppercase tracking-widest border-b-2 cursor-pointer transition-all ${!isLoginTab ? 'border-brand-coral text-brand-coral' : 'border-transparent text-brand-navy/50'}`}
          >
            Register
          </button>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-brand-navy mb-2 text-left">
          {isLoginTab ? 'Welcome Back!' : 'Create An Account'}
        </h2>
        <p className="text-xs text-brand-navy/60 font-semibold text-left mb-6">
          {isLoginTab ? 'Sign in to access your orders, saved addresses, and profile settings.' : 'Sign up to register your child details and speed up checkout.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-2xl mb-4">
              {error}
            </div>
          )}
          {!isLoginTab && (
            <div className="flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Full Name *</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading || lockoutTime > 0}
                  autoComplete="name"
                  placeholder="Shivam"
                  className="w-full bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          )}

          <div className="flex flex-col">
            <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Email Address *</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={loading || lockoutTime > 0}
                autoComplete="username"
                placeholder="shivam870045@gmail.com"
                className="w-full bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Password *</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading || lockoutTime > 0}
                autoComplete={isLoginTab ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="w-full bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 pl-11 pr-11 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || lockoutTime > 0}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-navy/35 hover:text-brand-coral cursor-pointer disabled:opacity-50"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {isLoginTab && (
            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-[10px] font-bold text-brand-navy/55 hover:text-brand-coral underline"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || lockoutTime > 0}
            className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-brand-coral/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : lockoutTime > 0 ? `Locked (${lockoutTime}s)` : (isLoginTab ? 'Sign In' : 'Create Account')} {(!loading && lockoutTime <= 0) && <FiArrowRight />}
          </button>
        </form>

        <p className="text-[10px] text-brand-navy/40 font-bold uppercase mt-6 text-center">
          {isLoginTab ? 'New to Sernaya Kids?' : 'Already have an account?'} 
          <button 
            onClick={() => !loading && setIsLoginTab(!isLoginTab)}
            disabled={loading || lockoutTime > 0}
            className="text-brand-coral ml-1 underline cursor-pointer disabled:opacity-50"
          >
            {isLoginTab ? 'Register here' : 'Sign In instead'}
          </button>
        </p>

      </div>
    </motion.div>
  );
}
