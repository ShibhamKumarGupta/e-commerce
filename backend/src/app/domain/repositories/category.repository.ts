import { Model, Schema, model } from 'mongoose';
import { ICategory } from '../interfaces/category.interface';
import { AbstractRepository } from './abstracts/repository.abstract';

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true
    },
    iconSvg: {
      type: String,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'categories'
  }
);

// Create indexes
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ isActive: 1 });

const CategoryModel: Model<ICategory> = model<ICategory>('Category', CategorySchema);

export class CategoryRepository extends AbstractRepository<ICategory> {
  constructor() {
    super(CategoryModel);
  }

  async findBySlug(slug: string): Promise<ICategory | null> {
    return this.model.findOne({ slug }).exec();
  }

  async findByName(name: string): Promise<ICategory | null> {
    return this.model.findOne({ name }).exec();
  }

  async findActive(): Promise<ICategory[]> {
    return this.model.find({ isActive: true }).sort({ name: 1 }).exec();
  }
}
