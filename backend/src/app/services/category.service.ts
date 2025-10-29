import { AbstractService } from './abstracts/service.abstract';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { ICategory } from '../domain/interfaces/category.interface';
import { ErrorHelper } from '../helpers/error.helper';

export class CategoryService extends AbstractService<ICategory> {
  private categoryRepository: CategoryRepository;

  constructor() {
    const repository = new CategoryRepository();
    super(repository);
    this.categoryRepository = repository;
  }

  async createCategory(data: { name: string; description?: string; iconSvg?: string; isActive?: boolean }): Promise<ICategory> {
    // Check if category already exists
    const existingCategory = await this.categoryRepository.findByName(data.name);
    if (existingCategory) {
      throw ErrorHelper.badRequest('Category with this name already exists');
    }

    // Generate slug from name
    const slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

    const category = await this.categoryRepository.create({
      name: data.name.trim(),
      slug,
      description: data.description,
      iconSvg: data.iconSvg ? data.iconSvg.trim() : '',
      isActive: data.isActive ?? true
    } as any);

    return category;
  }

  async updateCategory(id: string, data: { name?: string; description?: string; iconSvg?: string | null; isActive?: boolean }): Promise<ICategory> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw ErrorHelper.notFound('Category not found');
    }

    // If name is being updated, check for duplicates and update slug
    if (data.name && data.name !== category.name) {
      const existingCategory = await this.categoryRepository.findByName(data.name);
      if (existingCategory && existingCategory._id.toString() !== id) {
        throw ErrorHelper.badRequest('Category with this name already exists');
      }
      category.name = data.name.trim();
      category.slug = data.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    }

    if (data.description !== undefined) {
      category.description = data.description;
    }

    if (data.iconSvg !== undefined) {
      category.iconSvg = data.iconSvg ? data.iconSvg.trim() : '';
    }

    if (data.isActive !== undefined) {
      category.isActive = data.isActive;
    }

    await category.save();
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);

    if (!category) {
      throw ErrorHelper.notFound('Category not found');
    }

    // Check if category is being used by any products
    // For now, we'll just delete. You can add check for products later if needed

    await this.categoryRepository.deleteById(id);
  }

  async getActiveCategories(): Promise<ICategory[]> {
    return this.categoryRepository.findActive();
  }

  async getAllCategories(filters?: any): Promise<{ categories: ICategory[]; total: number }> {
    const page = parseInt(filters?.page) || 1;
    const limit = parseInt(filters?.limit) || 50;

    const query: any = {};

    if (filters?.isActive !== undefined) {
      query.isActive = filters.isActive === 'true';
    }

    if (filters?.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const categories = await this.categoryRepository.find(query, {
      limit,
      page,
      sort: { name: 1 }
    });

    const total = await this.categoryRepository.count(query);

    return { categories, total };
  }
}
