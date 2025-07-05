'use client';

import React, { useEffect, useState } from 'react';
import googleAuthService from '@/lib/services/googleAuth';
import { useGoogleLogin } from '@/lib/api/authClient';
import useAuthStore from '@/lib/store/authStore';

interface GoogleSignInButtonProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function GoogleSignInButton({
  onSuccess,
  onError,
  disabled = false,
  className = '',
}: GoogleSignInButtonProps) {
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const { setUser, setLoading } = useAuthStore();

  const { mutateAsync: googleLoginMutate, isPending: isGoogleLoading } = useGoogleLogin({
    onSuccess: (user) => {
      setUser(user);
      setLoading(false);
      onSuccess?.(user);
    },
    onError: (err: any) => {
      const errorMessage = err.message || 'Google login failed. Please try again.';
      onError?.(errorMessage);
      setLoading(false);
    }
  });

  useEffect(() => {
    const loadGoogleAPI = async () => {
      try {
        await googleAuthService.loadGoogleAPI();
        setIsApiLoaded(true);
      } catch (error) {
        console.error('Failed to load Google API:', error);
        onError?.('Failed to load Google authentication. Please refresh the page.');
      }
    };

    loadGoogleAPI();
  }, []);

  const handleGoogleLogin = async () => {
    if (!isApiLoaded || disabled || isGoogleLoading) return;

    try {
      setLoading(true);
      
      // Initialize Google OAuth flow
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          callback: async (response: any) => {
            try {
              // Send the ID token to our backend
              await googleLoginMutate({
                idToken: response.credential,
              });
            } catch (error: any) {
              console.error('Google login error:', error);
              const errorMessage = error.message || 'Google login failed. Please try again.';
              onError?.(errorMessage);
              setLoading(false);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Try to show the One Tap prompt first
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If One Tap fails, use the triggerSignIn method
            handleFallbackLogin();
          }
        });
      } else {
        throw new Error('Google API not loaded');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      const errorMessage = error.message || 'Google login failed. Please try again.';
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  const handleFallbackLogin = async () => {
    try {
      const result = await googleAuthService.triggerSignIn();
      
      // Send the ID token to our backend
      await googleLoginMutate({
        idToken: result.idToken,
      });
    } catch (error: any) {
      console.error('Google fallback login error:', error);
      const errorMessage = error.message || 'Google login failed. Please try again.';
      onError?.(errorMessage);
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      disabled={disabled || isGoogleLoading || !isApiLoaded}
      className={`w-full flex items-center justify-center py-2.5 px-4 border border-red-200 rounded-xl bg-white/70 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <i className="fa-brands fa-google text-xl text-red-600"></i>
    </button>
  );
}
