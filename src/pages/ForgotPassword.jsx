import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowLeft, FiArrowRight, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { client } from '../apollo';
import { gql } from '@apollo/client';
import { checkRateLimit, getRateLimitMessage } from '../utils/rateLimiter';

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();

  // Validate URL params before trusting them in any GraphQL mutation.
  // An attacker could craft /forgot-password?key=<10000chars>&login=... to cause
  // server-side issues or reveal information via error messages.
  const rawKey   = searchParams.get('key')   || '';
  const rawLogin = searchParams.get('login') || '';
  const resetKey   = /^[A-Za-z0-9_-]{1,64}$/.test(rawKey)   ? rawKey   : '';
  const userLogin  = /^[A-Za-z0-9@._+-]{1,100}$/.test(rawLogin) ? rawLogin : '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (email.includes('@') && !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    const { allowed, retryAfter } = checkRateLimit('auth');
    if (!allowed) {
      setError(getRateLimitMessage('auth', retryAfter));
      return;
    }

    setIsSubmitting(true);
    try {
      const SEND_PASSWORD_RESET = gql`
        mutation SendPasswordResetEmail($username: String!) {
          sendPasswordResetEmail(input: {username: $username}) {
            user {
              email
            }
          }
        }
      `;

      await client.mutate({
        mutation: SEND_PASSWORD_RESET,
        variables: { username: email.trim() }
      });

      setMessage('A password reset link has been sent to your email. Please check your inbox and spam folders.');
      setEmail('');
    } catch (err) {
      setError(err.message || 'Failed to send password reset email. Please make sure the username/email is correct.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // M-6 fix: removed 20-char maximum cap; minimum raised to 8 per NIST SP 800-63B
    const passwordRegex = /^.{8,}$/;

    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate that the URL params are still intact before submitting
    if (!resetKey || !userLogin) {
      setError('Invalid or expired reset link. Please request a new one.');
      return;
    }

    const { allowed, retryAfter } = checkRateLimit('auth');
    if (!allowed) {
      setError(getRateLimitMessage('auth', retryAfter));
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const RESET_PASSWORD = gql`
        mutation ResetUserPassword($key: String!, $login: String!, $password: String!) {
          resetUserPassword(input: {key: $key, login: $login, password: $password}) {
            user {
              username
            }
          }
        }
      `;

      await client.mutate({
        mutation: RESET_PASSWORD,
        variables: { key: resetKey, login: userLogin, password }
      });

      setMessage('Your password has been successfully reset! You can now log in using your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to reset password. The reset link may have expired or is invalid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isResetMode = !!(resetKey && userLogin);

  // If URL params failed validation, show a clear error instead of the form
  if ((searchParams.get('key') || searchParams.get('login')) && !isResetMode) {
    return (
      <div className="max-w-[1260px] mx-auto px-6 py-20 flex justify-center items-center min-h-[70vh]">
        <div className="w-full max-w-md bg-white border border-red-200 p-8 rounded-[40px] shadow-lg text-center">
          <p className="text-sm font-bold text-red-600 mb-4">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-brand-coral text-xs font-bold underline">Request a new reset link</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1260px] mx-auto px-6 py-20 flex justify-center items-center min-h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-brand-navy/5 p-8 sm:p-12 rounded-[40px] shadow-lg text-center"
      >
        <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-navy mb-2">
          {isResetMode ? 'Choose New Password' : 'Reset Password'}
        </h2>
        <p className="text-xs text-brand-navy/60 font-semibold mb-8 max-w-xs mx-auto leading-relaxed">
          {isResetMode 
            ? 'Please enter and confirm your new account password.' 
            : "Enter your email or username below and we'll send you a link to reset your password."}
        </p>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold p-4 rounded-2xl mb-6 text-left flex items-start gap-2.5">
            <FiCheckCircle className="text-base shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-2xl mb-6 text-left">
            {error}
          </div>
        )}

        {isResetMode && message ? (
          <div className="mt-6">
            <Link to="/login" className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-brand-coral/25 transition-all">
              Go to Login <FiArrowRight />
            </Link>
          </div>
        ) : isResetMode ? (
          <form onSubmit={handleResetPassword} className="space-y-6 text-left">
            <div className="flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">New Password *</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className="w-full bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 pl-11 pr-11 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-navy/35 hover:text-brand-coral cursor-pointer disabled:opacity-50"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Confirm New Password *</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="••••••••"
                  className="w-full bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 pl-11 pr-11 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isSubmitting}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-navy/35 hover:text-brand-coral cursor-pointer disabled:opacity-50"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-brand-coral/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Resetting Password...' : 'Save New Password'} <FiArrowRight />
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-6 text-left">
            <div className="flex flex-col">
              <label className="text-[10px] font-extrabold uppercase text-brand-navy/60 mb-2">Email or Username *</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-navy/35" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                  placeholder="parent@example.com"
                  className="w-full bg-bg-cream/70 border border-brand-navy/10 rounded-xl py-2.5 pl-11 pr-4 text-xs font-semibold text-brand-navy outline-none focus:border-brand-coral focus:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-coral hover:bg-brand-coral-hover text-white text-xs sm:text-sm font-bold py-3.5 rounded-full flex items-center justify-center gap-2 shadow-md shadow-brand-coral/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Reset Link'} <FiArrowRight />
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-brand-navy/8">
          <Link to="/login" className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-brand-navy/60 hover:text-brand-coral transition-colors">
            <FiArrowLeft /> Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
