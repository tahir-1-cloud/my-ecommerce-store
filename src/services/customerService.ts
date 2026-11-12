
import { apiRequest } from "@/lib/apiclient";

import type {
  CustomerApiResponse,
  CustomerDashboard,
  CustomerAddress,
  CustomerAddressRequest,
  CustomerProfile,
  UpdateCustomerProfileRequest,
  CustomerOrders,
  CustomerOrderDetails,
  CustomerOrderTracking,
} from "@/types/customer";

const endpoint = "customer";

async function getData<T>(url: string): Promise<T> {
  const response = await apiRequest<CustomerApiResponse<T>>(url);

  if (!response.status) {
    throw new Error(response.message || "Request failed.");
  }

  return response.data;
}

async function sendData<T>(
  url: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const response = await apiRequest<CustomerApiResponse<T>>(url, {
    method,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.status) {
    throw new Error(response.message || "Request failed.");
  }

  return response.data;
}

export const customerService = {
  // Dashboard
  getDashboard: () =>
    getData<CustomerDashboard>(`${endpoint}/dashboard`),

  // Profile
  getProfile: () =>
    getData<CustomerProfile>(`${endpoint}/profile`),

  updateProfile: (data: UpdateCustomerProfileRequest) =>
    sendData<CustomerProfile>(`${endpoint}/profile`, "PUT", data),

  // Addresses
  getAddresses: () =>
    getData<CustomerAddress[]>(`${endpoint}/addresses`),

  getAddress: (id: number) =>
    getData<CustomerAddress>(`${endpoint}/addresses/${id}`),

  createAddress: (data: CustomerAddressRequest) =>
    sendData<CustomerAddress>(`${endpoint}/addresses`, "POST", data),

  updateAddress: (id: number, data: CustomerAddressRequest) =>
    sendData<CustomerAddress>(
      `${endpoint}/addresses/${id}`,
      "PUT",
      data
    ),

  deleteAddress: (id: number) =>
    sendData<null>(`${endpoint}/addresses/${id}`, "DELETE"),

  setDefaultAddress: (id: number) =>
    sendData<null>(`${endpoint}/addresses/${id}/default`, "PATCH"),

  // Orders
  getOrders: (page = 1, pageSize = 10) =>
    getData<CustomerOrders>(
      `${endpoint}/orders?page=${page}&pageSize=${pageSize}`
    ),

  getOrderDetails: (id: number) =>
    getData<CustomerOrderDetails>(`${endpoint}/orders/${id}`),

  getOrderTracking: (id: number) =>
    getData<CustomerOrderTracking>(
      `${endpoint}/orders/${id}/tracking`
    ),
};
