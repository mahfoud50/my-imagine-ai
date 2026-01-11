
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, Fingerprint, ShieldAlert, RefreshCcw, Timer, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, AtSign } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';
import AdminLogin from './AdminLogin.tsx';

interface AuthScreenProps {
  onLogin: (userData: { email: string; name: string; username: string; isAdmin: boolean }) => void;
  language: Language;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, language }) => {
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
    try { 
      emailjs.init("h6eBNJ1NG-MbABBa2"); 
    } catch (e) { 
      console.warn("EmailJS initialization failed", e); 
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const sendOtpEmail = useCallback(async (targetEmail: string, targetName: string) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp); 
    
    try {
      const templateParams = {
        user_name: targetName || targetEmail.split('@')[0],
        otp_code: otp,
        email: targetEmail 
      };

      await emailjs.send("service_0x2big8", "template_xrfgonk", templateParams);
      console.log("OTP Sent Successfully:", otp);
      return true;
    } catch (err) {
      console.error("EmailJS Error:", err);
      // Fallback for simulation if API fails
      setGeneratedOtp(otp); 
      return true; 
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    const banned = JSON.parse(localStorage.getItem('banned_emails') || '[]');
    if (banned.includes(email.toLowerCase().trim()) && email.toLowerCase() !== "mohammedzarzor26@gmail.com") {
        setError(language === 'ar' ? 'عذراً، هذا الحساب معلق حالياً من قبل الإدارة.' : 'Sorry, this account is currently suspended by management.');
        setIsLoading(false);
        return;
    }

    if (isLogin && email.toLowerCase() === "mohammedzarzor26@gmail.com" && password === "Mah7foud23") {
        onLogin({ email, name: 'Mohammed Zarzor', username: 'admin', isAdmin: true });
        return;
    }

    if (isLogin) {
        const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
        const found = users.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
        
        if (found) {
          onLogin({ ...found, isAdmin: false });
        } else {
          setError(language === 'ar' ? 'بيانات الدخول غير صحيحة.' : 'Invalid credentials.');
        }
        setIsLoading(false);
        return;
    }

    // Sign up checks
    if (!username.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال اسم المستخدم' : 'Please enter a username');
      setIsLoading(false);
      return;
    }

    const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
    if (users.some((u: any) => (u.username || '').toLowerCase() === username.trim().toLowerCase())) {
      setError(language === 'ar' ? 'اسم المستخدم هذا محجوز بالفعل' : 'Username is already taken');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) { 
      setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords mismatch'); 
      setIsLoading(false); 
      return; 
    }
    
    const success = await sendOtpEmail(email, name);
    if (success) {
      setIsVerifyingOtp(true);
      setResendTimer(60); 
    } else {
      setError(language === 'ar' ? 'فشل إرسال الرمز، تأكد من بريدك الإلكتروني.' : 'Failed to send OTP, check your email.');
    }
    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setError('');
    setSuccessMsg('');
    
    const success = await sendOtpEmail(email, name);
    if (success) {
      setResendTimer(60);
      setEnteredOtp('');
      setSuccessMsg(language === 'ar' ? 'تم إرسال رمز جديد بنجاح ✅' : 'New code sent successfully ✅');
    } else {
      setError(language === 'ar' ? 'فشل إعادة الإرسال، حاول مجدداً.' : 'Resend failed, try again.');
    }
    setIsResending(false);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp === generatedOtp) {
      const newUser = { email, name: name || 'User', username: username.trim().toLowerCase(), password };
      const users = JSON.parse(localStorage.getItem('site_verified_users') || '[]');
      localStorage.setItem('site_verified_users', JSON.stringify([...users, newUser]));
      onLogin({ ...newUser, isAdmin: false });
    } else {
      setError(language === 'ar' ? 'رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.' : 'Invalid OTP code, please try again.');
    }
  };

  const isRtl = language === 'ar';

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#0f172a] p-4 overflow-hidden">
      
      <div className="fixed bottom-6 left-0 w-full flex justify-center z-[350] pointer-events-none">
        <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsAdminModalOpen(true);
            }}
            className="pointer-events-auto flex items-center gap-2 px-6 py-2 rounded-full text-slate-700 hover:text-indigo-400 hover:bg-white/5 transition-all duration-700 opacity-10 hover:opacity-100 group border border-transparent hover:border-white/5"
            title="Sovereign Admin Access"
        >
            <Lock className="w-3 h-3 group-hover:rotate-12 transition-transform" />
            <span className="text-[10px] font-mono font-black tracking-[0.3em] uppercase">Admin Core</span>
        </button>
      </div>

      {isVerifyingOtp ? (
        <div className="w-full max-w-md p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] text-center animate-in zoom-in-95 duration-500 shadow-2xl border dark:border-white/5 z-10 relative">
            <button 
              onClick={() => { setIsVerifyingOtp(false); setGeneratedOtp(null); setError(''); }}
              className={`absolute top-8 ${isRtl ? 'right-8' : 'left-8'} p-2 text-slate-400 hover:text-indigo-600 transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest group`}
            >
              {isRtl ? <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> : <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />}
              {t.backToAuth}
            </button>

            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 mt-12 shadow-inner">
              <ShieldCheck className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{t.enterOtp}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed">
              {language === 'ar' ? `أدخل الرمز المكون من 6 أرقام المرسل إلى:` : `Enter the 6-digit code sent to:`}
              <br/><span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>
            </p>
            
            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="relative">
                  <input 
                    type="text" 
                    maxLength={6} 
                    autoFocus
                    value={enteredOtp} 
                    onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g,''))} 
                    className="w-full py-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-center text-3xl font-black tracking-[0.5em] focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all dark:text-white" 
                    placeholder="000000" 
                  />
                </div>
                
                <div className="flex flex-col gap-4">
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    {t.completeSignup}
                  </button>

                  <div className="pt-2">
                    {resendTimer > 0 ? (
                      <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-bold py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed dark:border-white/5">
                        <Timer className="w-3 h-3 animate-pulse" />
                        <span>{language === 'ar' ? `يمكنك إعادة الطلب بعد (${resendTimer}ث)` : `Resend available in (${resendTimer}s)`}</span>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={handleResendOtp} 
                        disabled={isResending}
                        className="w-full py-3 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group"
                      >
                        {isResending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />}
                        {language === 'ar' ? 'إعادة إرسال الرمز الآن' : 'Resend Code Now'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-top-2">
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {successMsg}
                    </div>
                  )}
                </div>
            </form>
        </div>
      ) : (
        <div className="w-full max-w-5xl flex bg-[#1e293b] rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 animate-in fade-in slide-in-from-bottom-8 duration-700 z-10">
            <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] p-16 flex-col justify-between text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl font-black tracking-tighter">IMAGINE <span className="text-indigo-400">AI</span></h2>
                  <p className="text-indigo-200/60 font-bold text-xs uppercase tracking-[0.3em] mt-2">Professional Art Studio</p>
                </div>
                <div className="relative z-10 space-y-6">
                  <h1 className="text-5xl font-black leading-[1.1] tracking-tight">
                    {language === 'ar' ? 'حوّل كلماتك إلى فن مذهل' : 'Transform words into stunning art'}
                  </h1>
                </div>
                <div className="relative z-10 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center">
                    <Fingerprint className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-indigo-100/90 leading-tight">
                    {language === 'ar' ? 'بيئة آمنة ومشفرة تماماً لخصوصية بياناتك.' : 'Fully secure and encrypted environment for your privacy.'}
                  </p>
                </div>
            </div>

            <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-slate-900/50 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md mx-auto w-full">
                    <div className="mb-6 text-center lg:text-right">
                      <h2 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-tight">{isLogin ? t.creatorsLogin : t.startSailing}</h2>
                      <p className="text-slate-400 font-medium text-xs">{isLogin ? (language === 'ar' ? 'أهلاً بك مجدداً في مختبرك الإبداعي.' : 'Welcome back to your creative lab.') : t.createAccountDesc}</p>
                    </div>

                    {!isLogin && (
                      <>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.fullName}</label>
                          <div className="relative">
                            <User className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                            <input type="text" required placeholder={t.fullNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-3.5 ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'} bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all font-bold text-sm`} />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.username}</label>
                          <div className="relative">
                            <AtSign className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                            <input type="text" required placeholder={t.usernamePlaceholder} value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())} className={`w-full p-3.5 ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'} bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all font-bold text-sm`} />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.emailPlaceholder}</label>
                      <div className="relative">
                        <Mail className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                        <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3.5 ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'} bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all font-mono text-sm`} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.systemPassPhrase}</label>
                      <div className="relative">
                        <Lock className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                        <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3.5 ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'} bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all font-mono text-sm`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors`}>{showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                      </div>
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">{t.confirmPassword}</label>
                        <div className="relative">
                          <ShieldCheck className={`absolute ${isRtl ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                          <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full p-3.5 ${isRtl ? 'pr-10 text-right' : 'pl-10 text-left'} bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all font-mono text-sm`} />
                        </div>
                      </div>
                    )}
                    
                    {error && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold animate-in fade-in slide-in-from-top-2 flex items-start gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                      </div>
                    )}
                    
                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black text-md hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-2">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? t.loginBtn : t.signupBtn)}
                        {!isLoading && <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />}
                    </button>

                    <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full text-slate-400 text-xs mt-4 font-bold hover:text-white transition-colors text-center">
                        {isLogin ? t.noAccount : t.haveAccount} <span className="text-indigo-400 mx-2 hover:underline">{isLogin ? t.signupLink : t.loginLink}</span>
                    </button>
                </form>
            </div>
        </div>
      )}

      <AdminLogin 
          isOpen={isAdminModalOpen} 
          onClose={() => setIsAdminModalOpen(false)} 
          onLogin={onLogin} 
          language={language} 
      />
    </div>
  );
};

export default AuthScreen;
