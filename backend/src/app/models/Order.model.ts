import mongoose, { Document, Schema } from 'mongoose';

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
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
  seller: mongoose.Types.ObjectId;
}

export interface IShippingAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderItems: IOrderItem[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address?: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  orderStatus: OrderStatus;
  deliveredAt?: Date;
  isMasterOrder: boolean; // True if this is a master order with sub-orders
  subOrders: mongoose.Types.ObjectId[]; // References to sub-orders
  createdAt: Date;
  updatedAt: Date;
}

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

export const Order = mongoose.model<IOrder>('Order', orderSchema);
