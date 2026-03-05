import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  setToken: (token: string) => Promise<void>;
  clearToken: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,

  setToken: async (token) => {
    await SecureStore.setItemAsync('access_token', token);
    set({ accessToken: token, isAuthenticated: true });
  },

  clearToken: async () => {
    await SecureStore.deleteItemAsync('access_token');
    set({ accessToken: null, isAuthenticated: false });
  },

  loadToken: async () => {
    const token = await SecureStore.getItemAsync('access_token');
    set({ accessToken: token, isAuthenticated: !!token });
  },
}));
