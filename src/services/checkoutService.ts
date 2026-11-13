
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
getPreview: async (data: CheckoutPreviewRequest) => {
  const response = await apiRequest<ApiResponse<CheckoutResponse>>(
    `${endpoint}/preview`,
    {
      method: "POST",
      body: JSON.stringify(data),
    }
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
