
import React, { useState, useCallback, useEffect } from 'react';
import { ModelType, HistoryItem, GenerationSettings, SiteConfig, GenerationType, Language, UserSettings, Message, AppNotification, ModelStrategy } from './types.ts';
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

// Helper functions for audio processing
function decode(base64: string) {
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  } catch (e) {
    return new Uint8Array(0);
  }
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const safeParse = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (e) {
    return defaultValue;
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(() => safeParse('imagine_ai_user', null));
  const [language, setLanguage] = useState<Language>(() => safeParse('imagine_ai_lang', 'ar'));
  const [history, setHistory] = useState<HistoryItem[]>(() => safeParse('imagine_ai_history', []));
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<Message[]>(() => safeParse('imagine_ai_messages', []));
  
  const [allUsers, setAllUsers] = useState<any[]>(() => safeParse('site_verified_users', []));
  const [bannedEmails, setBannedEmails] = useState<string[]>(() => safeParse('banned_emails', []));
  const [adminIdentity, setAdminIdentity] = useState(() => safeParse('admin_identity', { 
    email: "Mohammedzarzor26@gmail.com", 
    password: "Mah7foud23" 
  }));
  
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => safeParse('imagine_ai_config', {
    seo_title: 'Imagine AI', seo_desc: 'Professional AI Art',
    global_html: '', custom_css: '', custom_js: '', ux_blur_intensity: '20px', ux_accent_color: '#6366f1',
    manager_name: 'Ahmad kharbicha', manager_dob: 'Jan 1, 1987', manager_location: 'SAHTEREANN',
    manager_pic: 'https://i.pravatar.cc/150?u=manager', site_logo_scale: 1.0, 
    global_api_key: '',
    api_key_text_to_image: ''
  }));

  const [userSettings, setUserSettings] = useState<UserSettings>(() => safeParse('imagine_ai_settings', {
    theme: 'dark', language: 'ar', fontFamily: 'modern', fontSize: 'medium', notificationSounds: true,
    autoSaveSession: true, imageQuality: 'high', modelStrategy: 'accurate', showTooltips: true,
    contentProtection: false, privacyMode: false, advancedMode: false
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
  const [accountTab, setAccountTab] = useState<AccountTab>('profile');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const [settings, setSettings] = useState<GenerationSettings>({
    prompt: '', model: 'Plus', aspectRatio: '1:1', steps: 30, uploadedImage: null
  });

  // ⚡ Code Injection & SEO Real-time Sync
  useEffect(() => {
    // Apply SEO
    document.title = siteConfig.seo_title || 'Imagine AI';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', siteConfig.seo_desc || '');

    // Apply CSS Injection
    const styleTag = document.getElementById('admin-dynamic-css');
    if (styleTag) styleTag.textContent = siteConfig.custom_css || '';

    // Apply JS Injection
    const scriptTag = document.getElementById('admin-dynamic-js');
    if (scriptTag) {
      scriptTag.textContent = siteConfig.custom_js || '';
      try {
        if (siteConfig.custom_js) {
          // Execute in a timeout to prevent blocking React render
          setTimeout(() => {
            try {
              const executeCode = new Function(siteConfig.custom_js!);
              executeCode();
            } catch (e) { console.error("Admin JS Exec Error:", e); }
          }, 100);
        }
      } catch (e) {
        console.error("Admin JS Injection Parsing Error:", e);
      }
    }
  }, [siteConfig.custom_css, siteConfig.custom_js, siteConfig.seo_title, siteConfig.seo_desc]);

  useEffect(() => {
    let interval: any;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingStep(prev => (prev + 1) % translations[language].loadingMessages.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating, language]);

  const addNotification = useCallback((title: string, description: string, type: 'system' | 'success' | 'update' | 'message' = 'system') => {
    const newNotif: AppNotification = { id: Date.now().toString(), title, description, time: new Date(), isRead: false, type };
    setNotifications(prev => [newNotif, ...prev]);
    setToast(newNotif);
  }, []);

  const handleGenerateSpeech = async (text: string, voice: string) => {
    if (!text.trim()) return;
    setIsSpeechGenerating(true);
    try {
      const targetKey = siteConfig.api_key_tts || siteConfig.global_api_key || process.env.API_KEY || '';
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
        addNotification(language === 'ar' ? 'تم توليد الصوت' : 'Voice Generated', language === 'ar' ? 'يمكنك الاستماع الآن' : 'You can listen now', 'success');
      }
    } catch (err: any) {
      console.error("TTS Error:", err);
      addNotification('Speech Error', 'Failed to generate voice', 'system');
    } finally {
      setIsSpeechGenerating(false);
    }
  };

  const handleGenerate = useCallback(async (customPrompt?: string, isLogo: boolean = false) => {
    const p = customPrompt || settings.prompt;
    if (!p.trim()) return;
    
    setIsGenerating(true);
    setActiveImage(null);
    
    const targetKey = isLogo 
      ? (siteConfig.api_key_logo || siteConfig.global_api_key || process.env.API_KEY || '')
      : (siteConfig.api_key_text_to_image || siteConfig.global_api_key || process.env.API_KEY || '');

    try {
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const finalPrompt = isLogo ? `Professional minimal high-end logo design for: ${p}, solid background, vector style, 4k` : p;
      const modelName = userSettings.modelStrategy === 'fast' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview';

      const response = await ai.models.generateContent({
        model: modelName,
        contents: { parts: [{ text: finalPrompt }] },
        config: {
          imageConfig: {
            aspectRatio: (settings.aspectRatio as any) || "1:1",
            imageSize: "1K"
          }
        }
      });
      
      let resultUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) { 
            resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`; 
            break; 
          }
        }
      }

      if (resultUrl) {
        setActiveImage(resultUrl);
        setOriginalImage(resultUrl);
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: resultUrl, prompt: p, timestamp: new Date(), model: settings.model, type: isLogo ? 'LogoCreation' : 'Generated' };
        setHistory(prev => [newItem, ...prev].slice(0, 30));
        addNotification(isLogo ? (language === 'ar' ? 'تم تصميم الشعار' : 'Logo Designed') : (language === 'ar' ? 'تم التوليد' : 'Generated'), language === 'ar' ? 'صورتك جاهزة الآن' : 'Your image is ready', 'success');
      }
    } catch (e: any) { 
      console.error("Generation error:", e);
      addNotification('Error', 'Generation failed. Check your API Key.', 'system');
    }
    finally { setIsGenerating(false); }
  }, [settings.prompt, settings.aspectRatio, settings.model, language, addNotification, userSettings.modelStrategy, siteConfig]);

  const handleImageAction = useCallback(async (type: GenerationType, customPrompt?: string) => {
    const sourceImage = activeImage || settings.uploadedImage;
    if (!sourceImage) return;

    setIsGenerating(true);
    
    let targetKey = siteConfig.global_api_key || process.env.API_KEY || '';
    if (type === 'Cleaned') targetKey = siteConfig.api_key_remove_bg || targetKey;
    if (type === 'Upscaled') targetKey = siteConfig.api_key_upscale || targetKey;
    if (type === 'WatermarkRemoved') targetKey = siteConfig.api_key_watermark || targetKey;
    if (type === 'Colorized') targetKey = siteConfig.api_key_colorize || targetKey;
    if (type === 'ObjectRemoved') targetKey = siteConfig.api_key_magic_eraser || targetKey;
    if (type === 'Cartoonized') targetKey = siteConfig.api_key_cartoonize || targetKey;
    if (type === 'Restored') targetKey = siteConfig.api_key_restore || targetKey;
    if (type === 'Edited') targetKey = siteConfig.api_key_smart_edit || targetKey;
    if (type === 'VirtualTryOn') targetKey = siteConfig.api_key_virtual_try_on || targetKey;
    if (type === 'AddSunglasses') targetKey = siteConfig.api_key_sunglasses || targetKey;

    const ACTION_PROMPTS: Partial<Record<GenerationType, string>> = {
      Cleaned: "Remove the background from this image. Keep only the main subject on a solid clean white background.",
      Upscaled: "Enhance and upscale this image to 4K resolution, sharpening every detail and removing noise.",
      WatermarkRemoved: "Identify and seamlessly remove any watermarks, logos, or text overlays from this image.",
      Colorized: "Colorize this black and white photo with natural, vibrant, and realistic colors.",
      ObjectRemoved: "Identify distracting background objects and remove them seamlessly while filling the space naturally.",
      Cartoonized: "Transform this photo into a high-quality 3D Disney/Pixar style animated cartoon character.",
      Restored: "Restore this old photo by fixing scratches, improving contrast, and sharpening blurry areas.",
      VirtualTryOn: "Imagine the person in this image wearing new stylish clothes, looking perfectly fitted and realistic.",
      AddSunglasses: "Add a pair of stylish modern sunglasses to the person in this image, matching the lighting perfectly."
    };

    const promptText = customPrompt || ACTION_PROMPTS[type] || "Enhance this image.";

    try {
      const ai = new GoogleGenAI({ apiKey: targetKey });
      const mimeType = sourceImage.split(';')[0].split(':')[1] || 'image/png';
      const base64Data = sourceImage.split(',')[1];
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { 
          parts: [
            { inlineData: { data: base64Data, mimeType } }, 
            { text: promptText }
          ] 
        }
      });

      let resultUrl = '';
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) { 
            resultUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`; 
            break; 
          }
        }
      }

      if (resultUrl) {
        setActiveImage(resultUrl);
        const newItem: HistoryItem = { id: Date.now().toString(), imageUrl: resultUrl, prompt: promptText, timestamp: new Date(), model: 'Plus', type };
        setHistory(prev => [newItem, ...prev].slice(0, 30));
        addNotification(language === 'ar' ? 'اكتملت المعالجة' : 'Process Complete', language === 'ar' ? `تم تنفيذ أداة: ${type}` : `Tool executed: ${type}`, 'success');
      }
    } catch (error: any) { 
      console.error("Action error:", error);
      addNotification('API Error', 'Tool processing failed. Check your API Key settings.', 'system');
    }
    finally { setIsGenerating(false); }
  }, [activeImage, settings.uploadedImage, language, addNotification, siteConfig]);

  // Persistent Storage with Safety
  useEffect(() => {
    const saveToLocal = (key: string, data: any) => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.warn(`LocalStorage Save Failed for ${key}:`, e);
        if (key === 'imagine_ai_history' && Array.isArray(data) && data.length > 2) {
           // If history fails, drop oldest 5 and retry
           const reduced = data.slice(0, data.length - 2);
           saveToLocal(key, reduced);
        }
      }
    };

    if (user) saveToLocal('imagine_ai_user', user);
    if (siteConfig) saveToLocal('imagine_ai_config', siteConfig);
    if (adminIdentity) saveToLocal('admin_identity', adminIdentity);
    if (userSettings) saveToLocal('imagine_ai_settings', userSettings);
    if (allUsers) saveToLocal('site_verified_users', allUsers);
    if (bannedEmails) saveToLocal('banned_emails', bannedEmails);
    if (messages) saveToLocal('imagine_ai_messages', messages);
    if (history) saveToLocal('imagine_ai_history', history);
  }, [user, siteConfig, adminIdentity, userSettings, history, allUsers, bannedEmails, messages]);

  if (!user) return <AuthScreen onLogin={setUser} language={language} allUsers={allUsers} setAllUsers={setAllUsers} bannedEmails={bannedEmails} adminIdentity={adminIdentity} />;

  return (
    <div className={`flex flex-col h-screen overflow-hidden ${userSettings.theme === 'dark' ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {siteConfig.global_html && <div dangerouslySetInnerHTML={{ __html: siteConfig.global_html }} />}
      <Header credits={50} user={user} language={language} siteConfig={siteConfig} notifications={notifications} onMarkAllRead={() => setNotifications(prev => prev.map(n => ({...n, isRead: true})))} onToggleLang={() => setLanguage(l => l === 'ar' ? 'en' : 'ar')} onUpgrade={() => { setAccountTab('credits'); setIsAccountOpen(true); }} onProfile={() => { setAccountTab('profile'); setIsAccountOpen(true); }} onOpenInbox={() => { setAccountTab('manager'); setIsAccountOpen(true); }} onOpenStory={() => setIsStoryOpen(true)} onLogout={() => setUser(null)} onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} onAdmin={() => setIsAdminOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen} 
          settings={settings} 
          setSettings={setSettings} 
          onGenerate={() => handleGenerate()} 
          onUpload={(url) => { 
            setActiveImage(url); 
            setSettings(prev => ({ ...prev, uploadedImage: url }));
          }} 
          isGenerating={isGenerating} 
          language={language} 
          onClose={() => setIsSidebarOpen(false)} 
          modelStrategy={userSettings.modelStrategy}
          setModelStrategy={(s) => setUserSettings(prev => ({ ...prev, modelStrategy: s }))}
        />
        <MainPreview 
          imageUrl={activeImage} 
          originalImageUrl={originalImage} 
          isGenerating={isGenerating} 
          loadingStep={loadingStep}
          prompt={settings.prompt} 
          language={language} 
          onToggleGallery={() => setIsGalleryOpen(!isGalleryOpen)} 
          onRemoveBackground={() => handleImageAction('Cleaned')} 
          onUpscale={() => handleImageAction('Upscaled')} 
          onRemoveWatermark={() => handleImageAction('WatermarkRemoved')} 
          onRestore={() => handleImageAction('Restored')} 
          onColorize={() => handleImageAction('Colorized')} 
          onCartoonize={() => handleImageAction('Cartoonized')} 
          onMagicEraser={() => handleImageAction('ObjectRemoved')} 
          onSmartEdit={() => { const p = prompt(translations[language].smartEdit + '?'); if (p) handleImageAction('Edited', p); }} 
          onVirtualTryOn={() => handleImageAction('VirtualTryOn')} 
          onAddSunglasses={() => handleImageAction('AddSunglasses')} 
          onCreateLogo={() => { const n = prompt(translations[language].logoPrompt); if (n) handleGenerate(`Logo for ${n}`, true); }} 
          onTextToSpeech={() => setIsSpeechModalOpen(true)}
        />
        <RightPanel isOpen={isGalleryOpen} history={history} onSelect={setActiveImage} onDelete={(id) => setHistory(h => h.filter(x => x.id !== id))} language={language} onClose={() => setIsGalleryOpen(false)} />
      </div>

      <AccountModal isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} activeTab={accountTab} setActiveTab={setAccountTab} credits={50} user={user} language={language} userSettings={userSettings} setUserSettings={s => setUserSettings(prev => ({ ...prev, ...s }))} siteConfig={siteConfig} allMessages={messages} onSendMessage={(content) => {
        const newMessage: Message = { id: Date.now().toString(), senderName: user?.name, senderEmail: user?.email, content, timestamp: new Date(), isRead: false };
        setMessages(prev => [newMessage, ...prev]);
      }} />
      {isAdminOpen && <AdminPanel config={siteConfig} setConfig={setSiteConfig} messages={messages} setMessages={setMessages} onClose={() => setIsAdminOpen(false)} language={language} allUsers={allUsers} setAllUsers={setAllUsers} bannedEmails={bannedEmails} setBannedEmails={setBannedEmails} adminIdentity={adminIdentity} setAdminIdentity={setAdminIdentity} />}
      
      {isStoryOpen && siteConfig.global_story?.active && (
        <StoryViewer story={{...siteConfig.global_story, timestamp: Date.now()}} onClose={() => { setIsStoryOpen(false); const seen = JSON.parse(localStorage.getItem('seen_stories') || '[]'); if (!seen.includes(siteConfig.global_story?.id)) seen.push(siteConfig.global_story?.id); localStorage.setItem('seen_stories', JSON.stringify(seen)); }} language={language} siteConfig={siteConfig} />
      )}
      <ToastNotification toast={toast} onClose={() => setToast(null)} language={language} />
      {isSpeechModalOpen && <SpeechModal isOpen={isSpeechModalOpen} onClose={() => setIsSpeechModalOpen(false)} onGenerate={handleGenerateSpeech} language={language} isGenerating={isSpeechGenerating} />}
      
      {user?.isAdmin && (
        <div className="fixed bottom-4 left-4 z-[9999] opacity-0 hover:opacity-100 transition-opacity">
          <button onClick={() => setIsAdminOpen(true)} className="p-2 bg-slate-900 text-white rounded-full shadow-lg border border-white/10"><Fingerprint className="w-5 h-5" /></button>
        </div>
      )}
    </div>
  );
};

export default App;
