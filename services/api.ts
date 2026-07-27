import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL;

interface ApiOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  isFormData?: boolean;
}

class ApiClient {
  private token: string | null = null;

  async setToken(token: string | null) {
    this.token = token;
    if (token) {
      await AsyncStorage.setItem('auth_token', token);
    } else {
      await AsyncStorage.removeItem('auth_token');
    }
  }

  async loadToken() {
    const token = await AsyncStorage.getItem('auth_token');
    this.token = token;
    return token;
  }

  async request<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, isFormData = false } = options;

    const requestHeaders: Record<string, string> = {
      'Accept': 'application/json',
      ...headers,
    };

    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    if (!isFormData && body) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const url = `${API_BASE}${endpoint}`;
    console.log(`[API] ${method} ${url}`);

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (fetchError: any) {
      console.error(`[API] Network error for ${method} ${url}:`, fetchError.message);
      throw new ApiError(
        `Cannot connect to server. Please check your connection and ensure the backend is running at ${API_BASE}.`,
        0
      );
    }

    if (response.status === 401) {
      await this.setToken(null);
      throw new ApiError('Unauthorized', 401);
    }

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new ApiError(
          `Server returned HTML instead of JSON (HTTP ${response.status}). The API endpoint may be misconfigured.`,
          response.status
        );
      }
      data = { message: text };
    }

    console.log(`[API] ${response.status} ${method} ${url}`, data);

    if (!response.ok) {
      const message = data.message || data.error || 'Request failed';
      const errors = data.errors || null;
      throw new ApiError(message, response.status, errors);
    }

    return data as T;
  }

  get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, isFormData = false) {
    return this.request<T>(endpoint, { method: 'POST', body, isFormData });
  }

  put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export class ApiError extends Error {
  status: number;
  errors: Record<string, string[]> | null;

  constructor(message: string, status: number, errors?: Record<string, string[]> | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || null;
  }
}

export const api = new ApiClient();
