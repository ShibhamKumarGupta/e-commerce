import { Response } from 'express';
import { SubOrderService } from '../../services/subOrder.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class SubOrderController {
  private subOrderService: SubOrderService;

  constructor() {
    this.subOrderService = new SubOrderService();
  }

  getSubOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const subOrder = await this.subOrderService.getSubOrderById(req.params.id);
    ResponseUtils.success(res, { subOrder }, 'Sub-order retrieved successfully');
  });

  getSellerSubOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { page, limit, status, paymentStatus } = req.query;
    const result = await this.subOrderService.getSellerSubOrders(
      req.user!._id.toString(),
      {
        status: status as any,
        paymentStatus: paymentStatus as any,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      }
    );
    ResponseUtils.success(res, result, 'Seller sub-orders retrieved successfully');
  });

  updateSubOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;
    const subOrder = await this.subOrderService.updateSubOrderStatus(
      req.params.id,
      status,
      req.user!._id.toString()
    );
    ResponseUtils.success(res, { subOrder }, 'Sub-order status updated successfully');
  });

  updateSellerApproval = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { approvalStatus } = req.body;
    const subOrder = await this.subOrderService.updateSellerApproval(
      req.params.id,
      approvalStatus,
      req.user!._id.toString()
    );
    ResponseUtils.success(res, { subOrder }, 'Seller approval status updated successfully');
  });

  getSellerEarnings = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;
    const earnings = await this.subOrderService.getSellerEarnings(
      req.user!._id.toString(),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    ResponseUtils.success(res, earnings, 'Seller earnings retrieved successfully');
  });

  getSellerStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.subOrderService.getSellerStats(req.user!._id.toString());
    ResponseUtils.success(res, stats, 'Seller statistics retrieved successfully');
  });

  getAllSubOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { seller, buyer, masterOrder, status, paymentStatus, page, limit } = req.query;
    const result = await this.subOrderService.getAllSubOrders({
      seller: seller as string,
      buyer: buyer as string,
      masterOrder: masterOrder as string,
      status: status as any,
      paymentStatus: paymentStatus as any,
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });
    ResponseUtils.success(res, result, 'All sub-orders retrieved successfully');
  });

  getCommissionBreakdown = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;
    const breakdown = await this.subOrderService.getCommissionBreakdown(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined
    );
    ResponseUtils.success(res, breakdown, 'Commission breakdown retrieved successfully');
  });

  getSellerMonthlyRevenue = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { year } = req.query;
    const data = await this.subOrderService.getSellerMonthlyRevenue(
      req.user!._id.toString(),
      year ? parseInt(year as string) : undefined
    );
    ResponseUtils.success(res, { monthlyRevenue: data }, 'Seller monthly revenue retrieved successfully');
  });

  getSellerTopProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { limit } = req.query;
    const data = await this.subOrderService.getSellerTopProducts(
      req.user!._id.toString(),
      limit ? parseInt(limit as string) : 5
    );
    ResponseUtils.success(res, { topProducts: data }, 'Seller top products retrieved successfully');
  });

  getSellerOrdersByStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = await this.subOrderService.getSellerOrdersByStatus(req.user!._id.toString());
    ResponseUtils.success(res, { ordersByStatus: data }, 'Seller orders by status retrieved successfully');
  });
}
