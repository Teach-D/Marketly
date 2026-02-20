import { useMutation } from '@tanstack/react-query';
import apiClient from './axios';
import { useAuthStore } from '../store/auth.store';
import type { User } from '../types';

interface LoginDto {
  email: string;
  password: string;
}

interface RegisterDto {
  email: string;
  password: string;
}

function decodeToken(token: string): User {
  const payload = JSON.parse(atob(token.split('.')[1])) as {
    sub: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
  return { id: payload.sub, email: payload.email, role: payload.role };
}

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  return useMutation({
    mutationFn: (dto: LoginDto) =>
      apiClient
        .post<{ data: { accessToken: string } }>('/auth/login', dto)
        .then((r) => r.data),
    onSuccess: ({ data }) => {
      const token = data.accessToken;
      setAuth(token, decodeToken(token));
    },
  });
};

export const useRegister = () =>
  useMutation({
    mutationFn: (dto: RegisterDto) => apiClient.post('/auth/register', dto),
  });

export const useLogout = () => {
  const { clearAuth } = useAuthStore();
  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => clearAuth(),
  });
};
