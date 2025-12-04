import { axiosInstance, setAuthToken } from '../api/axiosInstance';
import type { Session, User } from '../types/auth';
import { InvalidCredentialsError } from '../errors/auth.errors';
import axios from 'axios';
import { mapApiUserToFrontend } from '@/mappers/auth.mapper';

export const login = async (credentials: { usuario: string; password: string }): Promise<Session> => {
  try {
    const { data } = await axiosInstance.post<{ accessToken: string, refreshToken: string }>('/auth/login', credentials);
    const { accessToken, refreshToken } = data;

    setAuthToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    const user = await getUserInfo();
    return { user, accessToken, refreshToken };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      throw new InvalidCredentialsError();
    }
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    setAuthToken(null);
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Logout failed:', error);
    throw new Error('An error occurred during logout.');
  }
};


export const refreshToken = async (signal?: AbortSignal): Promise<{ accessToken: string }> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }
    const { data } = await axiosInstance.post<{ accessToken: string }>('/auth/refresh', { refreshToken }, { signal });
    // Update the in-memory token after refresh
    setAuthToken(data.accessToken);
    return data;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    if (axios.isCancel(error)) {
      throw error;
    }
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        localStorage.removeItem('refreshToken');
        setAuthToken(null);
      }
    }
    throw new Error('Failed to refresh token.');
  }
};

// Fetches user information using the provided token (in memory)
export const getUserInfo = async (signal?: AbortSignal): Promise<User> => {
  try {
    const { data } = await axiosInstance.get<{
      id: number;
      username: string;
      fullName: string;
      email: string;
      contact?: string;
      active: boolean;
      department: string | null;
      position: string | null;
      process: string | null;
      processId: number | null;
      role: string | null;
      roleId: number | null;
      createdAt: string;
      lastAccess: string;
    }>('/auth/me', { signal });
    
    return mapApiUserToFrontend(data);
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw new Error('Failed to fetch user information.');
  }
};
