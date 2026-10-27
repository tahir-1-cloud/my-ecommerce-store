import { apiRequest } from "@/lib/apiclient";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

export interface CategoryRequest {
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
}

const endpoint = "categories";

export const categoryService = {
  getAll: () =>
    apiRequest<Category[]>(endpoint),

  create: (data: CategoryRequest) =>
    apiRequest<Category>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: CategoryRequest) =>
    apiRequest<Category>(`${endpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiRequest<void>(`${endpoint}/${id}`, {
      method: "DELETE",
    }),
};