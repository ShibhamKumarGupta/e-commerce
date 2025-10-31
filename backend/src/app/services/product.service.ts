import { AbstractService } from './abstracts/service.abstract';
import { ProductRepository } from '../domain/repositories/product.repository';
import { CategoryRepository } from '../domain/repositories/category.repository';
import { IProduct } from '../domain/interfaces/product.interface';
import { ErrorHelper } from '../helpers/error.helper';
import mongoose from 'mongoose';

export interface ProductQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  search?: string;
  seller?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductDTO {
  seller: string;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  stock: number;
}

export class ProductService extends AbstractService<IProduct> {
  private productRepository: ProductRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    const repository = new ProductRepository();
    super(repository);
    this.productRepository = repository;
    this.categoryRepository = new CategoryRepository();
  }

  async createProduct(data: CreateProductDTO): Promise<IProduct> {
    const product = await this.productRepository.create(data as any);
    return product;
  }

  async getAllProducts(query: ProductQuery): Promise<{ products: IProduct[]; total: number; page: number; pages: number }> {
    const {
      category,
      minPrice,
      maxPrice,
      minRating,
      search,
      seller,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const filter: any = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (minRating !== undefined) {
      filter.rating = { $gte: minRating };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    if (seller) {
      filter.seller = seller;
    }

    const total = await this.productRepository.count(filter);
    
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await this.productRepository.find(filter, {
      populate: 'seller',
      limit,
      page,
      sort: sortOptions
    });

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getProductById(productId: string): Promise<IProduct> {
    const product = await this.productRepository.findById(productId, {
      populate: ['seller', 'reviews.user']
    });

    if (!product) {
      throw ErrorHelper.notFound('Product not found');
    }

    return product;
  }

  async updateProduct(productId: string, sellerId: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw ErrorHelper.notFound('Product not found');
    }

    if (product.seller.toString() !== sellerId) {
      throw ErrorHelper.forbidden('You can only update your own products');
    }

    const updatedProduct = await this.productRepository.updateById(productId, { $set: data } as any);
    return updatedProduct!;
  }

  async deleteProduct(productId: string, sellerId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw ErrorHelper.notFound('Product not found');
    }

    if (product.seller.toString() !== sellerId) {
      throw ErrorHelper.forbidden('You can only delete your own products');
    }

    await this.productRepository.deleteById(productId);
  }

  async addReview(productId: string, userId: string, userName: string, rating: number, comment: string): Promise<IProduct> {
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw ErrorHelper.notFound('Product not found');
    }

    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === userId
    );

    if (alreadyReviewed) {
      throw ErrorHelper.badRequest('You have already reviewed this product');
    }

    const review = {
      user: new mongoose.Types.ObjectId(userId),
      name: userName,
      rating,
      comment,
      createdAt: new Date()
    };

    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

    await product.save();
    return product;
  }

  async getCategories(): Promise<Array<{ name: string; slug: string; iconSvg: string }>> {
    const categories = await this.categoryRepository.findActive();
    return categories.map(category => ({
      name: category.name,
      slug: category.slug,
      iconSvg: category.iconSvg || ''
    }));
  }

  async getProductStats(): Promise<any> {
    const totalProducts = await this.productRepository.count({});
    const activeProducts = await this.productRepository.count({ isActive: true });
    const outOfStock = await this.productRepository.count({ stock: 0 });
    const lowStock = await this.productRepository.count({ stock: { $gt: 0, $lte: 10 } });

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      outOfStock,
      lowStock
    };
  }

  async getSellerProducts(sellerId: string, query: ProductQuery): Promise<{ products: IProduct[]; total: number; page: number; pages: number }> {
    const {
      category,
      minPrice,
      maxPrice,
      minRating,
      search,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    const filter: any = { seller: sellerId };

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (minRating !== undefined) {
      filter.rating = { $gte: minRating };
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await this.productRepository.count(filter);
    
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await this.productRepository.find(filter, {
      populate: 'seller',
      limit,
      page,
      sort: sortOptions
    });

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getSellerProductStats(sellerId: string): Promise<any> {
    const totalProducts = await this.productRepository.count({ seller: sellerId });
    const activeProducts = await this.productRepository.count({ seller: sellerId, isActive: true });
    const outOfStock = await this.productRepository.count({ seller: sellerId, stock: 0 });
    const lowStock = await this.productRepository.count({ seller: sellerId, stock: { $gt: 0, $lte: 10 } });

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      outOfStock,
      lowStock
    };
  }

  async adminUpdateProduct(productId: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await this.productRepository.updateById(productId, { $set: data } as any);

    if (!product) {
      throw ErrorHelper.notFound('Product not found');
    }

    return product;
  }

  async adminDeleteProduct(productId: string): Promise<void> {
    const product = await this.productRepository.deleteById(productId);

    if (!product) {
      throw ErrorHelper.notFound('Product not found');
    }
  }
}
