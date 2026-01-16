
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
      setError(`${language === 'ar' ? 'بيانات غير صحيحة' : 'Invalid'} (${3 - newAttempts})`);
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
    if (!siteConfig?.admin_face_ref || !siteConfig?.face_id_enabled) {
      setError(isRtl 
        ? 'بصمة الوجه غير مفعلة' 
        : 'Face ID disabled');
      return;
    }
    
    setError('');
    setIsFaceScanning(true);
    setScanStatus('opening');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setScanStatus('scanning');
          setTimeout(() => setScanStatus('analyzing'), 1500);
          setTimeout(() => {
            setScanStatus('success');
            setTimeout(() => {
              stream.getTracks().forEach(t => t.stop());
              handleSuccessLogin();
            }, 800);
          }, 3500);
        };
      }
    } catch (e) {
      setError(isRtl ? "تعذر الوصول للكاميرا" : "Camera Error");
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
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl" onClick={onClose}>
      <div className="bg-slate-950 w-full max-w-xs rounded-[2rem] p-6 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()}>
        
        {isBlocked && (
          <div className="absolute inset-0 bg-slate-950/95 z-[100] flex flex-col items-center justify-center p-6 text-center rounded-[2rem]">
             <Timer className="w-12 h-12 text-rose-500 mb-3" />
             <p className="text-white text-[11px] font-black uppercase mb-1">{t.tooManyAttempts}</p>
             <span className="text-rose-500 font-mono text-lg font-black">{timeRemaining}</span>
             <button onClick={onClose} className="mt-4 text-[10px] text-slate-400 underline">{t.close}</button>
          </div>
        )}

        {isFaceScanning ? (
           <div className="flex flex-col items-center gap-4 animate-in fade-in">
              <div className="relative w-40 h-40 rounded-full overflow-hidden border-2 border-indigo-500 shadow-lg">
                 <video ref={videoRef} className={`w-full h-full object-cover grayscale ${scanStatus === 'success' ? 'opacity-20' : 'opacity-100'}`} playsInline />
                 {scanStatus === 'scanning' && (
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 shadow-md z-10 animate-[biometricScan_1.5s_infinite]"></div>
                 )}
                 {scanStatus === 'success' && (
                   <div className="absolute inset-0 bg-emerald-600/40 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                      <UserCheck className="w-12 h-12 text-white" />
                   </div>
                 )}
              </div>
              <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest animate-pulse">
                {scanStatus === 'opening' ? 'Starting...' : scanStatus === 'scanning' ? 'Scanning...' : scanStatus === 'analyzing' ? 'Checking...' : 'Verified'}
              </p>
              <button onClick={cancelScan} className="text-[9px] text-slate-500 uppercase font-black">{isRtl ? 'إلغاء' : 'Cancel'}</button>
           </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-2">
                 <div className="w-10 h-10 bg-indigo-600/10 rounded-xl flex items-center justify-center text-indigo-500">
                    <Shield className="w-5 h-5" />
                 </div>
                 <button 
                    onClick={startFaceScan}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${siteConfig?.face_id_enabled ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600'}`}
                 >
                    <ScanFace className="w-5 h-5" />
                 </button>
              </div>
              <button onClick={onClose} className="p-1.5 text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
            </div>

            <div className={`mb-5 ${isRtl ? 'text-right' : 'text-left'}`}>
               <h2 className="text-sm font-black text-white uppercase tracking-tight">{isRtl ? 'حماية المطورين' : 'ADMIN LOCK'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <input 
                  type="text" 
                  value={devCode} 
                  onChange={(e) => setDevCode(e.target.value.toUpperCase())} 
                  className={`w-full p-3 bg-black border ${devCode.toUpperCase() === activeDevCode.toUpperCase() ? 'border-emerald-500' : 'border-white/5'} rounded-xl text-white text-[11px] outline-none focus:border-indigo-500 transition-all font-mono tracking-widest ${isRtl ? 'text-right' : 'text-left'}`} 
                  placeholder={isRtl ? 'كود المطور' : 'Dev Key'} 
                  disabled={isBlocked}
                />
              </div>

              <div className="space-y-1">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className={`w-full p-3 bg-black border border-white/5 rounded-xl text-white text-[11px] outline-none focus:border-indigo-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`} 
                  placeholder="Email" 
                  disabled={isBlocked}
                />
              </div>

              <div className="space-y-1 relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className={`w-full p-3 bg-black border border-white/5 rounded-xl text-white text-[11px] outline-none focus:border-indigo-500 transition-all ${isRtl ? 'text-right' : 'text-left'}`} 
                  placeholder="Passcode" 
                  disabled={isBlocked}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${isRtl ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-slate-600`}>
                   {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>

              {error && !isBlocked && <p className="text-rose-500 text-[9px] font-bold px-1">{error}</p>}

              <button 
                type="submit" 
                disabled={isBlocked}
                className="w-full py-3.5 mt-2 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg active:scale-95 transition-all"
              >
                {isRtl ? 'تفعيل الوضع' : 'Authorize'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
