
import React, { useState, useEffect, useCallback } from 'react';
import { Lock, X, ShieldCheck, Eye, EyeOff, Fingerprint, ShieldAlert, Timer } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any, directToAdmin?: boolean) => void;
  language: Language;
  adminIdentity: any;
}

interface SecurityState {
  attempts: number;
  blockUntil: number | null;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLogin, language, adminIdentity }) => {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [security, setSecurity] = useState<SecurityState>(() => {
    const saved = localStorage.getItem('admin_login_security');
    return saved ? JSON.parse(saved) : { attempts: 0, blockUntil: null };
  });
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  const isBlocked = security.blockUntil && security.blockUntil > Date.now();

  // تحديث عداد الوقت المتبقي في حال الحظر
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

    const isEmailCorrect = email.trim().toLowerCase() === adminIdentity.email.toLowerCase();
    const isPassCorrect = password === adminIdentity.password;

    if (isEmailCorrect && isPassCorrect) {
      // تصفير العداد عند النجاح
      const newState = { attempts: 0, blockUntil: null };
      setSecurity(newState);
      localStorage.setItem('admin_login_security', JSON.stringify(newState));
      
      onLogin({ email: adminIdentity.email, name: 'Mahfoud', username: 'admin', isAdmin: true }, true);
      onClose();
    } else {
      const newAttempts = security.attempts + 1;
      let newState: SecurityState;

      if (newAttempts >= 3) {
        const blockTime = Date.now() + (24 * 60 * 60 * 1000); // 24 ساعة
        newState = { attempts: newAttempts, blockUntil: blockTime };
        setError(t.tooManyAttempts);
      } else {
        newState = { attempts: newAttempts, blockUntil: null };
        setError(`${language === 'ar' ? 'بيانات الوصول غير صحيحة.' : 'Credentials invalid.'} (${t.attemptsRemaining}${3 - newAttempts})`);
      }

      setSecurity(newState);
      localStorage.setItem('admin_login_security', JSON.stringify(newState));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 border border-white/10 shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        
        {isBlocked && (
          <div className="absolute inset-0 bg-rose-600/10 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
             <Timer className="w-16 h-16 text-rose-500 mb-4 animate-pulse" />
             <h3 className="text-white font-black uppercase text-sm mb-2">{t.tooManyAttempts}</h3>
             <p className="text-slate-400 text-[10px] font-bold leading-relaxed">
               {t.blockedMessage}
               <span className="block text-xl text-rose-500 mt-2 font-black font-mono">{timeRemaining}</span>
             </p>
             <button onClick={onClose} className="mt-8 px-6 py-2 bg-white/10 text-white rounded-xl text-[10px] font-black hover:bg-white/20 transition-all uppercase">{t.close}</button>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <Fingerprint className={`w-14 h-14 ${isBlocked ? 'text-rose-500' : 'text-indigo-600 animate-pulse'}`} />
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><X className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Access Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-white/5 rounded-2xl dark:text-white text-xs outline-none focus:border-indigo-500 transition-all" 
              placeholder="admin@imagine.ai" 
              required 
              disabled={isBlocked}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-1">Pass-Phrase</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-white/5 rounded-2xl dark:text-white text-xs outline-none focus:border-indigo-500 transition-all" 
                placeholder="••••••••" 
                required 
                disabled={isBlocked}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && !isBlocked && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 animate-in slide-in-from-top-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <p className="text-rose-500 text-[9px] font-bold">{error}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isBlocked}
            className={`w-full py-5 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 transition-all active:scale-95 ${isBlocked ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
          >
            {t.activateGodModeBtn} <ShieldCheck className="w-4 h-4" />
          </button>
          
          {!isBlocked && security.attempts > 0 && (
            <p className="text-center text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
              {t.attemptsRemaining}{3 - security.attempts}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
