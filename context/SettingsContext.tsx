"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import toast from 'react-hot-toast';
import {
  settingsApi,
  AllSettings,
  ProfileSettingsUpdate,
  NotificationSettingsUpdate,
  LearningPreferencesUpdate,
} from '@/lib/api';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: AllSettings | null;
  isLoading: boolean;
  error: string | null;

  // Fetch settings (called manually from settings page)
  fetchSettings: () => Promise<void>;

  // Profile
  updateProfile: (data: ProfileSettingsUpdate) => Promise<void>;

  // Notifications
  updateNotifications: (data: NotificationSettingsUpdate) => Promise<void>;

  // Learning preferences
  updateLearningPreferences: (data: LearningPreferencesUpdate) => Promise<void>;

  // Password
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;

  // Account
  deleteAccount: () => Promise<void>;

  // Refresh settings
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: React.ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<AllSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { setTheme } = useTheme();

  // Fetch all settings - called from settings page
  const fetchSettings = useCallback(async () => {
    if (!isAuthenticated) {
      setSettings(null);
      setIsLoading(false);
      setHasFetched(true);
      return;
    }

    // Don't refetch if already fetched successfully
    if (hasFetched && settings && !error) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await settingsApi.getAllSettings();
      setSettings(data);

      // Sync theme with next-themes
      if (data.learning?.theme) {
        setTheme(data.learning.theme);
      }
    } catch (err: any) {
      console.error('Failed to fetch settings:', err);
      setError(err.response?.data?.detail || 'Failed to load settings');
    } finally {
      setIsLoading(false);
      setHasFetched(true);
    }
  }, [isAuthenticated, setTheme, hasFetched, settings, error]);

  // Update profile settings
  const updateProfile = useCallback(async (data: ProfileSettingsUpdate) => {
    try {
      const updatedProfile = await settingsApi.updateProfileSettings(data);
      setSettings(prev => prev ? { ...prev, profile: updatedProfile } : null);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update profile';
      toast.error(message);
      throw err;
    }
  }, []);

  // Update notification settings
  const updateNotifications = useCallback(async (data: NotificationSettingsUpdate) => {
    try {
      const updatedNotifications = await settingsApi.updateNotificationSettings(data);
      setSettings(prev => prev ? { ...prev, notifications: updatedNotifications } : null);
      toast.success('Notification settings updated');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update notification settings';
      toast.error(message);
      throw err;
    }
  }, []);

  // Update learning preferences
  const updateLearningPreferences = useCallback(async (data: LearningPreferencesUpdate) => {
    try {
      const updatedLearning = await settingsApi.updateLearningPreferences(data);
      setSettings(prev => prev ? { ...prev, learning: updatedLearning } : null);

      // Sync theme with next-themes if theme was updated
      if (data.theme) {
        setTheme(data.theme);
      }

      toast.success('Learning preferences updated');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to update learning preferences';
      toast.error(message);
      throw err;
    }
  }, [setTheme]);

  // Change password
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await settingsApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success('Password changed successfully');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to change password';
      toast.error(message);
      throw err;
    }
  }, []);

  // Delete account
  const deleteAccount = useCallback(async () => {
    try {
      await settingsApi.deleteAccount();
      toast.success('Account deleted successfully');
    } catch (err: any) {
      const message = err.response?.data?.detail || 'Failed to delete account';
      toast.error(message);
      throw err;
    }
  }, []);

  // Refresh settings
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  const value: SettingsContextType = {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateProfile,
    updateNotifications,
    updateLearningPreferences,
    changePassword,
    deleteAccount,
    refreshSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
