import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = 'bharatai_token';

export interface UserPayload {
  sub: string; // usually email
  role: string;
  ministry: string;
  exp: number;
}

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') {
    // Clear any stale ministry context from a previous session
    localStorage.removeItem('bharatai_ministry');
    localStorage.removeItem('bharatai_last_user');
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const clearToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const getUser = (): UserPayload | null => {
  const token = getToken();
  if (!token) return null;
  
  try {
    const decoded = jwtDecode<UserPayload>(token);
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      clearToken();
      return null;
    }
    return decoded;
  } catch (err) {
    clearToken();
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getUser();
};
