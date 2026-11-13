
export type CheckoutMode = "BuyNow" | "Cart";

export interface AddressRequest {
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state?: string | null;
  postalCode?: string | null;
  country: string;
}

export interface GuestAccountRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface GuestCartItemRequest {
  productVariantId: number;
  quantity: number;
}

export interface CheckoutRequest {
  mode: CheckoutMode;
  productVariantId?: number | null;
  quantity: number;

  guestAccount?: GuestAccountRequest | null;

  shippingAddress: AddressRequest;
  billingAddress?: AddressRequest | null;

  saveAddress: boolean;

  guestCartItems?: GuestCartItemRequest[];
}

export interface CheckoutPreviewRequest {
  mode: CheckoutMode;
  productVariantId?: number;
  quantity: number;
  guestCartItems: {
    productVariantId: number;
    quantity: number;
  }[];
}

export interface CheckoutItem {
  productId: number;
  productVariantId: number;
  productName: string;
  sku: string;
  imageUrl?: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  availableStock: number;
}

export interface CheckoutResponse {
  items: CheckoutItem[];
  subtotal: number;
  shippingAmount: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface OrderResponse {
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
}

export interface CheckoutAuthResponse {
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
}

export interface PlaceOrderResponse {
  order: OrderResponse;
  authentication: CheckoutAuthResponse | null;
}
