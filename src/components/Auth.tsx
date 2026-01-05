
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import type { User } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const userInfo = await response.json();

        const user: User = {
          id: userInfo.sub,
          name: userInfo.name,
          email: userInfo.email,
          picture: userInfo.picture,
        };
        onLogin(user);
      } catch (error) {
        console.error('Failed to fetch user info', error);
      }
    },
    onError: () => console.log('Login Failed'),
  });

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // For demo: creating a dummy user object
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || email.split('@')[0],
      email: email,
      picture: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=0ea5e9&color=fff`,
    };
    onLogin(user);
  };

  return (
    <div className='w-full min-h-screen flex items-center justify-center p-4 bg-transparent'>
      <div className="w-full max-w-md glass-card p-8 sm:p-12 rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-700 relative overflow-hidden">
        {/* Abstract Background Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-500/20 blur-[80px] rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full" />

        <div className="relative z-10">
          <div className="mb-10">
            <div className="w-20 h-20 bg-sky-500/10 dark:bg-sky-500/20 text-sky-500 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner transform -rotate-3 hover:rotate-0 transition-transform duration-500 animate-float">
              <svg viewBox="0 0 24 24" className="w-10 h-10 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.75 4h-1.5a.75.75 0 0 0-.75.75v14.5c0 .414.336.75.75.75h1.5a.75.75 0 0 0 .75-.75V4.75a.75.75 0 0 0-.75-.75zM4 12.75v-1.5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75H4.75a.75.75 0 0 1-.75-.75z" />
              </svg>
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">GlassPay</h1>
            <p className="text-slate-500 dark:text-gray-500 font-bold uppercase tracking-[0.2em] text-[10px]">Premium Financial Tracker</p>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
            {mode === 'signup' && (
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  className="w-full pl-12 pr-4 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 focus:ring-4 focus:ring-sky-500/10 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all placeholder-gray-400"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                required
                className="w-full pl-12 pr-4 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 focus:ring-4 focus:ring-sky-500/10 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all placeholder-gray-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-sky-500 transition-colors" size={18} />
              <input
                type="password"
                placeholder="Password"
                required
                className="w-full pl-12 pr-4 py-4 glass bg-white/50 dark:bg-white/5 rounded-2xl border-white/20 dark:border-white/10 focus:ring-4 focus:ring-sky-500/10 outline-none text-sm font-bold text-gray-900 dark:text-white transition-all placeholder-gray-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-sky-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-sky-500/30 hover:bg-sky-600 hover:translate-y-[-2px] active:scale-[0.98] transition-all"
            >
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
            <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest">or continue with</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => googleLogin()}
            className="w-full flex items-center justify-center gap-3 py-4 glass bg-white/60 dark:bg-white/5 rounded-2xl border-white/40 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white/10 transition-all font-bold text-sm text-slate-700 dark:text-gray-300 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-8 text-[11px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest text-center">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="ml-2 text-sky-500 hover:text-sky-600 transition-colors"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
