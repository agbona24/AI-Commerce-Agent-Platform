import apiClient from './client';

// Types
export interface UploadResponse {
  path: string;
  url: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export interface AvatarResponse {
  url: string;
}

export interface DocumentResponse {
  path: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
}

export type FileType = 'avatar' | 'logo' | 'document' | 'image';

// File Upload Service
export const fileService = {
  /**
   * Upload a generic file
   */
  async upload(file: File, type: FileType, folder?: string): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    if (folder) {
      formData.append('folder', folder);
    }
    
    const response = await apiClient.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Upload user avatar
   */
  async uploadAvatar(file: File): Promise<AvatarResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Upload business logo
   */
  async uploadLogo(file: File): Promise<AvatarResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Upload document for knowledge base
   */
  async uploadDocument(file: File): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/files/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  /**
   * Delete a file by path
   */
  async delete(path: string): Promise<void> {
    await apiClient.delete('/files', {
      data: { path },
    });
  },
};

// Helper function for displaying file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Helper function for validating file type
export function isValidFileType(file: File, type: FileType): boolean {
  const mimeTypes: Record<FileType, string[]> = {
    avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    logo: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    document: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  };
  
  return mimeTypes[type].includes(file.type);
}

// Helper function for max file sizes (in bytes)
export function getMaxFileSize(type: FileType): number {
  const sizes: Record<FileType, number> = {
    avatar: 2 * 1024 * 1024, // 2MB
    logo: 2 * 1024 * 1024,   // 2MB
    image: 10 * 1024 * 1024, // 10MB
    document: 20 * 1024 * 1024, // 20MB
  };
  
  return sizes[type];
}
