export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  COD = 'cod',
  STRIPE = 'stripe'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  seller: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface Order {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address?: string;
  };
  refundResult?: {
    id: string;
    paymentIntentId: string;
    status: string;
    amount: number;
    currency: string;
    refundedAt: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  deliveredAt?: string;
  isMasterOrder: boolean;
  subOrders: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  orderItems: Array<{
    product: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}
