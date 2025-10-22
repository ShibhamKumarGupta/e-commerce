import mongoose, { Schema } from 'mongoose';
import { AbstractRepository } from './abstracts/repository.abstract';
import { 
  IOrder, 
  IOrderItem, 
  IShippingAddress,
  OrderStatus, 
  PaymentMethod, 
  PaymentStatus 
} from '../interfaces/order.interface';

const orderItemSchema = new Schema<IOrderItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const shippingAddressSchema = new Schema<IShippingAddress>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true }
});

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderItems: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: function(items: IOrderItem[]) {
          return items.length > 0;
        },
        message: 'Order must have at least one item'
      }
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING
    },
    deliveredAt: {
      type: Date
    },
    isMasterOrder: {
      type: Boolean,
      default: false
    },
    subOrders: [{
      type: Schema.Types.ObjectId,
      ref: 'SubOrder'
    }]
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ 'orderItems.seller': 1, createdAt: -1 });

const OrderModel = mongoose.model<IOrder>('Order', orderSchema);

export class OrderRepository extends AbstractRepository<IOrder> {
  constructor() {
    super(OrderModel);
  }

  async findByUser(userId: string): Promise<IOrder[]> {
    return this.model.find({ user: userId }).sort({ createdAt: -1 }).exec();
  }

  async findBySeller(sellerId: string): Promise<IOrder[]> {
    return this.model.find({ 'orderItems.seller': sellerId }).sort({ createdAt: -1 }).exec();
  }

  async findMasterOrders(): Promise<IOrder[]> {
    return this.model.find({ isMasterOrder: true }).sort({ createdAt: -1 }).exec();
  }
}
