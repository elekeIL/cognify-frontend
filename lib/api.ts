import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Backend base URL for static files (without /api/v1)
const BACKEND_BASE_URL = API_BASE_URL.replace('/api/v1', '');

/**
 * Converts a relative static URL from the backend to an absolute URL.
 * Handles both formats:
 * - "/static/audio/audio_123.mp3" -> "http://backend/static/audio/audio_123.mp3"
 * - "uploads/audio/audio_123.mp3" -> "http://backend/static/audio/audio_123.mp3"
 */
export const getStaticUrl = (relativePath: string | undefined | null): string | null => {
  if (!relativePath) return null;
  // If already absolute, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }

  // Handle audio_path format: "uploads/audio/filename.mp3" -> "/static/audio/filename.mp3"
  if (relativePath.includes('uploads/audio/')) {
    const filename = relativePath.split('/').pop();
    return `${BACKEND_BASE_URL}/static/audio/${filename}`;
  }

  // Ensure path starts with /
  const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${BACKEND_BASE_URL}${path}`;
};

// Token storage keys
const ACCESS_TOKEN_KEY = 'cognify_access_token';
const REFRESH_TOKEN_KEY = 'cognify_refresh_token';

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// Token management
export const tokenStorage = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    // Also set cookie for middleware to read
    setCookie(ACCESS_TOKEN_KEY, accessToken);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    // Also clear cookie
    deleteCookie(ACCESS_TOKEN_KEY);
  },

  hasTokens: (): boolean => {
    return !!tokenStorage.getAccessToken();
  },
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefreshToken();

      if (!refreshToken) {
        tokenStorage.clearTokens();
        window.location.href = '/auth/signin';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        tokenStorage.setTokens(access_token, refresh_token);

        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        tokenStorage.clearTokens();
        window.location.href = '/auth/signin';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  company?: string;
  role?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  company?: string;
  role?: string;
}

// Auth API
export const authApi = {
  login: async (credentials: LoginCredentials): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/auth/register', data);
    return response.data;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/auth/account');
  },
};

// Dashboard Types
export interface DashboardStats {
  total_documents: number;
  total_lessons: number;
  completed_lessons: number;
  total_learning_time_minutes: number;
  documents_this_week: number;
  lessons_completed_this_week: number;
  current_streak_days: number;
  average_completion_rate: number;
  total_learning_outcomes: number;
  completed_learning_outcomes: number;
  learning_outcomes_rate: number;
}

export interface RecentDocument {
  id: string;
  ingestion_id: string;
  title: string;
  file_type: string;
  status: string;
  created_at: string;
  has_lesson: boolean;
}

export interface RecentLesson {
  id: string;
  document_id: string;
  title: string;
  summary: string;
  progress_percentage: number;
  is_completed: boolean;
  created_at: string;
  last_accessed_at?: string;
}

export interface DashboardResponse {
  stats: DashboardStats;
  recent_documents: RecentDocument[];
  recent_lessons: RecentLesson[];
}

// Document Types
export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type FileType = 'pdf' | 'docx' | 'txt';

export interface DocumentTheme {
  id: string;
  name: string;
  description?: string;
  order: number;
  document_id: string;
  created_at: string;
}

export interface Document {
  id: string;
  ingestion_id: string;
  title: string;
  file_name: string;
  file_type: FileType;
  file_size: number;
  status: DocumentStatus;
  word_count?: number;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  themes_count: number;
  themes: DocumentTheme[];
  has_lesson: boolean;
}

export interface DocumentListResponse {
  items: Document[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface DocumentStatusResponse {
  id: string;
  ingestion_id: string;
  status: DocumentStatus;
  progress: number;
  current_step: string;
  error_message?: string;
}

// Step-level processing types
export type ProcessingStep =
  | 'extract_text'
  | 'extract_themes'
  | 'generate_lesson'
  | 'extract_citations'
  | 'generate_audio';

export type StepStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'failed'
  | 'skipped';

export interface ProcessingStatusResponse {
  id: string;
  ingestion_id: string;
  status: DocumentStatus;
  current_step?: ProcessingStep;
  failed_step?: ProcessingStep;
  step_statuses: Record<string, StepStatus>;
  error_message?: string;
  progress_percentage: number;
  can_retry: boolean;
  retry_count: number;
}

export interface StepRequest {
  idempotency_key?: string;
}

export interface StepResponse {
  document_id: string;
  step: ProcessingStep;
  status: StepStatus;
  message: string;
  next_step?: ProcessingStep;
  error_message?: string;
  can_retry: boolean;
  retry_count: number;
}

export interface RetryStepRequest {
  step: ProcessingStep;
  idempotency_key?: string;
}

export interface RetryStepResponse {
  document_id: string;
  step: ProcessingStep;
  status: StepStatus;
  message: string;
  retry_count: number;
  error_message?: string;
}

export interface Theme {
  id: string;
  name: string;
  description?: string;
  relevance_score: number;
}

export interface Citation {
  id: string;
  snippet: string;
  source_page?: number;
  relevance_score: number;
}

export interface DocumentDetail extends Document {
  themes: Theme[];
  lesson?: Lesson;
  citations: Citation[];
  error_message?: string;
}

// Lesson Types
export interface Lesson {
  id: string;
  document_id: string;
  title: string;
  summary: string;
  content: string;
  word_count: number;
  what_youll_learn?: string;
  key_takeaways?: string;
  apply_at_work?: string;
  learning_outcomes?: string;
  audio_path?: string;
  audio_url?: string;
  audio_duration?: number;
  is_completed: boolean;
  progress_percentage: number;
  audio_position: number;
  time_spent_seconds: number;
  outcomes_completed?: string;
  completed_at?: string;
  last_accessed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface LessonListResponse {
  items: Lesson[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LessonProgressUpdate {
  progress_percentage?: number;
  audio_position?: number;
  time_spent_seconds?: number;
}

export interface LessonOutcomeUpdate {
  outcome_id: string;
  completed: boolean;
}

// Notification Types
export type NotificationType = 'success' | 'info' | 'warning' | 'error' | 'neutral';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  description?: string;
  entity_type?: string;
  entity_id?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Activity Types
export interface Activity {
  id: string;
  activity_type: string;
  title: string;
  description?: string;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

export interface ActivityListResponse {
  items: Activity[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// Search Types
export interface SearchResult {
  type: 'document' | 'lesson';
  id: string;
  title: string;
  description?: string;
  created_at: string;
  relevance_score: number;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  query: string;
}

// Dashboard API
export const dashboardApi = {
  getDashboard: async (): Promise<DashboardResponse> => {
    const response = await api.get<DashboardResponse>('/dashboard');
    return response.data;
  },

  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  getRecentDocuments: async (limit: number = 5): Promise<RecentDocument[]> => {
    const response = await api.get<RecentDocument[]>('/dashboard/recent-documents', {
      params: { limit },
    });
    return response.data;
  },

  getRecentLessons: async (limit: number = 5): Promise<RecentLesson[]> => {
    const response = await api.get<RecentLesson[]>('/dashboard/recent-lessons', {
      params: { limit },
    });
    return response.data;
  },
};

// Documents API
export const documentsApi = {
  upload: async (file: File, title?: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }
    const response = await api.post<Document>('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  list: async (page: number = 1, pageSize: number = 10): Promise<DocumentListResponse> => {
    const response = await api.get<DocumentListResponse>('/documents', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  getRecent: async (limit: number = 5): Promise<Document[]> => {
    const response = await api.get<Document[]>('/documents/recent', {
      params: { limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<DocumentDetail> => {
    const response = await api.get<DocumentDetail>(`/documents/${id}`);
    return response.data;
  },

  getStatus: async (id: string): Promise<DocumentStatusResponse> => {
    const response = await api.get<DocumentStatusResponse>(`/documents/${id}/status`);
    return response.data;
  },

  getByIngestionId: async (ingestionId: string): Promise<DocumentDetail> => {
    const response = await api.get<DocumentDetail>(`/documents/ingestion/${ingestionId}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/documents/${id}`);
  },

  download: async (id: string): Promise<Blob> => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Step-based processing API
  getProcessingStatus: async (id: string): Promise<ProcessingStatusResponse> => {
    const response = await api.get<ProcessingStatusResponse>(`/documents/${id}/processing-status`);
    return response.data;
  },

  processExtractText: async (id: string, request?: StepRequest): Promise<StepResponse> => {
    const response = await api.post<StepResponse>(`/documents/${id}/process/extract-text`, request || {});
    return response.data;
  },

  processExtractThemes: async (id: string, request?: StepRequest): Promise<StepResponse> => {
    const response = await api.post<StepResponse>(`/documents/${id}/process/extract-themes`, request || {});
    return response.data;
  },

  processGenerateLesson: async (id: string, request?: StepRequest): Promise<StepResponse> => {
    const response = await api.post<StepResponse>(`/documents/${id}/process/generate-lesson`, request || {});
    return response.data;
  },

  processExtractCitations: async (id: string, request?: StepRequest): Promise<StepResponse> => {
    const response = await api.post<StepResponse>(`/documents/${id}/process/extract-citations`, request || {});
    return response.data;
  },

  processGenerateAudio: async (id: string, request?: StepRequest): Promise<StepResponse> => {
    const response = await api.post<StepResponse>(`/documents/${id}/process/generate-audio`, request || {});
    return response.data;
  },

  retryFailedStep: async (id: string, request: RetryStepRequest): Promise<RetryStepResponse> => {
    const response = await api.post<RetryStepResponse>(`/documents/${id}/process/retry`, request);
    return response.data;
  },
};

// Lessons API
export const lessonsApi = {
  list: async (page: number = 1, pageSize: number = 10): Promise<LessonListResponse> => {
    const response = await api.get<LessonListResponse>('/lessons', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Lesson> => {
    const response = await api.get<Lesson>(`/lessons/${id}`);
    return response.data;
  },

  getByDocumentId: async (documentId: string): Promise<Lesson> => {
    const response = await api.get<Lesson>(`/lessons/document/${documentId}`);
    return response.data;
  },

  updateProgress: async (id: string, progress: LessonProgressUpdate): Promise<Lesson> => {
    const response = await api.patch<Lesson>(`/lessons/${id}/progress`, progress);
    return response.data;
  },

  markComplete: async (id: string): Promise<Lesson> => {
    const response = await api.post<Lesson>(`/lessons/${id}/complete`);
    return response.data;
  },

  resetProgress: async (id: string): Promise<Lesson> => {
    const response = await api.post<Lesson>(`/lessons/${id}/reset-progress`);
    return response.data;
  },

  updateOutcome: async (id: string, outcomeUpdate: LessonOutcomeUpdate): Promise<Lesson> => {
    const response = await api.patch<Lesson>(`/lessons/${id}/outcomes`, outcomeUpdate);
    return response.data;
  },
};

// Notifications API
export const notificationsApi = {
  list: async (page: number = 1, pageSize: number = 10): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>('/notifications', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  getRecent: async (limit: number = 5): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/recent', {
      params: { limit },
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ unread_count: number }>('/notifications/unread-count');
    return response.data.unread_count;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.post<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markMultipleAsRead: async (ids: string[]): Promise<void> => {
    await api.post('/notifications/mark-read', { notification_ids: ids });
  },

  markAllAsRead: async (): Promise<void> => {
    await api.post('/notifications/mark-all-read');
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};

// Activities API
export const activitiesApi = {
  list: async (page: number = 1, pageSize: number = 10): Promise<ActivityListResponse> => {
    const response = await api.get<ActivityListResponse>('/activities', {
      params: { page, page_size: pageSize },
    });
    return response.data;
  },

  getRecent: async (limit: number = 10): Promise<Activity[]> => {
    const response = await api.get<Activity[]>('/activities/recent', {
      params: { limit },
    });
    return response.data;
  },
};

// Search API
export const searchApi = {
  search: async (query: string): Promise<SearchResponse> => {
    const response = await api.get<SearchResponse>('/search', {
      params: { q: query },
    });
    return response.data;
  },
};

// Settings Types - Profile
export interface ProfileSettings {
  full_name: string;
  email: string;
  company?: string;
  role?: string;
  bio?: string;
  avatar_url?: string;
  timezone: string;
  language: string;
}

export interface ProfileSettingsUpdate {
  full_name?: string;
  company?: string;
  role?: string;
  bio?: string;
  timezone?: string;
  language?: string;
}

// Settings Types - Notifications
export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  lesson_reminders: boolean;
  weekly_digest: boolean;
  marketing_emails: boolean;
}

export interface NotificationSettingsUpdate {
  email_notifications?: boolean;
  push_notifications?: boolean;
  lesson_reminders?: boolean;
  weekly_digest?: boolean;
  marketing_emails?: boolean;
}

// Settings Types - Learning Preferences
export interface LearningPreferencesSettings {
  daily_goal_minutes: number;
  preferred_lesson_length: 'short' | 'medium' | 'long';
  auto_play_audio: boolean;
  playback_speed: number;
  theme: 'light' | 'dark' | 'system';
}

export interface LearningPreferencesUpdate {
  daily_goal_minutes?: number;
  preferred_lesson_length?: 'short' | 'medium' | 'long';
  auto_play_audio?: boolean;
  playback_speed?: number;
  theme?: 'light' | 'dark' | 'system';
}

// Combined Settings Response
export interface AllSettings {
  profile: ProfileSettings;
  notifications: NotificationSettings;
  learning: LearningPreferencesSettings;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Settings API
export const settingsApi = {
  // Get all settings
  getAllSettings: async (): Promise<AllSettings> => {
    const response = await api.get<AllSettings>('/user/settings');
    return response.data;
  },

  // Profile settings
  getProfileSettings: async (): Promise<ProfileSettings> => {
    const response = await api.get<ProfileSettings>('/user/settings/profile');
    return response.data;
  },

  updateProfileSettings: async (settings: ProfileSettingsUpdate): Promise<ProfileSettings> => {
    const response = await api.patch<ProfileSettings>('/user/settings/profile', settings);
    return response.data;
  },

  // Notification settings
  getNotificationSettings: async (): Promise<NotificationSettings> => {
    const response = await api.get<NotificationSettings>('/user/settings/notifications');
    return response.data;
  },

  updateNotificationSettings: async (settings: NotificationSettingsUpdate): Promise<NotificationSettings> => {
    const response = await api.patch<NotificationSettings>('/user/settings/notifications', settings);
    return response.data;
  },

  // Learning preferences
  getLearningPreferences: async (): Promise<LearningPreferencesSettings> => {
    const response = await api.get<LearningPreferencesSettings>('/user/settings/learning');
    return response.data;
  },

  updateLearningPreferences: async (settings: LearningPreferencesUpdate): Promise<LearningPreferencesSettings> => {
    const response = await api.patch<LearningPreferencesSettings>('/user/settings/learning', settings);
    return response.data;
  },

  // Password change
  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/auth/change-password', data);
    return response.data;
  },

  // Delete account
  deleteAccount: async (): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>('/auth/account');
    return response.data;
  },

  // Update profile via auth endpoint
  updateProfile: async (profile: { full_name?: string; company?: string; role?: string }): Promise<User> => {
    const response = await api.patch<User>('/auth/me', profile);
    return response.data;
  },
};
