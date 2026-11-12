
import { apiRequest } from "@/lib/apiclient";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from "@/types/auth";

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

const endpoint = "auth";

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await apiRequest<ApiResponse<AuthResponse>>(
      `${endpoint}/login`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return response.data;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiRequest<ApiResponse<AuthResponse>>(
      `${endpoint}/register`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const response = await apiRequest<ApiResponse<AuthResponse>>(
      `${endpoint}/refresh-token`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return response.data;
  },

  logout: async () => {
    await apiRequest<void>(`${endpoint}/logout`, {
      method: "POST",
    });
  },
};
