import { ObjectId, MongoDocument } from '../../types/mongo.type';
import { OrderStatus, PaymentStatus } from './order.interface';

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
  deliveredAt?: Date;
}
