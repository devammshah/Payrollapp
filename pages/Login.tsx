
import React, { useState, useEffect } from 'react';
import { Lock, Mail, Wallet, ShieldCheck, Eye, EyeOff, Smartphone, Globe, X } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

type AuthStep = 'idle' | 'email-verifying' | 'oauth-popup' | 'biometric-verifying' | 'success';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [oauthProvider, setOauthProvider] = useState<'google' | 'apple' | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthStep('email-verifying');
    
    setTimeout(() => {
      if (email === 'admin@propay.com' && password === 'admin123') {
        setAuthStep('biometric-verifying');
        setTimeout(() => {
          setAuthStep('success');
          setTimeout(onLogin, 800);
        }, 1500);
      } else {
        setError('Invalid credentials. Hint: admin@propay.com / admin123');
        setAuthStep('idle');
      }
    }, 1200);
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    setOauthProvider(provider);
    setAuthStep('oauth-popup');
    
    // Simulate real OAuth popup delay and verification
    setTimeout(() => {
      setAuthStep('biometric-verifying');
      setTimeout(() => {
        setAuthStep('success');
        setTimeout(onLogin, 800);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 selection:bg-teal-500/30 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse delay-700" />

      <div className="max-w-[420px] w-full relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl rounded-[40px] shadow-2xl overflow-hidden border border-white/10">
          
          {/* Header */}
          <div className="p-10 text-center relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-teal-500 to-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-teal-500/40 relative">
               <div className="absolute inset-0 bg-white/20 rounded-3xl animate-ping opacity-20" />
               <Wallet className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">ProPay</h1>
            <p className="text-slate-400 text-xs mt-2 uppercase tracking-[0.3em] font-bold opacity-60">Enterprise Management</p>
          </div>

          <div className="px-8 pb-10 space-y-6">
            {authStep === 'idle' ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="bg-rose-500/10 text-rose-400 p-4 rounded-2xl text-xs border border-rose-500/20 flex items-start gap-3 animate-in slide-in-from-top-2">
                      <ShieldCheck size={18} className="shrink-0" />
                      <span className="font-semibold leading-relaxed">{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-500 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="block w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none text-sm text-white placeholder:text-slate-600"
                        placeholder="e.g. admin@propay.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                      <button type="button" className="text-[10px] font-bold text-teal-500 hover:text-teal-400 uppercase tracking-widest">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-teal-500 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-11 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all outline-none text-sm text-white placeholder:text-slate-600"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 active:scale-[0.97] mt-2 group"
                  >
                    SIGN INTO DASHBOARD
                    <div className="w-5 h-5 bg-slate-950/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                      <ChevronRight size={14} />
                    </div>
                  </button>
                </form>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-white/5"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Social Connect</span>
                  <div className="flex-grow border-t border-white/5"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SocialButton 
                    onClick={() => handleSocialLogin('google')} 
                    icon={<svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>}
                    label="Google"
                  />
                  <SocialButton 
                    onClick={() => handleSocialLogin('apple')} 
                    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05 1.61-3.23 1.61-1.14 0-1.53-.67-2.92-.67-1.41 0-1.87.65-2.93.67-1.15.02-2.36-.75-3.41-1.74-2.14-2.02-3.71-5.71-3.71-8.91 0-5.18 3.21-7.91 6.27-7.91 1.61 0 2.51.93 3.75.93 1.15 0 1.94-.93 3.74-.93 1.34 0 2.53.58 3.32 1.41-3.22 1.91-2.71 6.56.55 7.89-1.04 2.53-2.34 5.31-3.6 7.5l.01.1zm-4.32-15.54c1.1-.01 2.22-.72 2.87-1.6 1-.36 1.46-1.39 1.46-1.39s-1.08.06-2.11.75c-.65.43-1.24 1.32-1.24 1.32s.11.83.1 1.19-.08.62.92-.27z"/></svg>}
                    label="Apple ID"
                    isDark
                  />
                </div>
              </>
            ) : (
              <AuthTransition step={authStep} provider={oauthProvider} />
            )}
          </div>
        </div>
        <p className="mt-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
          Powered by ProPay Security Engine &bull; v4.2
        </p>
      </div>
    </div>
  );
};

const SocialButton = ({ icon, label, onClick, isDark }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all active:scale-95 border ${
      isDark ? 'bg-white/10 border-white/10 text-white hover:bg-white/20' : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span className="text-xs font-black">{label}</span>
  </button>
);

const AuthTransition = ({ step, provider }: { step: AuthStep, provider: any }) => {
  const titles: Record<AuthStep, string> = {
    'email-verifying': 'Verifying Identity',
    'oauth-popup': `Connecting to ${provider}`,
    'biometric-verifying': 'Biometric Security Check',
    'success': 'Access Granted',
    'idle': ''
  };

  const icons: Record<AuthStep, any> = {
    'email-verifying': <Globe className="w-12 h-12 text-teal-500 animate-spin" />,
    'oauth-popup': <Smartphone className="w-12 h-12 text-teal-500 animate-bounce" />,
    'biometric-verifying': <ShieldCheck className="w-12 h-12 text-teal-500 animate-pulse" />,
    'success': <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center animate-in zoom-in"><X className="text-slate-900 rotate-45" size={32} /></div>,
    'idle': null
  };

  return (
    <div className="py-12 flex flex-col items-center text-center space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
        <div className="relative">{icons[step]}</div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-black text-white">{titles[step]}</h2>
        <p className="text-slate-500 text-xs font-medium max-w-[200px]">
          {step === 'success' ? 'Redirecting to your dashboard...' : 'Please wait while we secure your connection.'}
        </p>
      </div>
      {step !== 'success' && (
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{animationDelay: '0ms'}} />
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{animationDelay: '150ms'}} />
          <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{animationDelay: '300ms'}} />
        </div>
      )}
    </div>
  );
};

const ChevronRight = ({ size, className }: any) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default Login;
