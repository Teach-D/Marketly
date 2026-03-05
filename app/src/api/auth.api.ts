import { useMutation } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { ApiResponse } from '../types/api';

interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

interface LoginDto {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
}

const register = (dto: RegisterDto) =>
  apiClient.post<ApiResponse<{ id: string; email: string }>>('/auth/register', dto).then((r) => r.data.data);

const login = (dto: LoginDto) =>
  apiClient.post<ApiResponse<AuthTokens>>('/auth/login', dto).then((r) => r.data.data);

const logout = () =>
  apiClient.post<ApiResponse<null>>('/auth/logout').then((r) => r.data);

export const useRegister = () =>
  useMutation({ mutationFn: register });

export const useLogin = () =>
  useMutation({ mutationFn: login });

export const useLogout = () =>
  useMutation({ mutationFn: logout });
