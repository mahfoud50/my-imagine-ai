
import React, { useState } from 'react';
import { Lock, X, ShieldCheck, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
  language: Language;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLogin, language }) => {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // قراءة أحدث بيانات هوية من التخزين، أو استخدام الافتراضية إذا لم توجد
    let savedAdmin;
    try {
      const stored = localStorage.getItem('admin_identity');
      savedAdmin = stored ? JSON.parse(stored) : { email: "Mohammedzarzor26@gmail.com", password: "Mah7foud23" };
    } catch (e) {
      savedAdmin = { email: "Mohammedzarzor26@gmail.com", password: "Mah7foud23" };
    }
    
    if (email.trim().toLowerCase() === savedAdmin.email.toLowerCase() && password === savedAdmin.password) {
      onLogin({
        email: savedAdmin.email,
        name: 'Mohammed Zarzor',
        username: 'admin',
        isAdmin: true
      });
      onClose();
    } else {
      setError(language === 'ar' ? 'بيانات الوصول السيادية غير صحيحة.' : ' Sovereign credentials invalid.');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl animate-in fade-in duration-300 cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 p-10 relative cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <div className="w-14 h-14 bg-slate-900 dark:bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-pulse">
            <Fingerprint className="w-7 h-7 text-indigo-400 dark:text-white" />
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{t.adminCoreAccess}</h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">{t.adminVerificationDesc}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.adminIdentityKey}</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full py-4 px-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl outline-none text-sm transition-all font-mono dark:text-white ${language === 'ar' ? 'text-right' : 'text-left'}`}
              placeholder="admin@imagine.ai"
              required
            />
          </div>

          <div className="space-y-2">
            <label className={`text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t.systemPassPhrase}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-4 px-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-2xl outline-none text-sm transition-all font-mono dark:text-white ${language === 'ar' ? 'text-right' : 'text-left'}`}
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400`}>
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <div className="p-4 bg-rose-50 text-rose-600 text-[11px] font-black rounded-2xl border border-rose-100">{error}</div>}

          <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-2xl flex items-center justify-center gap-2 group">
            {t.activateGodModeBtn}
            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
