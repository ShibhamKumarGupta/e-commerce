import { ObjectId, MongoDocument } from '../../types/mongo.type';

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

export interface IOrderItem {
  product: ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
  seller: ObjectId;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IPaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address?: string;
}

export interface IRefundResult {
  id: string;
  paymentIntentId: string;
  status: string;
  amount: number;
  currency: string;
  refundedAt: Date;
}

export interface IOrder extends MongoDocument {
  user: ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentResult?: IPaymentResult;
  refundResult?: IRefundResult;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  deliveredAt?: Date;
  isMasterOrder: boolean;
  subOrders: ObjectId[];
}
