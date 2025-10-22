import { AbstractService } from './abstracts/service.abstract';
import { OrderRepository } from '../domain/repositories/order.repository';
import { ProductRepository } from '../domain/repositories/product.repository';
import { UserRepository } from '../domain/repositories/user.repository';
import { IOrder, OrderStatus, PaymentStatus, PaymentMethod } from '../domain/interfaces/order.interface';
import { ErrorHelper } from '../helpers/error.helper';
import { SubOrderService } from './subOrder.service';

export interface CreateOrderDTO {
  user: string;
  orderItems: Array<{
    product: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: PaymentMethod;
}

export interface OrderQuery {
  user?: string;
  seller?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  page?: number;
  limit?: number;
}

export class OrderService extends AbstractService<IOrder> {
  private orderRepository: OrderRepository;
  private productRepository: ProductRepository;
  private userRepository: UserRepository;
  private subOrderService: SubOrderService;

  constructor() {
    const repository = new OrderRepository();
    super(repository);
    this.orderRepository = repository;
    this.productRepository = new ProductRepository();
    this.userRepository = new UserRepository();
    this.subOrderService = new SubOrderService();
  }

  async createOrder(data: CreateOrderDTO): Promise<IOrder> {
    const orderItems = await Promise.all(
      data.orderItems.map(async (item) => {
        const product = await this.productRepository.findById(item.product);

        if (!product) {
          throw ErrorHelper.notFound(`Product ${item.product} not found`);
        }

        if (product.stock < item.quantity) {
          throw ErrorHelper.badRequest(`Insufficient stock for ${product.name}`);
        }

        return {
          product: product._id,
          name: product.name,
          quantity: item.quantity,
          price: product.price,
          image: product.images[0] || '',
          seller: product.seller
        };
      })
    );

    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxPrice = itemsPrice * 0.1;
    const shippingPrice = itemsPrice > 100 ? 0 : 10;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const order = await this.orderRepository.create({
      user: data.user,
      orderItems,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
      isMasterOrder: true
    } as any);

    const itemsBySeller = new Map<string, any[]>();
    orderItems.forEach(item => {
      const sellerId = item.seller.toString();
      if (!itemsBySeller.has(sellerId)) {
        itemsBySeller.set(sellerId, []);
      }
      itemsBySeller.get(sellerId)!.push({
        product: item.product,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image
      });
    });

    const subOrderIds: any[] = [];
    for (const [sellerId, items] of itemsBySeller) {
      const seller = await this.userRepository.findById(sellerId);
      const commissionRate = seller?.commissionRate || 10;

      const subOrder = await this.subOrderService.createSubOrder(
        order._id.toString(),
        sellerId,
        data.user,
        items,
        commissionRate
      );
      subOrderIds.push(subOrder._id);
    }

    order.subOrders = subOrderIds as any;
    await order.save();

    await Promise.all(
      data.orderItems.map(async (item) => {
        await this.productRepository.updateById(item.product, {
          $inc: { stock: -item.quantity }
        } as any);
      })
    );

    return order;
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    const order = await this.orderRepository.findById(orderId, {
      populate: ['user', 'orderItems.product', 'orderItems.seller']
    });

    if (!order) {
      throw ErrorHelper.notFound('Order not found');
    }

    return order;
  }

