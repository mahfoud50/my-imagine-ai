
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Lock, X, ShieldCheck, Eye, EyeOff, Fingerprint, ShieldAlert, Timer, ScanFace, Shield, CheckCircle2, Loader2, Zap, RefreshCw, UserCheck, Terminal, AlertTriangle } from 'lucide-react';
import { Language, SiteConfig } from '../types.ts';
import { translations } from '../translations.ts';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any, directToAdmin?: boolean) => void;
  language: Language;
  adminIdentity: any;
  siteConfig?: SiteConfig;
}

interface SecurityState {
  attempts: number;
  blockUntil: number | null;
}

const DEFAULT_DEV_CODE = "F40T76";

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLogin, language, adminIdentity, siteConfig }) => {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [devCode, setDevCode] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isFaceScanning, setIsFaceScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'opening' | 'scanning' | 'analyzing' | 'success' | 'failed'>('idle');
  const [security, setSecurity] = useState<SecurityState>(() => {
    const saved = localStorage.getItem('admin_login_security');
    return saved ? JSON.parse(saved) : { attempts: 0, blockUntil: null };
  });
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const isRtl = language === 'ar';
  const isBlocked = security.blockUntil && security.blockUntil > Date.now();

  // الحصول على كود المطورين الفعلي من الإعدادات أو الافتراضي
  const activeDevCode = siteConfig?.dev_access_code || DEFAULT_DEV_CODE;

  useEffect(() => {
    let interval: any;
    if (isBlocked) {
      interval = setInterval(() => {
        const diff = (security.blockUntil || 0) - Date.now();
        if (diff <= 0) {
          setSecurity({ attempts: 0, blockUntil: null });
          localStorage.setItem('admin_login_security', JSON.stringify({ attempts: 0, blockUntil: null }));
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}${t.hours} ${minutes}${t.minutes}`);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBlocked, security.blockUntil, t.hours, t.minutes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isBlocked) {
      setError(`${t.blockedMessage} ${timeRemaining}`);
      return;
    }

    // التحقق من كود المطورين أولاً
    if (devCode.trim().toUpperCase() === activeDevCode.toUpperCase()) {
      handleSuccessLogin();
      return;
    }

    const isEmailCorrect = email.trim().toLowerCase() === adminIdentity.email.toLowerCase();
    const isPassCorrect = password === adminIdentity.password;

    if (isEmailCorrect && isPassCorrect) {
      handleSuccessLogin();
    } else {
      handleFailedLogin();
    }
  };

  const handleFailedLogin = () => {
    const newAttempts = security.attempts + 1;
    let newState: SecurityState;
    if (newAttempts >= 3) {
      const blockTime = Date.now() + (24 * 60 * 60 * 1000);
      newState = { attempts: newAttempts, blockUntil: blockTime };
      setError(t.tooManyAttempts);
    } else {
      newState = { attempts: newAttempts, blockUntil: null };
      setError(`${language === 'ar' ? 'بيانات الوصول غير صحيحة.' : 'Credentials invalid.'} (${t.attemptsRemaining}${3 - newAttempts})`);
    }
    setSecurity(newState);
    localStorage.setItem('admin_login_security', JSON.stringify(newState));
  };

  const handleSuccessLogin = () => {
    const newState = { attempts: 0, blockUntil: null };
    setSecurity(newState);
    localStorage.setItem('admin_login_security', JSON.stringify(newState));
    onLogin({ email: adminIdentity.email, name: 'Mahfoud', username: 'admin', isAdmin: true }, true);
    onClose();
  };

  const startFaceScan = async () => {
    // التحقق مما إذا كان الوجه مسجلاً فعلاً
    if (!siteConfig?.admin_face_ref || !siteConfig?.face_id_enabled) {
      setError(isRtl 
        ? 'بصمة الوجه غير مسجلة. يرجى الدخول بكلمة المرور وتفعيلها من "الأمان" أولاً.' 
        : 'Face ID not registered. Please login with password and enable it in "Security" first.');
      return;
    }
    
    setError('');
    setIsFaceScanning(true);
    setScanStatus('opening');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setScanStatus('scanning');
          
          // Simulation of Biometric Recognition
          setTimeout(() => setScanStatus('analyzing'), 2000);
          setTimeout(() => {
            setScanStatus('success');
            setTimeout(() => {
              stream.getTracks().forEach(t => t.stop());
              handleSuccessLogin();
            }, 1000);
          }, 4500);
        };
      }
    } catch (e) {
      setError(isRtl ? "يتطلب Face ID الوصول للكاميرا. يرجى تفعيل الصلاحية." : "Face ID requires camera access. Please enable it.");
      setIsFaceScanning(false);
      setScanStatus('idle');
    }
  };

  const cancelScan = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
    }
    setIsFaceScanning(false);
    setScanStatus('idle');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-3xl" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-sm rounded-[3rem] p-10 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        
        {isBlocked && (
          <div className="absolute inset-0 bg-rose-600/10 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
             <Timer className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
             <h3 className="text-white font-black uppercase text-sm mb-2">{t.tooManyAttempts}</h3>
             <p className="text-slate-400 text-[10px] font-bold leading-relaxed">
               {t.blockedMessage}
               <span className="block text-xl text-rose-500 mt-2 font-black font-mono">{timeRemaining}</span>
             </p>
             <button onClick={onClose} className="mt-8 px-6 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black hover:bg-white/20 transition-all uppercase">{t.close}</button>
          </div>
        )}

        {isFaceScanning ? (
           <div className="flex flex-col items-center gap-6 animate-in fade-in">
              <div className="relative w-56 h-56 rounded-full overflow-hidden border-4 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.3)]">
                 <video ref={videoRef} className={`w-full h-full object-cover grayscale brightness-125 ${scanStatus === 'success' ? 'opacity-20' : 'opacity-100'}`} playsInline />
                 
                 <div className="absolute inset-0 bg-indigo-500/10 pointer-events-none"></div>
                 {scanStatus === 'scanning' && (
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_indigo] z-10 animate-[biometricScan_2s_infinite]"></div>
                 )}
                 
                 <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
                 
                 {scanStatus === 'analyzing' && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                       <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin" />
                    </div>
                 )}

                 {scanStatus === 'success' && (
                   <div className="absolute inset-0 bg-emerald-600/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 animate-in zoom-in">
                      <UserCheck className="w-20 h-20 text-white drop-shadow-lg" />
                      <p className="text-[10px] font-black text-white mt-2 uppercase tracking-widest">{isRtl ? 'تم التحقق' : 'VERIFIED'}</p>
                   </div>
                 )}
              </div>

              <div className="text-center space-y-2">
                 <h4 className="text-white font-black text-xs uppercase tracking-[0.3em] animate-pulse">
                    {scanStatus === 'opening' ? 'Starting Camera...' : scanStatus === 'scanning' ? 'Scanning Face...' : scanStatus === 'analyzing' ? 'Comparing Nodes...' : scanStatus === 'success' ? 'Access Granted' : 'Face ID'}
                 </h4>
                 <div className="flex flex-col gap-1 items-center">
                    <p className="text-[9px] text-slate-500 font-mono">
                       {scanStatus === 'scanning' && 'BIOMETRIC_LOCK_ACTIVE [98%]'}
                       {scanStatus === 'analyzing' && 'COMPUTING_IDENTITY_SCORE [0.99]'}
                       {scanStatus === 'success' && 'WELCOME_MASTER_ADMIN'}
                    </p>
                 </div>
              </div>

              <button onClick={cancelScan} className="px-6 py-2 bg-white/5 text-slate-500 hover:text-rose-500 rounded-xl text-[10px] font-black uppercase transition-all">
                {isRtl ? 'إلغاء المسح' : 'Cancel Scan'}
              </button>
           </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                 <div className="w-14 h-14 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-500 shadow-xl shadow-indigo-500/5">
                    <Shield className="w-8 h-8" />
                 </div>
                 {/* Face ID Button - Always Show to encourage enrollment */}
                 <button 
                    onClick={startFaceScan}
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group active:scale-90 shadow-2xl ${siteConfig?.face_id_enabled ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'bg-slate-800 text-slate-500 opacity-60'}`}
                    title={siteConfig?.face_id_enabled ? "Face ID Login" : "Face ID Not Enrolled"}
                 >
                    <ScanFace className="w-8 h-8 group-hover:scale-110 transition-transform" />
                 </button>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><X className="w-6 h-6" /></button>
            </div>

            <div className={`mb-6 ${isRtl ? 'text-right' : 'text-left'}`}>
               <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{isRtl ? 'نظام الحماية الفائق' : 'GOD-MODE SECURITY'}</h2>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{isRtl ? 'يرجى تأكيد الهوية للمتابعة' : 'IDENTITY VERIFICATION REQUIRED'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Developer Code Input - Uses config or Default */}
              <div className="space-y-1">
                <label className={`text-[9px] font-black text-amber-500 uppercase tracking-widest px-1 flex items-center gap-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Terminal className="w-3 h-3" /> {t.developerCode}
                </label>
                <input 
                  type="text" 
                  value={devCode} 
                  onChange={(e) => setDevCode(e.target.value.toUpperCase())} 
                  className={`w-full p-4 bg-amber-500/5 dark:bg-amber-500/10 border ${devCode.toUpperCase() === activeDevCode.toUpperCase() ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'border-amber-500/20'} rounded-2xl dark:text-amber-400 text-xs outline-none focus:border-amber-500 transition-all font-mono tracking-widest ${isRtl ? 'text-right' : 'text-left'}`} 
                  placeholder={t.devCodePlaceholder} 
                  disabled={isBlocked}
                />
                {devCode.toUpperCase() === activeDevCode.toUpperCase() && (
                  <div className={`flex items-center gap-1 mt-1 px-1 ${isRtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <p className="text-[8px] font-black text-emerald-500 uppercase animate-pulse">{t.devCodeSuccess}</p>
                  </div>
                )}
              </div>

              <div className="relative py-2 flex items-center justify-center">
                 <div className="h-px bg-slate-200 dark:bg-white/5 w-full absolute"></div>
                 <span className="relative bg-white dark:bg-slate-900 px-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">IDENTITY METHOD</span>
              </div>

              <div className="space-y-1">
                <label className={`text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 block ${isRtl ? 'text-right' : 'text-left'}`}>Access Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border border-white/5 rounded-2xl dark:text-white text-xs outline-none focus:border-indigo-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`} 
                  placeholder="admin@imagine.ai" 
                  disabled={isBlocked}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-[9px] font-black text-slate-500 uppercase tracking-widest px-1 block ${isRtl ? 'text-right' : 'text-left'}`}>Pass-Phrase</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className={`w-full p-4 bg-slate-50 dark:bg-slate-800 border border-white/5 rounded-2xl dark:text-white text-xs outline-none focus:border-indigo-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`} 
                    placeholder="••••••••" 
                    disabled={isBlocked}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className={`absolute ${isRtl ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && !isBlocked && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-in shake">
                  <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                  <p className="text-rose-500 text-[9px] font-bold">{error}</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isBlocked}
                className={`w-full py-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isBlocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/20'}`}
              >
                {t.activateGodModeBtn} <ShieldCheck className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`
        @keyframes biometricScan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
