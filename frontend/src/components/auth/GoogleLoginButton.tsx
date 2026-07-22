import React, { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

declare global {
  interface Window {
    google: any;
  }
}

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
  className?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { googleLogin } = useAuth();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Identity Services
    const loadGoogleScript = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleSignIn();
      } else {
        // Wait for script to load
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.accounts) {
            clearInterval(checkGoogle);
            initializeGoogleSignIn();
          }
        }, 100);

        // Timeout after 10 seconds
        setTimeout(() => {
          clearInterval(checkGoogle);
          console.error('Google Identity Services failed to load');
        }, 10000);
      }
    };

    const initializeGoogleSignIn = () => {
      try {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: buttonRef.current.offsetWidth || 300,
            text: 'signin_with',
            shape: 'rectangular',
          });
        }
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
      }
    };

    const handleCredentialResponse = async (response: any) => {
      try {
        await googleLogin(response.credential);
        onSuccess?.();
      } catch (error) {
        console.error('Google login failed:', error);
        onError?.(error);
      }
    };

    loadGoogleScript();

    // Cleanup
    return () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        // Reset the button if needed
      }
    };
  }, [googleLogin, onSuccess, onError]);

  const handleCustomClick = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* Custom styled Google button */}
      <button
        onClick={handleCustomClick}
        className="w-full bg-[#4285F4] hover:bg-[#357ae8] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md flex items-center justify-center space-x-3 text-base"
        type="button"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="white"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="white"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="white"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="white"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      {/* Hidden Google button container for official implementation */}
      <div ref={buttonRef} className="hidden" />
    </div>
  );
};