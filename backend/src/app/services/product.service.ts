import { Product, IProduct } from '../models/Product.model';
import { ApiError } from '../utils/ApiError.util';
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

export class ProductService {
  async createProduct(data: CreateProductDTO): Promise<IProduct> {
    const product = await Product.create(data);
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

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .limit(limit)
      .skip(skip)
      .sort(sortOptions);

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  async getProductById(productId: string): Promise<IProduct> {
    const product = await Product.findById(productId)
      .populate('seller', 'name email')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  async updateProduct(productId: string, sellerId: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check if the seller owns this product
    if (product.seller.toString() !== sellerId) {
      throw ApiError.forbidden('You can only update your own products');
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    return updatedProduct!;
  }

  async deleteProduct(productId: string, sellerId: string): Promise<void> {
    const product = await Product.findById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check if the seller owns this product
    if (product.seller.toString() !== sellerId) {
      throw ApiError.forbidden('You can only delete your own products');
    }

    await Product.findByIdAndDelete(productId);
  }

  async addReview(productId: string, userId: string, userName: string, rating: number, comment: string): Promise<IProduct> {
    const product = await Product.findById(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === userId
    );

    if (alreadyReviewed) {
      throw ApiError.badRequest('You have already reviewed this product');
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

  async getCategories(): Promise<string[]> {
    const categories = await Product.distinct('category');
    return categories;
  }

  async getProductStats(): Promise<any> {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const outOfStock = await Product.countDocuments({ stock: 0 });
    const lowStock = await Product.countDocuments({ stock: { $gt: 0, $lte: 10 } });

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      outOfStock,
      lowStock
    };
  }

  // Get seller-specific products
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

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    
    const sortOptions: any = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .limit(limit)
      .skip(skip)
      .sort(sortOptions);

    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }

  // Get seller-specific stats
  async getSellerProductStats(sellerId: string): Promise<any> {
    const totalProducts = await Product.countDocuments({ seller: sellerId });
    const activeProducts = await Product.countDocuments({ seller: sellerId, isActive: true });
    const outOfStock = await Product.countDocuments({ seller: sellerId, stock: 0 });
    const lowStock = await Product.countDocuments({ seller: sellerId, stock: { $gt: 0, $lte: 10 } });

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      outOfStock,
      lowStock
    };
  }

  // Admin method to update any product
  async adminUpdateProduct(productId: string, data: Partial<IProduct>): Promise<IProduct> {
    const product = await Product.findByIdAndUpdate(
      productId,
      { $set: data },
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    if (!product) {
      throw ApiError.notFound('Product not found');
    }

    return product;
  }

  // Admin method to delete any product
  async adminDeleteProduct(productId: string): Promise<void> {
    const product = await Product.findByIdAndDelete(productId);

    if (!product) {
      throw ApiError.notFound('Product not found');
    }
  }
}
