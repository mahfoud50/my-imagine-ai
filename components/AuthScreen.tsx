
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Mail, Lock, User, ArrowRight, ShieldCheck, Eye, EyeOff, Loader2, 
  Fingerprint, ShieldAlert, RefreshCcw, Timer, AlertCircle, CheckCircle, 
  AtSign, Monitor, Smartphone, Laptop, Apple, Sparkles,
  Circle, Square, Triangle, Star, Heart, Cloud, Ghost
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { Language, DeviceType, SiteConfig } from '../types.ts';
import { translations } from '../translations.ts';
import AdminLogin from './AdminLogin.tsx';

interface AuthScreenProps {
  onLogin: (userData: any, directToAdmin?: boolean) => void;
  language: Language;
  allUsers: any[];
  setAllUsers: (users: any[]) => void;
  bannedEmails: string[];
  adminIdentity: any;
  siteConfig?: SiteConfig;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, language, allUsers, setAllUsers, bannedEmails, adminIdentity, siteConfig }) => {
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
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // CAPTCHA States
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaTarget, setCaptchaTarget] = useState({ name: '', icon: null as any });
  const [captchaOptions, setCaptchaOptions] = useState<any[]>([]);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  const availableShapes = useMemo(() => [
    { nameAr: 'دائرة', nameEn: 'Circle', icon: Circle, id: 'circle' },
    { nameAr: 'مربع', nameEn: 'Square', icon: Square, id: 'square' },
    { nameAr: 'نجمة', nameEn: 'Star', icon: Star, id: 'star' },
    { nameAr: 'قلب', nameEn: 'Heart', icon: Heart, id: 'heart' },
    { nameAr: 'سحابة', nameEn: 'Cloud', icon: Cloud, id: 'cloud' },
    { nameAr: 'شبح', nameEn: 'Ghost', icon: Ghost, id: 'ghost' }
  ], []);

  const generateCaptcha = useCallback(() => {
    const shuffled = [...availableShapes].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);
    const target = selected[Math.floor(Math.random() * selected.length)];
    setCaptchaOptions(selected);
    setCaptchaTarget(target);
    setCaptchaVerified(false);
  }, [availableShapes]);

  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha, isLogin]);

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
    if (!captchaVerified) {
      setError(language === 'ar' ? 'يرجى إكمال التحقق البشري أولاً' : 'Please complete human verification first');
      return;
    }
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    if (bannedEmails.includes(email.toLowerCase().trim()) && email.toLowerCase() !== adminIdentity.email.toLowerCase()) {
        setError(language === 'ar' ? 'عذراً، هذا الحساب معلق حالياً من قبل الإدارة.' : 'Sorry, this account is currently suspended.');
        setIsLoading(false);
        return;
    }

    if (isLogin && email.toLowerCase() === adminIdentity.email.toLowerCase() && password === adminIdentity.password) {
        onLogin({ email, name: 'Mahfoud', username: 'admin', isAdmin: true, deviceType }, true);
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
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black p-4 overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-900/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {isVerifyingOtp ? (
        <div className="w-full max-w-md p-10 bg-slate-950 rounded-[3rem] text-center shadow-2xl border border-white/5 animate-in zoom-in-95 duration-300 relative">
            <div className="w-16 h-16 bg-sky-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShieldCheck className="w-8 h-8 text-sky-500" />
            </div>
            <h2 className="text-2xl font-black mb-2 text-white">{t.enterOtp}</h2>
            <p className="text-[11px] text-slate-500 mb-8">{language === 'ar' ? 'أدخل الرمز المرسل إلى بريدك لتأكيد الهوية' : 'Enter the code sent to your email to verify identity'}</p>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
                <input 
                  type="text" 
                  maxLength={6} 
                  value={enteredOtp} 
                  onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g,''))} 
                  className="w-full py-5 bg-slate-900 border-2 border-dashed border-white/10 rounded-2xl text-center text-4xl font-black text-white outline-none focus:border-sky-500 transition-all" 
                  placeholder="000000" 
                />
                <button type="submit" className="w-full py-5 bg-sky-500 text-white rounded-2xl font-black shadow-xl hover:bg-sky-600 transition-all active:scale-95">
                  {t.completeSignup}
                </button>
                {error && <p className="text-rose-500 text-xs font-bold animate-pulse">{error}</p>}
                
                <div className="pt-4">
                  {resendTimer > 0 ? (
                    <p className="text-[10px] font-bold text-slate-400">
                      {language === 'ar' ? 'يمكنك إعادة الإرسال بعد: ' : 'Resend available in: '}
                      <span className="text-sky-500">{resendTimer}s</span>
                    </p>
                  ) : (
                    <button 
                      type="button" 
                      onClick={() => sendOtpEmail(email, name)}
                      className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:underline"
                    >
                      {language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                    </button>
                  )}
                </div>
            </form>
        </div>
      ) : (
        <div className="w-full max-w-md bg-slate-950 rounded-[3rem] shadow-2xl border border-white/5 z-10 animate-in fade-in duration-500 overflow-hidden relative">
            <div className="p-8 md:p-10 flex flex-col items-center">
                
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-16 h-16 bg-sky-500 rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-sky-500/20 mb-4 animate-in slide-in-from-top-4 duration-700">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tighter">IMAGINE <span className="text-sky-500">AI</span></h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{isLogin ? t.creatorsLogin : t.startSailing}</p>
                </div>

                {successMsg && (
                  <div className="w-full p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 mb-6">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <p className="text-emerald-500 text-xs font-bold leading-tight">{successMsg}</p>
                  </div>
                )}

                <form onSubmit={handleAuthSubmit} className="space-y-4 w-full relative z-10">
                    
                    {!isLogin && (
                      <div className="grid grid-cols-1 gap-4 animate-in slide-in-from-bottom-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.fullName}</label>
                          <input type="text" required placeholder={t.fullNamePlaceholder} value={name} onChange={(e) => setName(e.target.value)} className={`w-full p-3.5 bg-black text-white rounded-xl border border-white/5 outline-none focus:border-sky-500 transition-all placeholder:text-slate-600 ${isRtl ? 'text-right' : 'text-left'}`} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.username}</label>
                          <input type="text" required placeholder={t.usernamePlaceholder} value={username} onChange={(e) => setUsername(e.target.value.replace(/\s+/g, '').toLowerCase())} className={`w-full p-3.5 bg-black text-white rounded-xl border border-white/5 outline-none focus:border-sky-500 transition-all placeholder:text-slate-600 ${isRtl ? 'text-right' : 'text-left'}`} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                      <input type="email" required placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className={`w-full p-3.5 bg-black text-white rounded-xl border border-white/5 outline-none focus:border-sky-500 transition-all placeholder:text-slate-600 ${isRtl ? 'text-right' : 'text-left'}`} />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Secure Password</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full p-3.5 bg-black text-white rounded-xl border border-white/5 outline-none focus:border-sky-500 transition-all placeholder:text-slate-600 ${isRtl ? 'text-right pr-3.5 pl-12' : 'text-left pl-3.5 pr-12'}`} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-500 hover:text-sky-400 transition-colors`}>
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* SPAM PROTECTION (CAPTCHA) SECTION */}
                    <div className="pt-2 pb-1 space-y-2 border-t border-white/5 mt-4 animate-in fade-in">
                       <div className="flex items-center justify-between px-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {isRtl ? `اضغط على شكل: ${captchaTarget.nameAr}` : `Click the shape: ${captchaTarget.nameEn}`}
                          </p>
                          <button type="button" onClick={generateCaptcha} className="text-sky-500 hover:rotate-180 transition-transform duration-500">
                             <RefreshCcw className="w-3 h-3" />
                          </button>
                       </div>
                       
                       <div className="grid grid-cols-4 gap-2 bg-black/40 p-2 rounded-2xl border border-white/5">
                          {captchaOptions.map((option) => (
                             <button
                               key={option.id}
                               type="button"
                               onClick={() => setCaptchaVerified(option.id === captchaTarget.id)}
                               className={`aspect-square rounded-xl flex items-center justify-center transition-all border ${captchaVerified && option.id === captchaTarget.id ? 'bg-emerald-600/20 border-emerald-500 text-emerald-500' : 'bg-white/5 border-transparent text-slate-500 hover:text-sky-400 hover:bg-white/10'}`}
                             >
                               <option.icon className={`w-5 h-5 ${captchaVerified && option.id === captchaTarget.id ? 'animate-bounce' : ''}`} />
                             </button>
                          ))}
                       </div>
                       {captchaVerified && (
                         <div className="flex items-center gap-1.5 px-2 animate-in slide-in-from-top-1">
                            <CheckCircle className="w-3 h-3 text-emerald-500" />
                            <span className="text-[8px] font-black text-emerald-500 uppercase">{isRtl ? 'تم التحقق بنجاح' : 'Verification Success'}</span>
                         </div>
                       )}
                    </div>

                    {isLogin && (
                      <div className="space-y-3 pt-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block text-center">{isRtl ? 'اختر الواجهة' : 'Select Interface'}</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button type="button" onClick={() => setDeviceType('pc')} className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${deviceType === 'pc' ? 'bg-sky-600/10 border-sky-600 text-sky-600' : 'bg-transparent border-white/5 text-slate-500'}`}>
                               <Laptop className="w-5 h-5 mb-1" />
                               <span className="text-[8px] font-black uppercase">Pc</span>
                            </button>
                            <button type="button" onClick={() => setDeviceType('android')} className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${deviceType === 'android' ? 'bg-emerald-600/10 border-emerald-600 text-emerald-600' : 'bg-transparent border-white/5 text-slate-500'}`}>
                               <Smartphone className="w-5 h-5 mb-1" />
                               <span className="text-[8px] font-black uppercase">Android</span>
                            </button>
                            <button type="button" onClick={() => setDeviceType('iphone')} className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all ${deviceType === 'iphone' ? 'bg-sky-600/10 border-sky-600 text-sky-600' : 'bg-transparent border-white/5 text-slate-500'}`}>
                               <Apple className="w-5 h-5 mb-1" />
                               <span className="text-[8px] font-black uppercase">iPhone</span>
                            </button>
                        </div>
                      </div>
                    )}

                    {!isLogin && (
                      <div className="space-y-1 animate-in slide-in-from-bottom-2">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">{t.confirmPassword}</label>
                        <input type="password" required placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={`w-full p-3.5 bg-black text-white rounded-xl border border-white/5 outline-none focus:border-sky-500 transition-all placeholder:text-slate-600 ${isRtl ? 'text-right' : 'text-left'}`} />
                      </div>
                    )}

                    {error && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-in shake">
                        <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                        <p className="text-rose-500 text-[10px] font-bold">{error}</p>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isLoading || !captchaVerified} 
                      className={`w-full py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 disabled:opacity-50 mt-4 group ${captchaVerified ? 'bg-sky-500 text-white shadow-sky-500/30 hover:bg-sky-600' : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'}`}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? t.loginBtn : t.signupBtn)}
                        <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isRtl ? 'rotate-180 group-hover:-translate-x-1' : ''}`} />
                    </button>
                    
                    <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccessMsg(''); }} className="w-full text-slate-500 text-[11px] mt-6 font-bold text-center group">
                        {isLogin ? t.noAccount : t.haveAccount} 
                        <span className="text-sky-400 mx-2 group-hover:underline transition-all underline-offset-4">{isLogin ? t.signupLink : t.loginLink}</span>
                    </button>

                    {/* SECRET GOD MODE BUTTON */}
                    <div className="flex justify-center mt-6">
                      <button 
                        type="button" 
                        onClick={() => setIsAdminModalOpen(true)} 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sky-500 opacity-0 hover:opacity-100 transition-all duration-1000 bg-white/5 border border-white/5 hover:bg-white/10 group/god"
                        title="GOD MODE"
                      >
                          <Fingerprint className="w-6 h-6 animate-pulse group-hover/god:scale-110 transition-transform" />
                      </button>
                    </div>
                </form>
            </div>
        </div>
      )}
      
      <AdminLogin 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        onLogin={onLogin} 
        language={language} 
        adminIdentity={adminIdentity} 
        siteConfig={siteConfig}
      />
    </div>
  );
};

export default AuthScreen;
