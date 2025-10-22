import mongoose, { Schema } from 'mongoose';
import { AbstractRepository } from './abstracts/repository.abstract';
import { IProduct, IReview } from '../interfaces/product.interface';

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const productSchema = new Schema<IProduct>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true
    },
    brand: {
      type: String,
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    },
    reviews: [reviewSchema],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index for search and filtering
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });

const ProductModel = mongoose.model<IProduct>('Product', productSchema);

export class ProductRepository extends AbstractRepository<IProduct> {
  constructor() {
    super(ProductModel);
  }

  async findBySeller(sellerId: string): Promise<IProduct[]> {
    return this.model.find({ seller: sellerId }).exec();
  }

  async findByCategory(category: string): Promise<IProduct[]> {
    return this.model.find({ category, isActive: true }).exec();
  }

  async searchProducts(searchTerm: string): Promise<IProduct[]> {
    return this.model.find({
      $text: { $search: searchTerm },
      isActive: true
    }).exec();
  }

  async findActiveProducts(): Promise<IProduct[]> {
    return this.model.find({ isActive: true }).exec();
  }
}
