import { SubOrder, ISubOrder } from '../models/subOrder.model';
import { User } from '../models/User.model';
import { OrderStatus, PaymentStatus } from '../models/Order.model';
import { ApiError } from '../utils/ApiError.util';

export interface SubOrderQuery {
  seller?: string;
  buyer?: string;
  masterOrder?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
}

export class SubOrderService {
  async createSubOrder(
    masterOrderId: string,
    sellerId: string,
    buyerId: string,
    orderItems: any[],
    commissionRate: number
  ): Promise<ISubOrder> {
    // Calculate subtotal
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    // Calculate commission and seller earnings
    const commission = (subtotal * commissionRate) / 100;
    const sellerEarnings = subtotal - commission;

    const subOrder = await SubOrder.create({
      masterOrder: masterOrderId,
      seller: sellerId,
      buyer: buyerId,
      orderItems,
      subtotal,
      commission,
      commissionRate,
      sellerEarnings,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING
    });

    return subOrder;
  }

  async getSubOrderById(subOrderId: string): Promise<ISubOrder> {
    const subOrder = await SubOrder.findById(subOrderId)
      .populate('seller', 'name email')
      .populate('buyer', 'name email')
      .populate('masterOrder')
      .populate('orderItems.product', 'name');

    if (!subOrder) {
      throw ApiError.notFound('Sub-order not found');
    }

    return subOrder;
  }

  async getSubOrdersByMasterOrder(masterOrderId: string): Promise<ISubOrder[]> {
    const subOrders = await SubOrder.find({ masterOrder: masterOrderId })
      .populate('seller', 'name email')
      .populate('orderItems.product', 'name');

    return subOrders;
  }

  async getSellerSubOrders(
    sellerId: string,
    query: SubOrderQuery
  ): Promise<{ subOrders: ISubOrder[]; total: number; page: number; pages: number }> {
    const { status, paymentStatus, page = 1, limit = 10 } = query;
    const filter: any = { seller: sellerId };

    if (status) {
      filter.orderStatus = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const skip = (page - 1) * limit;
    const total = await SubOrder.countDocuments(filter);
    const subOrders = await SubOrder.find(filter)
      .populate('buyer', 'name email')
      .populate('masterOrder', 'createdAt')
      .populate('orderItems.product', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    return {
      subOrders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async updateSubOrderStatus(subOrderId: string, status: OrderStatus, sellerId?: string): Promise<ISubOrder> {
    const subOrder = await SubOrder.findById(subOrderId);

    if (!subOrder) {
      throw ApiError.notFound('Sub-order not found');
    }

    // If seller is provided, verify ownership
    if (sellerId && subOrder.seller.toString() !== sellerId) {
      throw ApiError.forbidden('You can only update your own orders');
    }

    subOrder.orderStatus = status;

    if (status === OrderStatus.DELIVERED) {
      subOrder.deliveredAt = new Date();
    }

    await subOrder.save();
    return subOrder;
  }

  async updateSubOrderPaymentStatus(
    subOrderId: string,
    paymentStatus: PaymentStatus
  ): Promise<ISubOrder> {
    const subOrder = await SubOrder.findById(subOrderId);

    if (!subOrder) {
      throw ApiError.notFound('Sub-order not found');
    }

    subOrder.paymentStatus = paymentStatus;

    if (paymentStatus === PaymentStatus.PAID) {
      subOrder.orderStatus = OrderStatus.PROCESSING;
    }

    await subOrder.save();
    return subOrder;
  }

  async getSellerEarnings(sellerId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = {
      seller: sellerId,
      paymentStatus: PaymentStatus.PAID
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const result = await SubOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$sellerEarnings' },
          totalCommission: { $sum: '$commission' },
          totalSubtotal: { $sum: '$subtotal' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return {
        totalEarnings: 0,
        totalCommission: 0,
        totalSubtotal: 0,
        orderCount: 0
      };
    }

    return result[0];
  }

  async getSellerStats(sellerId: string): Promise<any> {
    const totalSubOrders = await SubOrder.countDocuments({ seller: sellerId });
    const pendingOrders = await SubOrder.countDocuments({ seller: sellerId, orderStatus: OrderStatus.PENDING });
    const processingOrders = await SubOrder.countDocuments({ seller: sellerId, orderStatus: OrderStatus.PROCESSING });
    const shippedOrders = await SubOrder.countDocuments({ seller: sellerId, orderStatus: OrderStatus.SHIPPED });
    const deliveredOrders = await SubOrder.countDocuments({ seller: sellerId, orderStatus: OrderStatus.DELIVERED });
    const cancelledOrders = await SubOrder.countDocuments({ seller: sellerId, orderStatus: OrderStatus.CANCELLED });

    const earnings = await this.getSellerEarnings(sellerId);

    return {
      totalSubOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      ...earnings
    };
  }

  // Admin method to get all sub-orders
  async getAllSubOrders(query: SubOrderQuery): Promise<{ subOrders: ISubOrder[]; total: number; page: number; pages: number }> {
    const { seller, buyer, masterOrder, status, paymentStatus, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (seller) {
      filter.seller = seller;
    }

    if (buyer) {
      filter.buyer = buyer;
    }

    if (masterOrder) {
      filter.masterOrder = masterOrder;
    }

    if (status) {
      filter.orderStatus = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const skip = (page - 1) * limit;
    const total = await SubOrder.countDocuments(filter);
    const subOrders = await SubOrder.find(filter)
      .populate('seller', 'name email')
      .populate('buyer', 'name email')
      .populate('masterOrder', 'createdAt totalPrice')
      .populate('orderItems.product', 'name')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    return {
      subOrders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Admin method to get commission breakdown
  async getCommissionBreakdown(startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = {
      paymentStatus: PaymentStatus.PAID
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const result = await SubOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$seller',
          totalEarnings: { $sum: '$sellerEarnings' },
          totalCommission: { $sum: '$commission' },
          totalSubtotal: { $sum: '$subtotal' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'sellerInfo'
        }
      },
      {
        $unwind: '$sellerInfo'
      },
      {
        $project: {
          sellerId: '$_id',
          sellerName: '$sellerInfo.name',
          sellerEmail: '$sellerInfo.email',
          totalEarnings: 1,
          totalCommission: 1,
          totalSubtotal: 1,
          orderCount: 1
        }
      },
      {
        $sort: { totalCommission: -1 }
      }
    ]);

    const totalResult = await SubOrder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$sellerEarnings' },
          totalCommission: { $sum: '$commission' },
          totalSubtotal: { $sum: '$subtotal' },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    return {
      breakdown: result,
      totals: totalResult.length > 0 ? totalResult[0] : {
        totalEarnings: 0,
        totalCommission: 0,
        totalSubtotal: 0,
        orderCount: 0
      }
    };
  }
}
