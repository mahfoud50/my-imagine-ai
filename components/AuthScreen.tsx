
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, Fingerprint, ShieldAlert, RefreshCcw, Timer, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, AtSign } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';
import AdminLogin from './AdminLogin.tsx';

interface AuthScreenProps {
  onLogin: (userData: any, directToAdmin?: boolean) => void;
  language: Language;
  allUsers: any[];
  setAllUsers: (users: any[]) => void;
  bannedEmails: string[];
  adminIdentity: any;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, language, allUsers, setAllUsers, bannedEmails, adminIdentity }) => {
  const t = translations[language];
  const [isLogin, setIsLogin] = useState(true);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  useEffect(() => {
    try { emailjs.init("h6eBNJ1NG-MbABBa2"); } catch (e) {}
  }, []);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendOtpEmail = useCallback(async (targetEmail: string, targetName: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp); 
    try {
      await emailjs.send("service_0x2big8", "template_xrfgonk", {
        user_name: targetName || targetEmail.split('@')[0],
        otp_code: otp,
        email: targetEmail 
      });
      return true;
    } catch (err) {
      console.warn("OTP Send simulated due to failure", err);
      return true; 
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (bannedEmails.includes(email.toLowerCase().trim()) && email.toLowerCase() !== adminIdentity.email.toLowerCase()) {
        setError(language === 'ar' ? 'عذراً، هذا الحساب معلق حالياً من قبل الإدارة.' : 'Sorry, this account is currently suspended.');
        setIsLoading(false);
        return;
    }

    if (isLogin && email.toLowerCase() === adminIdentity.email.toLowerCase() && password === adminIdentity.password) {
        onLogin({ email, name: 'Mahfoud', username: 'admin', isAdmin: true }, false);
        return;
    }

    if (isLogin) {
        const found = allUsers.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
        if (found) onLogin({ ...found, isAdmin: false }, false);
        else setError(language === 'ar' ? 'بيانات الدخول غير صحيحة.' : 'Invalid credentials.');
        setIsLoading(false);
        return;
    }

    if (allUsers.some((u: any) => (u.username || '').toLowerCase() === username.trim().toLowerCase())) {
      setError(language === 'ar' ? 'اسم المستخدم هذا محجوز بالفعل' : 'Username taken');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) { 
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords mismatch'); 
      setIsLoading(false); 
      return; 
    }
    
    if (await sendOtpEmail(email, name)) {
      setIsVerifyingOtp(true);
      setResendTimer(60); 
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp === generatedOtp) {
      const newUser = { email, name: name || 'User', username: username.trim().toLowerCase(), password, isAdmin: false };
      setAllUsers([...allUsers, newUser]);
      onLogin(newUser, false);
    } else {
      setError(language === 'ar' ? 'رمز التحقق غير صحيح.' : 'Invalid OTP.');
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0f172a] p-4 overflow-hidden">
      <div className="fixed bottom-6 left-0 w-full flex justify-center z-[350] pointer-events-none">
        <button type="button" onClick={() => setIsAdminModalOpen(true)} className="pointer-events-auto flex items-center gap-2 px-6 py-2 rounded-full text-slate-700 hover:text-indigo-400 opacity-10 hover:opacity-100 group">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-mono font-black tracking-[0.3em] uppercase">Admin Core</span>
        </button>
      </div>

      {isVerifyingOtp ? (
        <div className="w-full max-w-md p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] text-center shadow-2xl border dark:border-white/5">
            <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{t.enterOtp}</h2>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input type="text" maxLength={6} value={enteredOtp} onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g,''))} className="w-full py-5 bg-slate-50 dark:bg-slate-800 border rounded-2xl text-center text-3xl font-black dark:text-white" placeholder="000000" />
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl">{t.completeSignup}</button>
                {error && <p className="text-rose-500 text-xs font-bold">{error}</p>}
            </form>
        </div>
      ) : (
        <div className="w-full max-w-5xl flex bg-[#1e293b] rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 z-10">
            <div className="hidden lg:flex w-5/12 bg-[#0f172a] p-16 flex-col justify-center text-white">
                <h2 className="text-3xl font-black">IMAGINE <span className="text-indigo-400">AI</span></h2>
                <h1 className="text-5xl font-black mt-8">{isRtl ? 'حوّل كلماتك إلى فن مذهل' : 'Transform words into stunning art'}</h1>
            </div>
            <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-slate-900/50">
                <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-black text-white text-center">{isLogin ? t.creatorsLogin : t.startSailing}</h2>
                    {!isLogin && (
                      <div className="grid grid-cols-1 gap-4">
                        <input type="text" required placeholder={t.fullNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500" />
                        <input type="text" required placeholder={t.usernamePlaceholder} value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500" />
                      </div>
                    )}
                    <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500" />
                    <div className="relative">
                      <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                    </div>
                    {!isLogin && <input type="password" required placeholder={t.confirmPassword} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500" />}
                    {error && <p className="text-rose-400 text-[10px] font-bold text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-3">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? t.loginBtn : t.signupBtn)}
                        <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                    <button type="button" onClick={() => setIsLogin(!isLogin)} className="w-full text-slate-400 text-xs mt-4 font-bold text-center">
                        {isLogin ? t.noAccount : t.haveAccount} <span className="text-indigo-400 mx-2">{isLogin ? t.signupLink : t.loginLink}</span>
                    </button>
                </form>
            </div>
        </div>
      )}
      <AdminLogin isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onLogin={onLogin} language={language} adminIdentity={adminIdentity} />
    </div>
  );
};

export default AuthScreen;
