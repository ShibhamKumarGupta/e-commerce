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
    }

    await order.save();
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
}
