
export type Language = 'ar' | 'en';
export type ModelType = 'Base' | 'Plus';
export type GenerationType = 'Generated' | 'Edited' | 'Upscaled' | 'Cleaned' | 'WatermarkRemoved' | 'Colorized' | 'ObjectRemoved' | 'Cartoonized' | 'Restored' | 'SketchToImage' | 'VirtualTryOn' | 'Outpainted' | 'BackgroundChanged' | 'AddSunglasses' | 'LogoCreation' | 'ImageToVector' | 'ChangeHairStyle';

export type ThemeMode = 'light' | 'dark';
export type FontFamily = 'classic' | 'modern' | 'comfort';
export type FontSize = 'small' | 'medium' | 'large';
export type ImageQuality = 'high' | 'medium' | 'low';
export type ModelStrategy = 'fast' | 'accurate' | 'artistic';

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: Date;
  isRead: boolean;
  type: 'system' | 'success' | 'update' | 'message';
  ownerEmail?: string; 
}

export interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  reply?: string; 
  replyTimestamp?: Date; 
}

export interface HistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: Date;
  model: ModelType;
  type: GenerationType;
  sizeBytes?: number;
}

export interface GenerationSettings {
  prompt: string;
  model: ModelType;
  aspectRatio: string;
  steps: number;
  uploadedImage: string | null;
}

export interface UserSettings {
  theme: ThemeMode;
  language: Language;
  fontFamily: FontFamily;
  fontSize: FontSize;
  notificationSounds: boolean;
  autoSaveSession: boolean;
  imageQuality: ImageQuality;
  modelStrategy: ModelStrategy;
  showTooltips: boolean;
  contentProtection: boolean;
  privacyMode: boolean;
  advancedMode: boolean;
  manualApiKey?: string;
}

export type AdminTab = 'SEO' | 'GLOBAL_HTML' | 'CSS' | 'JS' | 'PHP_LOGIC' | 'UX_CONFIG' | 'MESSAGES' | 'MANAGER_PROFILE' | 'USERS' | 'GLOBAL_STORY' | 'ADMIN_SECURITY' | 'API_SETTINGS' | 'BANDWIDTH_STATS';

export interface SiteConfig {
  seo_title: string;
  seo_desc: string;
  global_html: string;
  custom_css: string;
  custom_js: string;
  php_logic: string;
  ux_blur_intensity: string;
  ux_accent_color: string;
  manager_name: string;
  manager_dob: string;
  manager_location: string;
  manager_pic: string;
  site_logo?: string;
  site_logo_scale?: number; 
  global_api_key?: string;
  api_key_random?: string;
  total_data_usage_bytes?: number;
  // Smart Tools API Keys
  api_key_text_to_image?: string;
  api_key_logo?: string;
  api_key_tts?: string;
  api_key_smart_edit?: string;
  api_key_remove_bg?: string;
  api_key_upscale?: string;
  api_key_virtual_try_on?: string;
  api_key_sunglasses?: string;
  api_key_watermark?: string;
  api_key_colorize?: string;
  api_key_magic_eraser?: string;
  api_key_cartoonize?: string;
  api_key_restore?: string;
  api_key_hair_style?: string;
  global_story?: {
    id: string;
    image?: string;
    video?: string;
    audio?: string;
    message: string;
    active: boolean;
  };
}
