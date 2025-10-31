import { AbstractService } from './abstracts/service.abstract';
import { SubOrderRepository } from '../domain/repositories/subOrder.repository';
import { ISubOrder, SellerApprovalStatus } from '../domain/interfaces/subOrder.interface';
import { OrderStatus, PaymentStatus } from '../domain/interfaces/order.interface';
import { ErrorHelper } from '../helpers/error.helper';
import { Types } from 'mongoose';

export interface SubOrderQuery {
  seller?: string;
  buyer?: string;
  masterOrder?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
}

export class SubOrderService extends AbstractService<ISubOrder> {
  private subOrderRepository: SubOrderRepository;

  constructor() {
    const repository = new SubOrderRepository();
    super(repository);
    this.subOrderRepository = repository;
  }

  async createSubOrder(
    masterOrderId: string,
    sellerId: string,
    buyerId: string,
    orderItems: any[],
    commissionRate: number
  ): Promise<ISubOrder> {
    const subtotal = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const commission = (subtotal * commissionRate) / 100;
    const sellerEarnings = subtotal - commission;

    const subOrder = await this.subOrderRepository.create({
      masterOrder: masterOrderId,
      seller: sellerId,
      buyer: buyerId,
      orderItems,
      subtotal,
      commission,
      commissionRate,
      sellerEarnings,
      orderStatus: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      earningsReleased: false // Earnings not released until delivery
    } as any);

    return subOrder;
  }

  async getSubOrderById(subOrderId: string): Promise<ISubOrder> {
    const subOrder = await this.subOrderRepository.findById(subOrderId, {
      populate: ['seller', 'buyer', 'masterOrder', 'orderItems.product']
    });

    if (!subOrder) {
      throw ErrorHelper.notFound('Sub-order not found');
    }

    return subOrder;
  }

