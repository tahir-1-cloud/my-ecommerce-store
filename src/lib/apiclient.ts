
import { ApiError } from "./apierror";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
  throw new Error(
    "NEXT_PUBLIC_API_BASE_URL is missing in .env.local"
  );
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  // FormData: browser automatically sets multipart boundary.
  // JSON requests: set application/json when a body exists.
  if (isFormData) {
    headers.delete("Content-Type");
  } else if (options.body != null && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Automatically attach access token to authenticated requests.
  if (typeof window !== "undefined" && !headers.has("Authorization")) {
    const token =
      localStorage.getItem("accessToken") ??
      localStorage.getItem("token");

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const baseUrl = API_BASE_URL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.replace(/^\/+/, "");
  const url = `${baseUrl}/${cleanEndpoint}`;

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      "Unable to connect to the server. Check that the API is running.",
      0
    );
  }

  // Handle 204 No Content without attempting JSON parsing.
  if (response.status === 204) {
    if (!response.ok) {
      throw new ApiError(
        `Request failed (${response.status}).`,
        response.status
      );
    }

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
                : response.status === 403
                  ? "You do not have permission to perform this action."
                  : `Request failed (${response.status}).`;

    throw new ApiError(
      message,
      response.status,
      body as ConstructorParameters<typeof ApiError>[2]
    );
  }

  return body as T;
}
