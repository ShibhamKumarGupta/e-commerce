import mongoose, { Schema } from 'mongoose';
import { AbstractRepository } from './abstracts/repository.abstract';
import { ISubOrder, ISubOrderItem, SellerApprovalStatus } from '../interfaces/subOrder.interface';
import { OrderStatus, PaymentStatus } from '../interfaces/order.interface';

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
    sellerApprovalStatus: {
      type: String,
      enum: Object.values(SellerApprovalStatus),
      default: SellerApprovalStatus.PENDING
    },
    earningsReleased: {
      type: Boolean,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    refundResult: {
      id: String,
      paymentIntentId: String,
      status: String,
      amount: Number,
      currency: String,
      refundedAt: Date
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

const SubOrderModel = mongoose.model<ISubOrder>('SubOrder', subOrderSchema);

export class SubOrderRepository extends AbstractRepository<ISubOrder> {
  constructor() {
    super(SubOrderModel);
  }

  async findBySeller(sellerId: string): Promise<ISubOrder[]> {
    return this.model.find({ seller: sellerId }).sort({ createdAt: -1 }).exec();
  }

  async findByMasterOrder(masterOrderId: string): Promise<ISubOrder[]> {
    return this.model.find({ masterOrder: masterOrderId }).exec();
  }

  async findByBuyer(buyerId: string): Promise<ISubOrder[]> {
    return this.model.find({ buyer: buyerId }).sort({ createdAt: -1 }).exec();
  }
}
