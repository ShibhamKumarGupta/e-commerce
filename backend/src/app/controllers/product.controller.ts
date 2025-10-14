import { Response } from 'express';
import { ProductService } from '../services/product.service';
import { ApiResponse } from '../utils/ApiResponse.util';
import { asyncHandler } from '../utils/asyncHandler.util';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  createProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const productData = {
      ...req.body,
      seller: req.user._id
    };
    const product = await this.productService.createProduct(productData);
    ApiResponse.created(res, { product }, 'Product created successfully');
  });

  getAllProducts = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.productService.getAllProducts(req.query);
    ApiResponse.success(res, result, 'Products retrieved successfully');
  });

  getProductById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await this.productService.getProductById(req.params.id);
    ApiResponse.success(res, { product }, 'Product retrieved successfully');
  });

  updateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await this.productService.updateProduct(
      req.params.id,
      req.user._id,
      req.body
    );
    ApiResponse.success(res, { product }, 'Product updated successfully');
  });

  deleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.productService.deleteProduct(req.params.id, req.user._id);
    ApiResponse.success(res, null, 'Product deleted successfully');
  });

  addReview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { rating, comment } = req.body;
    const product = await this.productService.addReview(
      req.params.id,
      req.user._id,
      req.user.name,
      rating,
      comment
    );
    ApiResponse.success(res, { product }, 'Review added successfully');
  });

  getCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await this.productService.getCategories();
    ApiResponse.success(res, { categories }, 'Categories retrieved successfully');
  });

  getProductStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await this.productService.getProductStats();
    ApiResponse.success(res, stats, 'Product statistics retrieved successfully');
  });

  // Admin methods
  adminUpdateProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    const product = await this.productService.adminUpdateProduct(req.params.id, req.body);
    ApiResponse.success(res, { product }, 'Product updated successfully');
  });

  adminDeleteProduct = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.productService.adminDeleteProduct(req.params.id);
    ApiResponse.success(res, null, 'Product deleted successfully');
  });
}
