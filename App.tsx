
import React, { useState, useCallback, useEffect } from 'react';

import { ModelType, HistoryItem, GenerationSettings, SiteConfig, GenerationType, Language, UserSettings, Message, AppNotification } from './types.ts';

import Sidebar from './components/Sidebar.tsx';

import MainPreview from './components/MainPreview.tsx';

import RightPanel from './components/RightPanel.tsx';

import Header from './components/Header.tsx';

import AccountModal, { AccountTab } from './components/AccountModal.tsx';

import AuthScreen from './components/AuthScreen.tsx';

import AdminPanel from './components/AdminPanel.tsx';

import StoryViewer from './components/StoryViewer.tsx';

import ToastNotification from './components/ToastNotification.tsx';

import SpeechModal from './components/SpeechModal.tsx';

import { GoogleGenAI, Modality } from "@google/genai";

import { Fingerprint } from 'lucide-react';

import { translations } from './translations.ts';

import { removeBackground } from "@imgly/background-removal";

// Helper functions for audio processing

function decode(base64: string) {

const binaryString = atob(base64);

const len = binaryString.length;

const bytes = new Uint8Array(len);

for (let i = 0; i < len; i++) {

bytes\[i\] = binaryString.charCodeAt(i);
}

return bytes;

}

async function decodeAudioData(

data: Uint8Array,

ctx: AudioContext,

sampleRate: number,

numChannels: number,

): Promise {

const dataInt16 = new Int16Array(data.buffer);

const frameCount = dataInt16.length / numChannels;

const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

for (let channel = 0; channel < numChannels; channel++) {

const channelData = buffer.getChannelData(channel); for (let i = 0; i < frameCount; i++) { channelData\[i\] = dataInt16\[i \* numChannels + channel\] / 32768.0; }
}

return buffer;

}

const safeParse = (key: string, defaultValue: any) => {

try {

const item = localStorage.getItem(key); if (!item) return defaultValue; const parsed = JSON.parse(item); return parsed;
} catch (e) {

return defaultValue;
}

};

const App: React.FC = () => {

const [user, setUser] = useState(() => safeParse('imagine_ai_user', null));

const [language, setLanguage] = useState(() => safeParse('imagine_ai_lang', 'ar'));

const [history, setHistory] = useState<HistoryItem[]>(() => safeParse('imagine_ai_history', []));

const [notifications, setNotifications] = useState<AppNotification[]>([]);

const [messages, setMessages] = useState<Message[]>(() => safeParse('imagine_ai_messages', []));

const [allUsers, setAllUsers] = useState<any[]>(() => safeParse('site_verified_users', []));

const [bannedEmails, setBannedEmails] = useState<string[]>(() => safeParse('banned_emails', []));

const [adminIdentity, setAdminIdentity] = useState(() => safeParse('admin_identity', {

email: "Mohammedzarzor26@gmail.com", password: "Mah7foud23"
}));

const [siteConfig, setSiteConfig] = useState(() => safeParse('imagine_ai_config', {

seo_title: 'Imagine AI', seo_desc: 'Professional AI Art', global_html: '', custom_css: '', custom_js: '', ux_blur_intensity: '20px', ux_accent_color: '#6366f1', manager_name: 'Ahmad kharbicha', manager_dob: 'Jan 1, 1987', manager_location: 'SAHTEREANN', manager_pic: 'https://i.pravatar.cc/150?u=manager', site_logo_scale: 1.0, global_api_key: ''
}));

const [userSettings, setUserSettings] = useState(() => safeParse('imagine_ai_settings', {

theme: 'dark', language: 'ar', fontFamily: 'modern', fontSize: 'medium', notificationSounds: true, autoSaveSession: true, imageQuality: 'high', modelStrategy: 'artistic', showTooltips: true, contentProtection: false, privacyMode: false, advancedMode: false
}));

const [isGenerating, setIsGenerating] = useState(false);

const [isSpeechGenerating, setIsSpeechGenerating] = useState(false);

const [isSpeechModalOpen, setIsSpeechModalOpen] = useState(false);

const [loadingStep, setLoadingStep] = useState(0);

const [toast, setToast] = useState<AppNotification | null>(null);

const [activeImage, setActiveImage] = useState<string | null>(null);

const [originalImage, setOriginalImage] = useState<string | null>(null);

const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);

