import axios, { type AxiosError } from 'axios';
import { refreshToken } from '@services/auth.service';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let accessToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const initializeAuth = () => {
  const storedToken = localStorage.getItem('accessToken');
  if (storedToken) {
    accessToken = storedToken;
  }
};

initializeAuth();

// Request interceptor to add the auth token header to requests
axiosInstance.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


let isRefreshing = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // If there's no original request, we can't retry.
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle both 401 AND 403 (for some reason the back-end returns 403 for invalid tokens)
    // @ts-expect-error adding custom property
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      // @ts-expect-error adding custom property
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken: newAccessToken } = await refreshToken();
        setAuthToken(newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        // On refresh failure, we should clear the token and refresh token
        setAuthToken(null);
        localStorage.removeItem('refreshToken');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


export { axiosInstance };
