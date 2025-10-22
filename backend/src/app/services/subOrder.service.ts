import { AbstractService } from './abstracts/service.abstract';
import { SubOrderRepository } from '../domain/repositories/subOrder.repository';
import { ISubOrder, SellerApprovalStatus } from '../domain/interfaces/subOrder.interface';
import { OrderStatus, PaymentStatus } from '../domain/interfaces/order.interface';
import { ErrorHelper } from '../helpers/error.helper';

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
      paymentStatus: PaymentStatus.PENDING
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
    const subOrder = await this.subOrderRepository.findById(subOrderId, {
      populate: ['masterOrder']
    });

    if (!subOrder) {
      throw ErrorHelper.notFound('Sub-order not found');
    }

    if (sellerId && subOrder.seller.toString() !== sellerId) {
      throw ErrorHelper.forbidden('You can only update your own orders');
    }

    subOrder.orderStatus = status;

    if (status === OrderStatus.DELIVERED) {
      subOrder.deliveredAt = new Date();
      
      // Auto-update payment status to 'paid' for COD orders when delivered
      const masterOrder = subOrder.masterOrder as any;
      if (masterOrder && masterOrder.paymentMethod === 'cod' && subOrder.paymentStatus !== PaymentStatus.PAID) {
        subOrder.paymentStatus = PaymentStatus.PAID;
      }
    }

    await subOrder.save();
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
    const subOrder = await this.subOrderRepository.findById(subOrderId);

    if (!subOrder) {
      throw ErrorHelper.notFound('Sub-order not found');
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
      paymentStatus: PaymentStatus.PAID
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
          paymentStatus: PaymentStatus.PAID,
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
          paymentStatus: PaymentStatus.PAID 
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
