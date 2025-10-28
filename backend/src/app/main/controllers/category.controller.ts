import { Response } from 'express';
import { CategoryService } from '../../services/category.service';
import { ResponseUtils } from '../../utils/response.utils';
import { asyncHandler } from '../../utils/async.utils';
import { AuthRequest } from '../../types/core.types';

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  createCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await this.categoryService.createCategory(req.body);
    ResponseUtils.created(res, { category }, 'Category created successfully');
  });

  getAllCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.categoryService.getAllCategories(req.query);
    ResponseUtils.success(res, result, 'Categories retrieved successfully');
  });

  getActiveCategories = asyncHandler(async (req: AuthRequest, res: Response) => {
    const categories = await this.categoryService.getActiveCategories();
    ResponseUtils.success(res, { categories }, 'Active categories retrieved successfully');
  });

  getCategoryById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await this.categoryService.findById(req.params.id);
    ResponseUtils.success(res, { category }, 'Category retrieved successfully');
  });

  updateCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const category = await this.categoryService.updateCategory(req.params.id, req.body);
    ResponseUtils.success(res, { category }, 'Category updated successfully');
  });

  deleteCategory = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.categoryService.deleteCategory(req.params.id);
    ResponseUtils.success(res, {}, 'Category deleted successfully');
  });
}
