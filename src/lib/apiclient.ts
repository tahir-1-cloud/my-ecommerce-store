
import { ApiError } from "./apierror";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is missing in .env.local");
}

type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
  };
};

let refreshPromise: Promise<string | null> | null = null;

function getBaseUrl() {
  return API_BASE_URL!.replace(/\/+$/, "");
}

function getUrl(endpoint: string) {
  return `${getBaseUrl()}/${endpoint.replace(/^\/+/, "")}`;
}

function clearSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("accessTokenExpiresAt");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function saveSession(response: AuthResponse) {
  localStorage.setItem("accessToken", response.accessToken);
  localStorage.setItem("refreshToken", response.refreshToken);
  localStorage.setItem(
    "accessTokenExpiresAt",
    response.accessTokenExpiresAt
  );
  localStorage.setItem("user", JSON.stringify(response.user));
}

function isAuthEndpoint(endpoint: string) {
  const clean = endpoint.replace(/^\/+/, "").toLowerCase();

  return [
    "auth/login",
    "auth/register",
    "auth/refresh-token",
    "auth/logout",
  ].some((path) => clean === path);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();

  let body: unknown;

  try {
    body = responseText ? JSON.parse(responseText) : null;
  } catch {
    body = responseText;
  }

  if (!response.ok) {
    const errorBody =
      body && typeof body === "object"
        ? (body as Record<string, unknown>)
        : {};

    const message =
      typeof errorBody.message === "string"
        ? errorBody.message
        : typeof errorBody.title === "string"
          ? errorBody.title
          : typeof errorBody.detail === "string"
            ? errorBody.detail
            : typeof errorBody.error === "string"
              ? errorBody.error
              : response.status === 401
                ? "Please sign in to continue."
                : `Request failed (${response.status}).`;

    throw new ApiError(
      message,
      response.status,
      body as ConstructorParameters<typeof ApiError>[2]
    );
  }

  return body as T;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    clearSession();
    return null;
  }

  try {
    const response = await fetch(getUrl("auth/refresh-token"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    });

    const data = await parseResponse<AuthResponse>(response);

    if (!data.accessToken || !data.refreshToken) {
      throw new Error("Invalid refresh token response.");
    }

    // Backend rotates both tokens, so save both.
    saveSession(data);

    return data.accessToken;
  } catch {
    clearSession();
    return null;
  }
}

async function getNewAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function createHeaders(options: RequestInit, token?: string | null) {
  const headers = new Headers(options.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  if (isFormData) {
    headers.delete("Content-Type");
  } else if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const isAuth = isAuthEndpoint(endpoint);

  const currentToken =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ??
        localStorage.getItem("token")
      : null;

  const sendRequest = (token: string | null) => {
    return fetch(getUrl(endpoint), {
      ...options,
      headers: createHeaders(options, token),
      cache: "no-store",
    });
  };

  let response: Response;

  try {
    response = await sendRequest(currentToken);
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Check that the API is running.",
      0
    );
  }

  // Refresh only for authenticated API requests.
  if (
    response.status === 401 &&
    !isAuth &&
    typeof window !== "undefined"
  ) {
    const newToken = await getNewAccessToken();

    if (!newToken) {
      throw new ApiError(
        "Your session has expired. Please sign in again.",
        401
      );
    }

    try {
      // Retry the original request exactly once.
      response = await sendRequest(newToken);
    } catch {
      throw new ApiError(
        "Unable to connect to the server. Check that the API is running.",
        0
      );
    }
  }

  return parseResponse<T>(response);
}
