
import { apiRequest } from "@/lib/apiclient";
import type {
  CheckoutPreviewRequest,
  CheckoutRequest,
  CheckoutResponse,
  PlaceOrderResponse,
} from "@/types/checkout";

interface ApiResponse<T> {
  status: boolean;
  message?: string;
  data: T;
}

const endpoint = "checkout";

export const checkoutService = {
  getPreview: async (params: CheckoutPreviewRequest) => {
    const query = new URLSearchParams({
      mode: params.mode,
      quantity: String(params.quantity),
    });

    if (params.productVariantId) {
      query.append("productVariantId", String(params.productVariantId));
    }

    const response = await apiRequest<ApiResponse<CheckoutResponse>>(
      `${endpoint}/preview?${query.toString()}`
    );

    return response.data;
  },

  placeOrder: async (data: CheckoutRequest) => {
    const response = await apiRequest<ApiResponse<PlaceOrderResponse>>(
      `${endpoint}/orders`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );

    return response.data;
  },
};
