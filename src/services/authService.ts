
import { apiRequest } from "@/lib/apiclient";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
} from "@/types/auth";

const endpoint = "auth";

export function saveAuthSession(response: AuthResponse) {
  if (typeof window === "undefined") return;

  localStorage.setItem("accessToken", response.accessToken);
  localStorage.setItem("refreshToken", response.refreshToken);
  localStorage.setItem(
    "accessTokenExpiresAt",
    response.accessTokenExpiresAt
  );
  localStorage.setItem("user", JSON.stringify(response.user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("accessTokenExpiresAt");
  localStorage.removeItem("user");
}

export const authService = {
  login: async (data: LoginRequest) => {
    const response = await apiRequest<AuthResponse>(
      `${endpoint}/login`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    saveAuthSession(response);
    return response;
  },

  register: async (data: RegisterRequest) => {
    const response = await apiRequest<AuthResponse>(
      `${endpoint}/register`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    saveAuthSession(response);
    return response;
  },

  refreshToken: async (data: RefreshTokenRequest) => {
    const response = await apiRequest<AuthResponse>(
      `${endpoint}/refresh-token`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    saveAuthSession(response);
    return response;
  },

  logout: async () => {
    try {
      await apiRequest<void>(`${endpoint}/logout`, {
        method: "POST",
      });
    } finally {
      clearAuthSession();
    }
  },
};
