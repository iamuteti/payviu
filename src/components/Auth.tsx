
import React, { useEffect } from 'react';
import type { User } from '../types';

declare global {
  interface Window {
    google: any;
  }
}

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const decodeJwt = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  };

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          const decoded = decodeJwt(response.credential);
          const user: User = {
            id: decoded.sub,
            name: decoded.name,
            email: decoded.email,
            picture: decoded.picture,
          };
          onLogin(user);
        },
      });
    };

    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts && window.google.accounts.id) {
        initializeGoogleSignIn();
      } else {
        setTimeout(checkGoogleLoaded, 100);
      }
    };

    checkGoogleLoaded();
  }, [onLogin]);

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-full max-w-md sm:max-w-lg glass p-8 sm:p-12 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-500">
        <div className="mb-10">
          <div className="w-24 h-24 bg-sky-100 text-sky-500 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <svg viewBox="0 0 24 24" className="w-12 h-12 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.75 4h-1.5a.75.75 0 0 0-.75.75v14.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V4.75a.75.75 0 0 0-.75-.75zM4 12.75v-1.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H4.75a.75.75 0 0 1-.75-.75z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight mb-2">GlassPay</h1>
          <p className="text-gray-500 font-medium">Your sleek financial tracker</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-4 bg-white border border-gray-100 py-4 rounded-2xl shadow-sm hover:shadow-md hover:bg-gray-50 active:scale-95 transition-all mb-6 group"
        >
          <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-gray-700">Sign in with Google</span>
        </button>

        <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-[240px] mx-auto">
          Start managing your recurring and one-time payments with elegance.
        </p>
      </div>
    </div>
  );
};

export default Auth;
