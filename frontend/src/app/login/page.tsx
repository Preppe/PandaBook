'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext'; // Remove old context import
import useAuthStore from '@/lib/store/authStore'; // Import Zustand store
import { useLoginUser } from '@/lib/api/authClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Get state and actions from Zustand store
  const { setUser, setLoading, isLoading, isAuthenticated } = useAuthStore();
  // Note: 'user' object is not directly needed for the login page logic here
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    // Redirect only if authentication status is confirmed (not loading) and user is authenticated
    if (!isLoading && isAuthenticated) {
      console.log('User already authenticated, redirecting from login...');
      // Redirect to a protected route, e.g., home or dashboard
      router.push('/'); // Or '/dashboard' or wherever appropriate
    }
  }, [isAuthenticated, isLoading, router]);

  const { mutateAsync: loginMutate, isLoading: isLoginLoading } = useLoginUser({
    onSuccess: (user) => {
      setUser(user);
      setLoading(false);
    },
    onError: (err: any) => {
      setError(err.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }

    setLoading(true);
    try {
      await loginMutate({ email, password });
      // Login successful, the useEffect above should handle redirection
    } catch (err: any) {
      // Error is handled in onError above
      setLoading(false);
    }
  };

  // Don't render the login form if the user is authenticated and redirection is pending
  // or if initial loading is still happening (to avoid flash of content)
  if (isLoading || isAuthenticated) {
      // You can show a loading indicator or null while redirecting/loading
      return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;
  }

  return (
    <div
      id="mobile-login-container"
      className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 p-6 flex flex-col items-center"
    >
      <div id="header" className="w-full flex justify-center pt-12 pb-8">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-paw text-3xl text-red-500"></i>
          <span className="text-2xl font-bold text-red-800">PandaBooks</span>
        </div>
      </div>

      <div
        id="login-content"
        className="w-full max-w-md flex flex-col items-center gap-8 mt-4"
      >
        <div
          id="logo-section"
          className="w-full flex flex-col items-center gap-4"
        >
          <img
            className="w-32 h-32 rounded-full shadow-lg"
            src="/366131d9e7-27a4b9270c78fe51bb8e.png"
            alt="cute red panda mascot logo, warm colors, minimalist illustration style"
          />
          <h1 className="text-2xl font-bold text-red-800 text-center">
            Benvenuto su PandaBooks
          </h1>
          <p className="text-red-700/70 text-center">
            Il tuo compagno di ascolto preferito
          </p>
        </div>

        <form id="login-form" className="w-full space-y-4 mt-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-red-800 text-sm font-medium">Email</label>
            <div className="relative">
              <i className="fa-regular fa-envelope absolute left-3 top-3 text-red-400"></i>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/70 border border-red-200 rounded-xl py-2 px-10 focus:outline-none focus:ring-2 focus:ring-red-400 text-red-800 placeholder-red-300"
                placeholder="Il tuo indirizzo email"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-red-800 text-sm font-medium">Password</label>
            <div className="relative">
              <i className="fa-regular fa-lock absolute left-3 top-3 text-red-400"></i>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/70 border border-red-200 rounded-xl py-2 px-10 focus:outline-none focus:ring-2 focus:ring-red-400 text-red-800 placeholder-red-300"
                placeholder="La tua password"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-red-300 text-red-500 focus:ring-red-400"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-red-700">
                Ricordami
              </label>
            </div>
            <span className="text-sm text-red-600 hover:text-red-800 cursor-pointer">
              Password dimenticata?
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-xl mt-6 shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>

        {/* Social login and signup links remain for now, functionality not implemented */}
        <div id="social-login" className="w-full space-y-4 mt-6">
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-red-200"></div>
            <span className="flex-shrink px-4 text-red-700">
              oppure continua con
            </span>
            <div className="flex-grow border-t border-red-200"></div>
          </div>

          <div className="flex gap-4 justify-center">
            <button className="flex-1 py-2.5 px-4 border border-red-200 rounded-xl bg-white/70 hover:bg-white transition-all" disabled={isLoading}>
              <i className="fa-brands fa-google text-xl text-red-600"></i>
            </button>
            <button className="flex-1 py-2.5 px-4 border border-red-200 rounded-xl bg-white/70 hover:bg-white transition-all" disabled={isLoading}>
              <i className="fa-brands fa-apple text-xl text-red-800"></i>
            </button>
            <button className="flex-1 py-2.5 px-4 border border-red-200 rounded-xl bg-white/70 hover:bg-white transition-all" disabled={isLoading}>
              <i className="fa-brands fa-facebook text-xl text-blue-600"></i>
            </button>
          </div>
        </div>

        <div id="signup-link" className="w-full text-center mt-6">
          <p className="text-red-700">
            Non hai un account?
            <span className="font-medium text-red-600 hover:text-red-800 cursor-pointer">
              Registrati
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
