
// System-wide version constant
export const SYSTEM_VERSION = "2.2.1_STABLE_ADMIN";

export type Language = 'ar' | 'en';
export type ModelType = 'Base' | 'Plus';
export type GenerationType = 'Generated' | 'Edited' | 'Upscaled' | 'Cleaned' | 'WatermarkRemoved' | 'Colorized' | 'ObjectRemoved' | 'Cartoonized' | 'Restored' | 'SketchToImage' | 'VirtualTryOn' | 'Outpainted' | 'BackgroundChanged' | 'AddSunglasses' | 'LogoCreation' | 'ImageToVector' | 'ChangeHairStyle' | 'TextToCode' | 'QrCode' | 'QrDecoder';

export type ThemeMode = 'light' | 'dark';
export type FontFamily = 'classic' | 'modern' | 'comfort';
export type FontSize = 'small' | 'medium' | 'large';
export type ImageQuality = 'high' | 'medium' | 'low';
export type ModelStrategy = 'fast' | 'accurate' | 'artistic';
export type DeviceType = 'pc' | 'android' | 'iphone';

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
  deviceType: DeviceType;
}

export type AdminTab = 'DASHBOARD' | 'API_SETTINGS' | 'MESSAGES' | 'USERS' | 'MANAGER_PROFILE' | 'GLOBAL_STORY' | 'UX_CONFIG' | 'ADMIN_SECURITY' | 'DEV_TOOLS' | 'SYSTEM_CONFIG';

export interface SiteConfig {
  seo_title: string;
  seo_desc: string;
  seo_keywords?: string;
  global_html: string;
  custom_css: string;
  custom_js: string;
  php_logic: string;
  https_force?: boolean;
  ux_blur_intensity: string;
  ux_accent_color: string;
  ux_border_radius?: string;
  manager_name: string;
  manager_dob: string;
  manager_location: string;
  manager_pic: string;
  site_logo?: string;
  site_logo_scale?: number; 
  global_api_key?: string;
  api_key_random?: string;
  total_data_usage_bytes?: number;
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
  api_key_text_to_code?: string;
  api_key_qr_code?: string;
  api_key_image_to_vector?: string;
  face_id_enabled?: boolean;
  admin_face_ref?: string;
  dev_access_code?: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_user?: string;
  smtp_pass?: string;
  global_story?: {
    id: string;
    image?: string;
    video?: string;
    audio?: string;
    message: string;
    active: boolean;
  };
}
