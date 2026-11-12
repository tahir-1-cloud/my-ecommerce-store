
export interface CustomerApiResponse<T> {
  status: boolean;
  message: string;
  data: T;
}

export interface CustomerRecentOrder {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  itemsCount: number;
}

export interface CustomerDashboard {
  customerName: string;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  deliveredOrders: number;
  totalSpent: number;
  recentOrders: CustomerRecentOrder[];
}

export type AddressType = "Shipping" | "Billing";

export interface CustomerAddress {
  id: number;
  type: AddressType;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface CustomerAddressRequest {
  type: AddressType;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
}

export interface CustomerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export interface UpdateCustomerProfileRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
}

export interface CustomerOrder {
  id: number;
  orderNumber: string;
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
}

export interface CustomerOrders {
  orders: CustomerOrder[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CustomerOrderItem {
  id: number;
  productVariantId: number;
  productName: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface CustomerOrderAddress {
  type: AddressType;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
}

export interface CustomerOrderDetails {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  createdAt: string;
  items: CustomerOrderItem[];
  addresses: CustomerOrderAddress[];
}

export interface OrderTrackingHistory {
  status: string;
  note: string | null;
  createdAt: string;
}

export interface CustomerOrderTracking {
  orderId: number;
  orderNumber: string;
  currentStatus: string;
  history: OrderTrackingHistory[];
}
