
import { apiRequest } from "@/lib/apiclient";

import type {
  AdminOrdersResponse,
  AdminOrderResponse,
  AdminOrderSummaryResponse,
  UpdateAdminOrderStatusRequest,
} from "@/types/orders";

export const adminOrderService = {
  getAll: (
    page: number = 1,
    pageSize: number = 10,
    status?: number,
    search?: string
  ) => {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (status !== undefined) {
      params.append("status", status.toString());
    }

    if (search?.trim()) {
      params.append("search", search.trim());
    }

    return apiRequest<AdminOrdersResponse>(
      `admin/orders/GetAllOrders?${params.toString()}`
    );
  },

  getSummary: () =>
    apiRequest<AdminOrderSummaryResponse>(
      "admin/orders/summary"
    ),

  getById: (id: number) =>
    apiRequest<AdminOrderResponse>(
      `admin/orders/${id}`
    ),

  updateStatus: (
    id: number,
    data: UpdateAdminOrderStatusRequest
  ) =>
    apiRequest<{ status: boolean; message: string }>(
      `admin/orders/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),
};
