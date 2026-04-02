// API Client
export { default as apiClient, getErrorMessage } from './client';

// Types
export * from './types';
export type { 
  NotificationSettings, 
  AISettings, 
  ApiKey, 
  UpdateProfileData, 
  UpdateBusinessData, 
  UpdatePasswordData,
  CreateApiKeyResponse,
  TwoFactorStatus,
  TwoFactorSetup
} from './settings';

// Services
export { authService } from './auth';
export { analyticsService } from './analytics';
export { conversationService } from './conversations';
export { agentService } from './agents';
export { productService } from './products';
export { knowledgeBaseService } from './knowledge';
export { settingsService } from './settings';
export { integrationService } from './integrations';
export type { Integration, IntegrationSettings, AvailableIntegration, WhatsAppTemplate } from './integrations';
export { fileService, formatFileSize, isValidFileType, getMaxFileSize } from './files';
export type { UploadResponse, AvatarResponse, DocumentResponse, FileType } from './files';
export { widgetService } from './widget';
export type { WidgetConfig, WidgetResponse, EmbedCodeResponse, BusinessHours, DaySchedule, UpdateWidgetData } from './widget';
export { chatService, widgetChatService } from './chat';
export type { ChatMessage, ChatConversation, StartChatData, WidgetStartChatData, SendMessageResponse } from './chat';
