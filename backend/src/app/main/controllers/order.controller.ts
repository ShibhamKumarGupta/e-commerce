import { Response } from 'express';
import { OrderService } from '../../services/order.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class OrderController {
  private orderService: OrderService;

  constructor() {
    this.orderService = new OrderService();
  }

  createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const orderData = {
      ...req.body,
      user: req.user!._id.toString()
    };
    const order = await this.orderService.createOrder(orderData);
    ResponseUtils.created(res, { order }, 'Order created successfully');
  });

  getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await this.orderService.getOrderById(req.params.id);
    ResponseUtils.success(res, { order }, 'Order retrieved successfully');
  });

  getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.orderService.getAllOrders(req.query);
    ResponseUtils.success(res, result, 'Orders retrieved successfully');
  });

  getUserOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;
    const result = await this.orderService.getUserOrders(
      req.user!._id.toString(),
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
    ResponseUtils.success(res, result, 'Orders retrieved successfully');
  });

  getSellerOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit } = req.query;
    const result = await this.orderService.getSellerOrders(
      req.user!._id.toString(),
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );
    ResponseUtils.success(res, result, 'Orders retrieved successfully');
  });

  updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const order = await this.orderService.updateOrderStatus(req.params.id, status);
    ResponseUtils.success(res, { order }, 'Order status updated successfully');
  });

  updatePaymentStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentStatus, paymentResult } = req.body;
    const order = await this.orderService.updatePaymentStatus(
      req.params.id,
      paymentStatus,
      paymentResult
    );
    ResponseUtils.success(res, { order }, 'Payment status updated successfully');
  });

  cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const order = await this.orderService.cancelOrder(req.params.id, req.user!._id.toString());
    ResponseUtils.success(res, { order }, 'Order cancelled successfully');
  });

  getOrderStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.orderService.getOrderStats();
    ResponseUtils.success(res, stats, 'Order statistics retrieved successfully');
  });
}
