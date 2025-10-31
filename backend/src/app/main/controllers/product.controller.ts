import { Response } from 'express';
import { ProductService } from '../../services/product.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productData = {
      ...req.body,
      seller: req.user!._id.toString()
    };
    const product = await this.productService.createProduct(productData);
    ResponseUtils.created(res, { product }, 'Product created successfully');
  });

  getAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.productService.getAllProducts(req.query);
    ResponseUtils.success(res, result, 'Products retrieved successfully');
  });

  getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await this.productService.getProductById(req.params.id);
    ResponseUtils.success(res, { product }, 'Product retrieved successfully');
  });

  updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await this.productService.updateProduct(
      req.params.id,
      req.user!._id.toString(),
      req.body
    );
    ResponseUtils.success(res, { product }, 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.productService.deleteProduct(req.params.id, req.user!._id.toString());
    ResponseUtils.success(res, null, 'Product deleted successfully');
  });

  addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { rating, comment } = req.body;
    const product = await this.productService.addReview(
      req.params.id,
      req.user!._id.toString(),
      req.user!.name,
      rating,
      comment
    );
    ResponseUtils.success(res, { product }, 'Review added successfully');
  });

  getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await this.productService.getCategories();
    ResponseUtils.success(res, { categories }, 'Categories retrieved successfully');
  });

  getProductStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.productService.getProductStats();
    ResponseUtils.success(res, stats, 'Product statistics retrieved successfully');
  });

  getSellerProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.productService.getSellerProducts(req.user!._id.toString(), req.query);
    ResponseUtils.success(res, result, 'Seller products retrieved successfully');
  });

  getSellerProductStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.productService.getSellerProductStats(req.user!._id.toString());
    ResponseUtils.success(res, stats, 'Seller product statistics retrieved successfully');
  });

  adminUpdateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await this.productService.adminUpdateProduct(req.params.id, req.body);
    ResponseUtils.success(res, { product }, 'Product updated successfully');
  });

  adminDeleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.productService.adminDeleteProduct(req.params.id);
    ResponseUtils.success(res, null, 'Product deleted successfully');
  });

  adminGetAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.productService.adminGetAllProducts(req.query);
    ResponseUtils.success(res, result, 'Products retrieved successfully');
  });

  adminDeleteReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reviewIndex = parseInt(req.query.reviewIndex as string);
    const product = await this.productService.adminDeleteReview(req.params.id, reviewIndex);
    ResponseUtils.success(res, { product }, 'Review deleted successfully');
  });
}