  async getAllOrders(query: OrderQuery): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }> {
    const { user, seller, status, paymentStatus, page = 1, limit = 10 } = query;
    const filter: any = {};

    if (user) {
      filter.user = user;
    }

    if (seller) {
      filter['orderItems.seller'] = seller;
    }

    if (status) {
      filter.orderStatus = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    const total = await this.orderRepository.count(filter);
    const orders = await this.orderRepository.find(filter, {
      populate: ['user', 'orderItems.product', 'orderItems.seller'],
      limit,
      page,
      sort: { createdAt: -1 }
    });

    return {
      orders,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getUserOrders(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }> {
    return this.getAllOrders({ user: userId, page, limit });
  }

  async getSellerOrders(sellerId: string, page: number = 1, limit: number = 10): Promise<{ orders: IOrder[]; total: number; page: number; pages: number }> {
    return this.getAllOrders({ seller: sellerId, page, limit });
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<IOrder> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw ErrorHelper.notFound('Order not found');
    }

    order.orderStatus = status;

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
      
      // Auto-update payment status to 'paid' for COD orders when delivered
      if (order.paymentMethod === PaymentMethod.COD && order.paymentStatus !== PaymentStatus.PAID) {
        order.paymentStatus = PaymentStatus.PAID;
      }
    }

    await order.save();

    // If this is a master order, update all sub-orders with the same status
    if (order.isMasterOrder && order.subOrders && order.subOrders.length > 0) {
      const subOrders = await this.subOrderService.getSubOrdersByMasterOrder(orderId);
      await Promise.all(
        subOrders.map(async (subOrder) => {
          await this.subOrderService.updateSubOrderStatus(subOrder._id.toString(), status);
        })
      );
      
      // Also update payment status for all sub-orders if COD and delivered
      if (status === OrderStatus.DELIVERED && order.paymentMethod === PaymentMethod.COD) {
        await Promise.all(
          subOrders.map(async (subOrder) => {
            if (subOrder.paymentStatus !== PaymentStatus.PAID) {
              await this.subOrderService.updateSubOrderPaymentStatus(subOrder._id.toString(), PaymentStatus.PAID);
            }
          })
        );
      }
    }

    return order;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentResult?: any): Promise<IOrder> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw ErrorHelper.notFound('Order not found');
    }

    order.paymentStatus = paymentStatus;

    if (paymentResult) {
      order.paymentResult = paymentResult;
    }

    if (paymentStatus === PaymentStatus.PAID) {
      order.orderStatus = OrderStatus.PROCESSING;
    }

    await order.save();

    // If this is a master order, update all sub-orders with the same payment status
    if (order.isMasterOrder && order.subOrders && order.subOrders.length > 0) {
      const subOrders = await this.subOrderService.getSubOrdersByMasterOrder(orderId);
      await Promise.all(
        subOrders.map(async (subOrder) => {
          await this.subOrderService.updateSubOrderPaymentStatus(subOrder._id.toString(), paymentStatus);
        })
      );
    }

    return order;
  }

  async cancelOrder(orderId: string, userId: string): Promise<IOrder> {
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw ErrorHelper.notFound('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw ErrorHelper.forbidden('You can only cancel your own orders');
    }

    if (order.orderStatus === OrderStatus.SHIPPED || order.orderStatus === OrderStatus.DELIVERED) {
      throw ErrorHelper.badRequest('Cannot cancel order that has been shipped or delivered');
    }

    order.orderStatus = OrderStatus.CANCELLED;

    await Promise.all(
      order.orderItems.map(async (item) => {
        await this.productRepository.updateById(item.product.toString(), {
          $inc: { stock: item.quantity }
        } as any);
      })
    );

    await order.save();
    return order;
  }

  async getOrderStats(): Promise<any> {
    const totalOrders = await this.orderRepository.count({});
    const pendingOrders = await this.orderRepository.count({ orderStatus: OrderStatus.PENDING });
    const processingOrders = await this.orderRepository.count({ orderStatus: OrderStatus.PROCESSING });
    const shippedOrders = await this.orderRepository.count({ orderStatus: OrderStatus.SHIPPED });
    const deliveredOrders = await this.orderRepository.count({ orderStatus: OrderStatus.DELIVERED });
    const cancelledOrders = await this.orderRepository.count({ orderStatus: OrderStatus.CANCELLED });

    const revenueResult = await this.orderRepository.model.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue
    };
  }

  async getMonthlyRevenue(year?: number): Promise<any[]> {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(targetYear, 0, 1);
    const endDate = new Date(targetYear, 11, 31, 23, 59, 59);

    const monthlyData = await this.orderRepository.model.aggregate([
      {
        $match: {
          paymentStatus: PaymentStatus.PAID,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalPrice' },
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

  async getTopProducts(limit: number = 5): Promise<any[]> {
    const topProducts = await this.orderRepository.model.aggregate([
      { $match: { paymentStatus: PaymentStatus.PAID } },
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
}
