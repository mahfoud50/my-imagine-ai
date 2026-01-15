
import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, Fingerprint, ShieldAlert, RefreshCcw, Timer, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, AtSign, Monitor, Smartphone, Tablet } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Language, DeviceType } from '../types.ts';
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
  const [deviceType, setDeviceType] = useState<DeviceType>('pc');
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
    setSuccessMsg('');
    setIsLoading(true);

    if (bannedEmails.includes(email.toLowerCase().trim()) && email.toLowerCase() !== adminIdentity.email.toLowerCase()) {
        setError(language === 'ar' ? 'عذراً، هذا الحساب معلق حالياً من قبل الإدارة.' : 'Sorry, this account is currently suspended.');
        setIsLoading(false);
        return;
    }

    if (isLogin && email.toLowerCase() === adminIdentity.email.toLowerCase() && password === adminIdentity.password) {
        onLogin({ email, name: 'Mahfoud', username: 'admin', isAdmin: true, deviceType }, false);
        return;
    }

    if (isLogin) {
        const found = allUsers.find((u: any) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
        if (found) onLogin({ ...found, isAdmin: false, deviceType }, false);
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
      const newUser = { email, name: name || 'User', username: username.trim().toLowerCase(), password, isAdmin: false, dataUsage: 0 };
      setAllUsers([...allUsers, newUser]);
      
      setSuccessMsg(language === 'ar' ? 'تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول الآن.' : 'Account created successfully! Please login now.');
      setIsVerifyingOtp(false);
      setIsLogin(true);
      setPassword(''); 
      setEnteredOtp('');
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
        <div className="w-full max-w-md p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] text-center shadow-2xl border dark:border-white/5 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">{t.enterOtp}</h2>
            <p className="text-[11px] text-slate-500 mb-8">{language === 'ar' ? 'أدخل الرمز المرسل إلى بريدك لتأكيد الهوية' : 'Enter the code sent to your email to verify identity'}</p>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input 
                  type="text" 
                  maxLength={6} 
                  value={enteredOtp} 
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g,''))} 
                  className="w-full py-5 bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-white/10 rounded-2xl text-center text-4xl font-black dark:text-white outline-none focus:border-indigo-500 transition-all" 
                  placeholder="000000" 
                />
                <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-xl hover:bg-indigo-700 transition-all active:scale-95">
                  {t.completeSignup}
                </button>
                {error && <p className="text-rose-500 text-xs font-bold animate-pulse">{error}</p>}
                
                <div className="pt-4">
                  {resendTimer > 0 ? (
                    <p className="text-[10px] font-bold text-slate-400">
                      {language === 'ar' ? 'يمكنك إعادة الإرسال بعد: ' : 'Resend available in: '}
                      <span className="text-indigo-500">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => sendOtpEmail(email, name)}
                      className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline"
                    >
                      {language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                    </button>
                  )}
                </div>
            </form>
        </div>
      ) : (
        <div className="w-full max-w-5xl flex bg-[#1e293b] rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 z-10 animate-in fade-in duration-500">
            <div className="hidden lg:flex w-5/12 bg-[#0f172a] p-16 flex-col justify-center text-white relative overflow-hidden">
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]"></div>
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-rose-600/10 rounded-full blur-[100px]"></div>
                
                <h2 className="text-3xl font-black relative z-10">IMAGINE <span className="text-indigo-400">AI</span></h2>
                <h1 className="text-5xl font-black mt-8 leading-tight relative z-10">{isRtl ? 'حوّل كلماتك إلى فن مذهل' : 'Transform words into stunning art'}</h1>
                <p className="mt-6 text-slate-400 font-medium relative z-10">{isRtl ? 'انضم إلى آلاف المبدعين واستخدم أقوى نماذج الذكاء الاصطناعي لتوليد الصور.' : 'Join thousands of creators and use the most powerful AI models to generate images.'}</p>
            </div>
            <div className="w-full lg:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-slate-900/50 relative">
                <form onSubmit={handleAuthSubmit} className="space-y-4 max-w-md mx-auto w-full relative z-10">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-white">{isLogin ? t.creatorsLogin : t.startSailing}</h2>
                      <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest">{isLogin ? (isRtl ? 'أهلاً بك مجدداً في مختبرك' : 'Welcome back to your lab') : (isRtl ? 'أنشئ حسابك المجاني اليوم' : 'Create your free account today')}</p>
                    </div>

                    {successMsg && (
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2">
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                        <p className="text-emerald-500 text-xs font-bold leading-tight">{successMsg}</p>
                      </div>
                    )}

                    {!isLogin && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.fullName}</label>
                          <input type="text" required placeholder={t.fullNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.username}</label>
                          <input type="text" required placeholder={t.usernamePlaceholder} value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                      <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Secure Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-indigo-400 transition-colors`}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* خيارات اختيار نوع الجهاز */}
                    <div className="space-y-2 pt-2">
                       <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{isRtl ? 'اختر واجهة الجهاز' : 'Choose Device UI'}</label>
                       <div className="grid grid-cols-3 gap-2">
                          <button 
                            type="button" 
                            onClick={() => setDeviceType('pc')} 
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${deviceType === 'pc' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-[#0f172a] border-white/5 text-slate-500 hover:border-indigo-500/50'}`}
                          >
                             <Monitor className="w-5 h-5 mb-1" />
                             <span className="text-[8px] font-black uppercase">{isRtl ? 'حاسوب' : 'PC'}</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setDeviceType('android')} 
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${deviceType === 'android' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-[#0f172a] border-white/5 text-slate-500 hover:border-indigo-500/50'}`}
                          >
                             <Smartphone className="w-5 h-5 mb-1" />
                             <span className="text-[8px] font-black uppercase">{isRtl ? 'أندرويد' : 'Android'}</span>
                          </button>
                          <button 
                            type="button" 
                            onClick={() => setDeviceType('iphone')} 
                            className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${deviceType === 'iphone' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-[#0f172a] border-white/5 text-slate-500 hover:border-indigo-500/50'}`}
                          >
                             <Tablet className="w-5 h-5 mb-1" />
                             <span className="text-[8px] font-black uppercase">{isRtl ? 'آيفون' : 'iPhone'}</span>
                          </button>
                       </div>
                    </div>

                    {!isLogin && (
                      <div className="space-y-1 animate-in slide-in-from-bottom-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.confirmPassword}</label>
                        <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-3.5 bg-[#0f172a] text-white rounded-xl border border-white/5 outline-none focus:border-indigo-500 transition-all" />
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-in shake">
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                        <p className="text-rose-500 text-[10px] font-bold">{error}</p>
                      </div>
                    )}

                    <button type="submit" disabled={isLoading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/10 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 mt-4">
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? t.loginBtn : t.signupBtn)}
                        <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} className="w-full text-slate-400 text-xs mt-6 font-bold text-center group">
                        {isLogin ? t.noAccount : t.haveAccount} 
                        <span className="text-indigo-400 mx-2 group-hover:underline">{isLogin ? t.signupLink : t.loginLink}</span>
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
