
export type OrderStatus =
  | 1 // Pending
  | 2 // Confirmed
  | 3 // Processing
  | 4 // Shipped
  | 5 // OutForDelivery
  | 6 // Delivered
  | 7 // Cancelled
  | 8; // Returned

export interface AdminOrderItem {
  productVariantId: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface AdminOrderAddress {
  type: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface AdminOrderPayment {
  provider: string;
  method: string;
  transactionId?: string | null;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string | null;
}

export interface AdminOrderHistory {
  status: string;
  note?: string | null;
  createdAt: string;
}

export interface AdminOrder {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;

  status: string;
  paymentStatus: string;
  paymentMethod: string;

  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;

  createdAt: string;
  itemsCount: number;

  items: AdminOrderItem[];
  addresses: AdminOrderAddress[];
  payments: AdminOrderPayment[];
  statusHistory: AdminOrderHistory[];
}

export interface AdminOrderSummary {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface UpdateAdminOrderStatusRequest {
  status: OrderStatus;
  note?: string | null;
}

export interface OrdersPagination {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface AdminOrdersResponse {
  status: boolean;
  data: AdminOrder[];
  pagination: OrdersPagination;
}

export interface AdminOrderResponse {
  status: boolean;
  data: AdminOrder;
}

export interface AdminOrderSummaryResponse {
  status: boolean;
  data: AdminOrderSummary;
}
