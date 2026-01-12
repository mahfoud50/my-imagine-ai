
import React, { useState } from 'react';
import { Lock, X, ShieldCheck, Eye, EyeOff, Fingerprint } from 'lucide-react';
import { Language } from '../types.ts';
import { translations } from '../translations.ts';

interface AdminLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (userData: any) => void;
  language: Language;
  adminIdentity: any;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ isOpen, onClose, onLogin, language, adminIdentity }) => {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim().toLowerCase() === adminIdentity.email.toLowerCase() && password === adminIdentity.password) {
      onLogin({ email: adminIdentity.email, name: 'Mahfoud', username: 'admin', isAdmin: true });
      onClose();
    } else {
      setError(language === 'ar' ? 'بيانات الوصول غير صحيحة.' : 'Credentials invalid.');
    }
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/98 backdrop-blur-2xl" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-10 border border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-8">
          <Fingerprint className="w-14 h-14 text-indigo-600 animate-pulse" />
          <button onClick={onClose} className="p-2 text-slate-400"><X className="w-6 h-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl dark:text-white" placeholder="admin@imagine.ai" required />
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-800 border rounded-2xl dark:text-white" placeholder="••••••••" required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
          </div>
          {error && <p className="text-rose-500 text-xs text-center">{error}</p>}
          <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2">
            {t.activateGodModeBtn} <ShieldCheck className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
