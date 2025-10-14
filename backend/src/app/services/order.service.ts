import { Order, IOrder, OrderStatus, PaymentStatus, PaymentMethod } from '../models/Order.model';
import { Product } from '../models/Product.model';
import { ApiError } from '../utils/ApiError.util';

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

export class OrderService {
  async createOrder(data: CreateOrderDTO): Promise<IOrder> {
    // Fetch product details and validate
    const orderItems = await Promise.all(
      data.orderItems.map(async (item) => {
        const product = await Product.findById(item.product);

        if (!product) {
          throw ApiError.notFound(`Product ${item.product} not found`);
        }

        if (product.stock < item.quantity) {
          throw ApiError.badRequest(`Insufficient stock for ${product.name}`);
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

    // Calculate prices
    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxPrice = itemsPrice * 0.1; // 10% tax
    const shippingPrice = itemsPrice > 100 ? 0 : 10; // Free shipping over $100
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // Create order
    const order = await Order.create({
      user: data.user,
      orderItems,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice
    });

    // Update product stock
    await Promise.all(
      data.orderItems.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity }
        });
      })
    );

    return order;
  }

  async getOrderById(orderId: string): Promise<IOrder> {
    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .populate('orderItems.seller', 'name email');

    if (!order) {
      throw ApiError.notFound('Order not found');
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

    const skip = (page - 1) * limit;
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name')
      .populate('orderItems.seller', 'name email')
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

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
    const order = await Order.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    order.orderStatus = status;

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
    }

    await order.save();
    return order;
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus, paymentResult?: any): Promise<IOrder> {
    const order = await Order.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
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
    const order = await Order.findById(orderId);

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    if (order.user.toString() !== userId) {
      throw ApiError.forbidden('You can only cancel your own orders');
    }

    if (order.orderStatus === OrderStatus.SHIPPED || order.orderStatus === OrderStatus.DELIVERED) {
      throw ApiError.badRequest('Cannot cancel order that has been shipped or delivered');
    }

    order.orderStatus = OrderStatus.CANCELLED;

    // Restore product stock
    await Promise.all(
      order.orderItems.map(async (item) => {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      })
    );

    await order.save();
    return order;
  }

  async getOrderStats(): Promise<any> {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: OrderStatus.PENDING });
    const processingOrders = await Order.countDocuments({ orderStatus: OrderStatus.PROCESSING });
    const shippedOrders = await Order.countDocuments({ orderStatus: OrderStatus.SHIPPED });
    const deliveredOrders = await Order.countDocuments({ orderStatus: OrderStatus.DELIVERED });
    const cancelledOrders = await Order.countDocuments({ orderStatus: OrderStatus.CANCELLED });

    const revenueResult = await Order.aggregate([
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
