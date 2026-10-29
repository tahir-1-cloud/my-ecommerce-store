
import { apiRequest } from "@/lib/apiclient";
import type { Category, CategoryRequest } from "@/types/category";

const endpoint = "categories";

function toFormData(data: CategoryRequest): FormData {
  const formData = new FormData();

  formData.append("Name", data.name.trim());
  formData.append("Description", data.description ?? "");
  formData.append("IsActive", String(data.isActive));

  if (data.image) {
    formData.append("Image", data.image);
  }

  return formData;
}

export const categoryService = {
  getAll: () =>
    apiRequest<Category[]>(endpoint),

  getById: (id: number) =>
    apiRequest<Category>(`${endpoint}/${id}`),

  create: (data: CategoryRequest) =>
    apiRequest<Category>(endpoint, {
      method: "POST",
      body: toFormData(data),
    }),

  update: (id: number, data: CategoryRequest) =>
    apiRequest<Category>(`${endpoint}/${id}`, {
      method: "PUT",
      body: toFormData(data),
    }),

  delete: (id: number) =>
    apiRequest<void>(`${endpoint}/${id}`, {
      method: "DELETE",
    }),
};