  async getSubOrdersByMasterOrder(masterOrderId: string): Promise<ISubOrder[]> {
    const subOrders = await this.subOrderRepository.find(
      { masterOrder: masterOrderId } as any,
      { populate: ['seller', 'orderItems.product'] }
    );

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

    const total = await this.subOrderRepository.count(filter);
    const subOrders = await this.subOrderRepository.find(filter, {
      populate: ['buyer', 'masterOrder', 'orderItems.product'],
      limit,
      page,
      sort: { createdAt: -1 }
    });

    return {
      subOrders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async updateSubOrderStatus(subOrderId: string, status: OrderStatus, sellerId?: string): Promise<ISubOrder> {
    console.log(`[SubOrder Service] Updating sub-order ${subOrderId} to status: ${status}`);
    const subOrder = await this.subOrderRepository.findById(subOrderId, {
      populate: ['masterOrder']
    });

    if (!subOrder) {
      throw ErrorHelper.notFound('Sub-order not found');
    }

    if (sellerId && subOrder.seller.toString() !== sellerId) {
      throw ErrorHelper.forbidden('You can only update your own orders');
    }

    const oldStatus = subOrder.orderStatus;
    subOrder.orderStatus = status;
    console.log(`[SubOrder Service] Changed status from ${oldStatus} to ${status}`);

    if (status === OrderStatus.DELIVERED) {
      subOrder.deliveredAt = new Date();
      console.log(`[SubOrder Service] Set deliveredAt timestamp`);
      
      const masterOrder = subOrder.masterOrder as any;
      
      // Release earnings when order is delivered (for both COD and Stripe)
      // This ensures earnings are only counted after admin approves delivery
      if (!subOrder.earningsReleased) {
        console.log(`[SubOrder Service] Releasing earnings for delivered order`);
        subOrder.earningsReleased = true;
      }
      
      // Update payment status based on payment method
      // COD: Payment received on delivery
      // Stripe: Sync payment status to PAID if not already (should already be PAID from payment)
      if (masterOrder && subOrder.paymentStatus !== PaymentStatus.PAID) {
        console.log(`[SubOrder Service] Checking payment status. Master payment method: ${masterOrder.paymentMethod}, Current payment status: ${subOrder.paymentStatus}`);
        if (masterOrder.paymentMethod === 'cod') {
          console.log(`[SubOrder Service] COD order - setting payment to PAID`);
          subOrder.paymentStatus = PaymentStatus.PAID;
        } else if (masterOrder.paymentMethod === 'stripe' && masterOrder.paymentStatus === PaymentStatus.PAID) {
          console.log(`[SubOrder Service] Stripe order with PAID master - setting payment to PAID`);
          subOrder.paymentStatus = PaymentStatus.PAID;
        }
      }
    }

    await subOrder.save();
    console.log(`[SubOrder Service] Sub-order ${subOrderId} saved successfully`);
    return subOrder;
  }

  async updateSellerApproval(subOrderId: string, approvalStatus: SellerApprovalStatus, sellerId: string): Promise<ISubOrder> {
    const subOrder = await this.subOrderRepository.findById(subOrderId);

    if (!subOrder) {
      throw ErrorHelper.notFound('Sub-order not found');
    }

    if (subOrder.seller.toString() !== sellerId) {
      throw ErrorHelper.forbidden('You can only update approval status for your own orders');
    }

    subOrder.sellerApprovalStatus = approvalStatus;

    await subOrder.save();
    return subOrder;
  }

  async updateSubOrderPaymentStatus(
    subOrderId: string,
    paymentStatus: PaymentStatus
  ): Promise<ISubOrder> {
    console.log(`[SubOrder Service] Updating payment status for sub-order ${subOrderId} to ${paymentStatus}`);
    const subOrder = await this.subOrderRepository.findById(subOrderId);

    if (!subOrder) {
      throw ErrorHelper.notFound('Sub-order not found');
    }

    const oldPaymentStatus = subOrder.paymentStatus;
    const currentOrderStatus = subOrder.orderStatus;
    subOrder.paymentStatus = paymentStatus;

    // Only set status to PROCESSING if payment becomes PAID and current status is PENDING
    // Don't override if order is already in a later stage (SHIPPED, DELIVERED, etc.)
    if (paymentStatus === PaymentStatus.PAID && subOrder.orderStatus === OrderStatus.PENDING) {
      console.log(`[SubOrder Service] Setting order status to PROCESSING (was PENDING)`);
      subOrder.orderStatus = OrderStatus.PROCESSING;
    } else {
      console.log(`[SubOrder Service] Keeping order status as ${currentOrderStatus} (not changing)`);
    }

    await subOrder.save();
    console.log(`[SubOrder Service] Updated payment status from ${oldPaymentStatus} to ${paymentStatus}`);
    return subOrder;
  }

  async updateSubOrderRefundResult(subOrderId: string, refundResult: any): Promise<ISubOrder> {
    const subOrder = await this.subOrderRepository.findById(subOrderId);

    if (!subOrder) {
      throw ErrorHelper.notFound('Sub-order not found');
    }

    (subOrder as any).refundResult = {
      id: refundResult.id,
      paymentIntentId: refundResult.paymentIntentId,
      status: refundResult.status,
      amount: refundResult.amount,
      currency: refundResult.currency,
      refundedAt: new Date()
    };

    // When refunded, earnings should no longer be counted
    if (subOrder.earningsReleased) {
      console.log(`[SubOrder Service] Revoking earnings for refunded order ${subOrderId}`);
      subOrder.earningsReleased = false;
    }

    await subOrder.save();
    return subOrder;
  }

  async getSellerEarnings(sellerId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = {
      seller: new Types.ObjectId(sellerId),
      earningsReleased: true // Only count earnings that have been released (after delivery)
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const result = await this.subOrderRepository.model.aggregate([
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
    const totalSubOrders = await this.subOrderRepository.count({ seller: sellerId });
    const pendingOrders = await this.subOrderRepository.count({ seller: sellerId, orderStatus: OrderStatus.PENDING });
    const processingOrders = await this.subOrderRepository.count({ seller: sellerId, orderStatus: OrderStatus.PROCESSING });
    const shippedOrders = await this.subOrderRepository.count({ seller: sellerId, orderStatus: OrderStatus.SHIPPED });
    const deliveredOrders = await this.subOrderRepository.count({ seller: sellerId, orderStatus: OrderStatus.DELIVERED });
    const cancelledOrders = await this.subOrderRepository.count({ seller: sellerId, orderStatus: OrderStatus.CANCELLED });

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

    const total = await this.subOrderRepository.count(filter);
    const subOrders = await this.subOrderRepository.find(filter, {
      populate: ['seller', 'buyer', 'masterOrder', 'orderItems.product'],
      limit,
      page,
      sort: { createdAt: -1 }
    });

    return {
      subOrders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getCommissionBreakdown(startDate?: Date, endDate?: Date): Promise<any> {
    const filter: any = {
      earningsReleased: true // Only count earnings that have been released (after delivery)
    };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    const result = await this.subOrderRepository.model.aggregate([
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

    const totalResult = await this.subOrderRepository.model.aggregate([
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

  async getSellerMonthlyRevenue(sellerId: string, year?: number): Promise<any[]> {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const monthlyData = await this.subOrderRepository.model.aggregate([
      {
        $match: {
          seller: new (require('mongoose').Types.ObjectId)(sellerId),
          earningsReleased: true, // Only count earnings that have been released (after delivery)
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$sellerEarnings' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing months with 0
    const result = Array.from({ length: 12 }, (_, i) => {
      const monthData = monthlyData.find(d => d._id === i + 1);
      return {
        month: i + 1,
        revenue: monthData ? monthData.revenue : 0,
        orderCount: monthData ? monthData.orderCount : 0
      };
    });

    return result;
  }

  async getSellerTopProducts(sellerId: string, limit: number = 5): Promise<any[]> {
    const topProducts = await this.subOrderRepository.model.aggregate([
      { 
        $match: { 
          seller: new (require('mongoose').Types.ObjectId)(sellerId),
          earningsReleased: true // Only count earnings that have been released (after delivery)
        } 
      },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSales: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } }
        }
      },
      { $sort: { totalSales: -1 } },
      { $limit: limit }
    ]);

    return topProducts;
  }

  async getSellerOrdersByStatus(sellerId: string): Promise<any> {
    const statuses = [
      OrderStatus.PENDING,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
      OrderStatus.CANCELLED
    ];

    const result: any = {};
    for (const status of statuses) {
      result[status] = await this.subOrderRepository.count({ 
        seller: sellerId, 
        orderStatus: status 
      });
    }

    return result;
  }
}
