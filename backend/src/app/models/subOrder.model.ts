import mongoose, { Document, Schema } from 'mongoose';
import { OrderStatus, PaymentStatus } from './Order.model';

export interface ISubOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface ISubOrder extends Document {
  masterOrder: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  orderItems: ISubOrderItem[];
  subtotal: number;
  commission: number;
  commissionRate: number;
  sellerEarnings: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subOrderItemSchema = new Schema<ISubOrderItem>({
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
  }
});

const subOrderSchema = new Schema<ISubOrder>(
  {
    masterOrder: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderItems: {
      type: [subOrderItemSchema],
      required: true,
      validate: {
        validator: function(items: ISubOrderItem[]) {
          return items.length > 0;
        },
        message: 'Sub-order must have at least one item'
      }
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    commission: {
      type: Number,
      required: true,
      min: 0
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    sellerEarnings: {
      type: Number,
      required: true,
      min: 0
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING
    },
    deliveredAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Index for efficient queries
subOrderSchema.index({ seller: 1, createdAt: -1 });
subOrderSchema.index({ masterOrder: 1 });
subOrderSchema.index({ buyer: 1, createdAt: -1 });

export const SubOrder = mongoose.model<ISubOrder>('SubOrder', subOrderSchema);