const [isGalleryOpen, setIsGalleryOpen] = useState(false);

const [isAccountOpen, setIsAccountOpen] = useState(false);

const [accountTab, setAccountTab] = useState('profile');

const [isAdminOpen, setIsAdminOpen] = useState(false);

const [isStoryOpen, setIsStoryOpen] = useState(false);

const [settings, setSettings] = useState({

prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
});

useEffect(() => {

let interval: any; if (isGenerating) { interval = setInterval(() => { setLoadingStep(prev => (prev + 1) % translations\[language\].loadingMessages.length); }, 2500); } else { setLoadingStep(0); } return () => clearInterval(interval);
}, [isGenerating, language]);

const addNotification = useCallback((title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {

const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type }; setNotifications(prev => \[newNotif, ...prev\]); setToast(newNotif);
}, []);

const ensureApiKey = async () => {

// @ts-ignore const hasKey = await window.aistudio?.hasSelectedApiKey(); if (!hasKey) { // @ts-ignore await window.aistudio?.openSelectKey(); return true; // Proceed assuming selection or handling } return true;
};

const handleGenerateSpeech = async (text: string, voice: string) => {

if (!text.trim()) return; await ensureApiKey(); setIsSpeechGenerating(true); try { const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' }); const response = await ai.models.generateContent({ model: "gemini-2.5-flash-preview-tts", contents: \[{ parts: \[{ text: \`Say clearly: ${text}\` }\] }\], config: { responseModalities: \[Modality.AUDIO\], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice || 'Kore' }, }, }, }, }); const base64Audio = response.candidates?.\[0\]?.content?.parts?.\[0\]?.inlineData?.data; if (base64Audio) { const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }); const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1); const source = audioCtx.createBufferSource(); source.buffer = audioBuffer; source.connect(audioCtx.destination); source.start(); addNotification(language === 'ar' ? 'تم التوليد' : 'Generated', language === 'ar' ? 'جاري تشغيل الصوت الآن' : 'Playing audio now', 'success'); } } catch (err: any) { console.error(err); if (err.message?.includes("Requested entity was not found")) { // @ts-ignore await window.aistudio?.openSelectKey(); } addNotification('Error', language === 'ar' ? 'فشل توليد الصوت' : 'Failed to generate speech', 'system'); } finally { setIsSpeechGenerating(false); }
};

const handleImageAction = useCallback(async (type: GenerationType, customPrompt?: string) => {

const sourceImage = activeImage || settings.uploadedImage; if (!sourceImage) { addNotification(language === 'ar' ? 'تنبيه' : 'Alert', language === 'ar' ? 'يرجى رفع صورة أولاً' : 'Please upload an image first', 'system'); return; } setIsGenerating(true); if (type === 'Cleaned') { try { const blob = await removeBackground(sourceImage); const reader = new FileReader(); reader.onloadend = () => { const resultUrl = reader.result as string; setActiveImage(resultUrl); const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: resultUrl, prompt: 'Removed Background', timestamp: new Date(), model: 'Plus', type: 'Cleaned' }; setHistory(prev => \[newItem, ...prev\].slice(0, 30)); setIsGenerating(false); }; reader.readAsDataURL(blob); } catch (err) { console.error(err); addNotification('Error', 'Background removal failed', 'system'); setIsGenerating(false); } return; } try { await ensureApiKey(); const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' }); const promptText = customPrompt || (language === 'ar' ? 'تحسين جودة الصورة' : 'Enhance image quality'); const mimeType = sourceImage.split(';')\[0\].split(':')\[1\] || 'image/png'; const base64Data = sourceImage.split(',')\[1\]; const response = await ai.models.generateContent({ model: 'gemini-3-pro-image-preview', // Upgrade for actions requested contents: { parts: \[ { inlineData: { data: base64Data, mimeType } }, { text: promptText } \] }, config: { imageConfig: { aspectRatio: (settings.aspectRatio as any) || "1:1", imageSize: "1K" } } }); let resultUrl = ''; if (response.candidates?.\[0\]?.content?.parts) { for (const part of response.candidates\[0\].content.parts) { if (part.inlineData) { resultUrl = \`data:${part.inlineData.mimeType};base64,${part.inlineData.data}\`; break; } } } if (resultUrl) { setActiveImage(resultUrl); const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: resultUrl, prompt: promptText, timestamp: new Date(), model: 'Plus', type }; setHistory(prev => \[newItem, ...prev\].slice(0, 30)); } } catch (error: any) { console.error("Action error:", error); if (error.message?.includes("Requested entity was not found")) { // @ts-ignore await window.aistudio?.openSelectKey(); } addNotification('Error', language === 'ar' ? 'فشلت معالجة الصورة' : 'Image processing failed', 'system'); } finally { setIsGenerating(false); }
}, [activeImage, settings.uploadedImage, settings.aspectRatio, language, addNotification]);

const handleGenerate = useCallback(async (customPrompt?: string, isLogo: boolean = false) => {

const p = customPrompt || settings.prompt; if (!p.trim()) return; setIsGenerating(true); setActiveImage(null); try { await ensureApiKey(); const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' }); const finalPrompt = isLogo ? \`Generate a professional high-quality logo for: ${p}\` : p; const response = await ai.models.generateContent({ model: 'gemini-3-pro-image-preview', // High quality requested resolution 2K contents: { parts: \[{ text: finalPrompt }\] }, config: { imageConfig: { aspectRatio: (settings.aspectRatio as any) || "1:1", imageSize: "2K" } } }); let resultUrl = ''; if (response.candidates?.\[0\]?.content?.parts) { for (const part of response.candidates\[0\].content.parts) { if (part.inlineData) { resultUrl = \`data:${part.inlineData.mimeType};base64,${part.inlineData.data}\`; break; } } } if (resultUrl) { setActiveImage(resultUrl); setOriginalImage(resultUrl); const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: resultUrl, prompt: p, timestamp: new Date(), model: settings.model, type: isLogo ? 'LogoCreation' : 'Generated' }; setHistory(prev => { const updated = \[newItem, ...prev\].slice(0, 30); localStorage.setItem('imagine_ai_history', JSON.stringify(updated)); return updated; }); } } catch (e: any) { console.error("Generation error:", e); if (e.message?.includes("Requested entity was not found")) { // @ts-ignore await window.aistudio?.openSelectKey(); } addNotification('Error', language === 'ar' ? 'فشل توليد الصورة' : 'Failed to generate image', 'system'); } finally { setIsGenerating(false); }
}, [settings.prompt, settings.aspectRatio, settings.model, language, addNotification]);

useEffect(() => {

if (user) localStorage.setItem('imagine_ai_user', JSON.stringify(user)); if (siteConfig) localStorage.setItem('imagine_ai_config', JSON.stringify(siteConfig)); if (adminIdentity) localStorage.setItem('admin_identity', JSON.stringify(adminIdentity));
}, [user, siteConfig, adminIdentity]);

if (!user) return ;

return (

<div className={\`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}\`}> {siteConfig.global_html && <div dangerouslySetInnerHTML={{ \__html: siteConfig.global_html }} />} <Header credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))} onToggleLang={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')} onUpgrade={() => { setAccountTab('credits'); setIsAccountOpen(true); }} onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }} onOpenInbox={() => { setAccountTab('manager'); setIsAccountOpen(true); }} onOpenStory={() => setIsStoryOpen(true)} onLogout={() => setUser(null)} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onAdmin={() => setIsAdminOpen(true)} /> <div className="flex flex-1 overflow-hidden relative"> <Sidebar isOpen={isSidebarOpen} settings={settings} setSettings={setSettings} onGenerate={() => handleGenerate()} onUpload={(url) => { setActiveImage(url); setSettings(prev => ({ ...prev, uploadedImage: url })); }} isGenerating={isGenerating} language={language} onClose={() => setIsSidebarOpen(false)} /> <MainPreview imageUrl={activeImage} originalImageUrl={originalImage} isGenerating={isGenerating} loadingStep={loadingStep} prompt={settings.prompt} language={language} onToggleGallery={() => setIsGalleryOpen(!isGalleryOpen)} onRemoveBackground={() => handleImageAction('Cleaned')} onUpscale={() => handleImageAction('Upscaled')} onRemoveWatermark={() => handleImageAction('WatermarkRemoved')} onRestore={() => handleImageAction('Restored')} onColorize={() => handleImageAction('Colorized')} onCartoonize={() => handleImageAction('Cartoonized')} onMagicEraser={() => handleImageAction('ObjectRemoved')} onSmartEdit={() => { const p = prompt(translations\[language\].smartEdit + '?'); if (p) handleImageAction('Edited', p); }} onVirtualTryOn={() => handleImageAction('VirtualTryOn')} onAddSunglasses={() => handleImageAction('AddSunglasses')} onCreateLogo={() => { const n = prompt(translations\[language\].logoPrompt); if (n) handleGenerate(\`Logo for ${n}\`, true); }} onTextToSpeech={() => setIsSpeechModalOpen(true)} /> <RightPanel isOpen={isGalleryOpen} history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(h => h.filter(x => x.id !== id))} language={language} onClose={() => setIsGalleryOpen(false)} /> </div> <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))} siteConfig={siteConfig} allMessages={messages} onSendMessage={(content) => { const newMessage: Message = { id: Date.now().toString(), senderName: user?.name, senderEmail: user?.email, content, timestamp: new Date(), isRead: false }; setMessages(prev => { const updated = \[newMessage, ...prev\]; localStorage.setItem('imagine_ai_messages', JSON.stringify(updated)); return updated; }); addNotification(language === 'ar' ? 'تم الإرسال' : 'Sent', language === 'ar' ? 'وصلت رسالتك للمدير' : 'Message sent to manager', 'success'); }} /> {isAdminOpen && <AdminPanel config={siteConfig} setConfig={setSiteConfig} messages={messages} setMessages={setMessages} onClose={() => setIsAdminOpen(false)} language={language} allUsers={allUsers} setAllUsers={setAllUsers} bannedEmails={bannedEmails} setBannedEmails={setBannedEmails} adminIdentity={adminIdentity} setAdminIdentity={setAdminIdentity} />} {isStoryOpen && siteConfig.global_story?.active && ( <StoryViewer story={{...siteConfig.global_story, timestamp: Date.now()}} onClose={() => { setIsStoryOpen(false); const seen = JSON.parse(localStorage.getItem('seen_stories') || '\[\]'); if (!seen.includes(siteConfig.global_story?.id)) seen.push(siteConfig.global_story?.id); localStorage.setItem('seen_stories', JSON.stringify(seen)); }} language={language} siteConfig={siteConfig} /> )} <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} /> {isSpeechModalOpen && <SpeechModal isOpen={isSpeechModalOpen} onClose={() => setIsSpeechModalOpen(false)} onGenerate={handleGenerateSpeech} language={language} isGenerating={isSpeechGenerating} />} {user?.isAdmin && ( <div className="fixed bottom-4 left-4 z-\[9999\] opacity-0 hover:opacity-100 transition-opacity"> <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full shadow-lg border border-white/10"><Fingerprint className="w-5 h-5" /></button> </div> )} </div>
);

};

export default App;

