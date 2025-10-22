import { ObjectId, MongoDocument } from '../../types/mongo.type';
import { OrderStatus, PaymentStatus } from './order.interface';

export enum SellerApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  NOT_APPROVED = 'not_approved'
}

export interface ISubOrderItem {
  product: ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ISubOrder extends MongoDocument {
  masterOrder: ObjectId;
  seller: ObjectId;
  buyer: ObjectId;
  orderItems: ISubOrderItem[];
  subtotal: number;
  commission: number;
  commissionRate: number;
  sellerEarnings: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  sellerApprovalStatus: SellerApprovalStatus;
  deliveredAt?: Date;
}
