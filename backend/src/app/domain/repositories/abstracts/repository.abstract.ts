import { Model, Document, FilterQuery, UpdateQuery } from 'mongoose';
import { QueryOptions } from '../../../types/mongo.type';

export abstract class AbstractRepository<T extends Document> {
  public model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    let query = this.model.findById(id);
    
    if (options?.populate) {
      query = query.populate(options.populate);
    }
    
    if (options?.select) {
      query = query.select(options.select);
    }
    
    return query.exec();
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    let query = this.model.findOne(filter);
    
    if (options?.populate) {
      query = query.populate(options.populate);
    }
    
    if (options?.select) {
      query = query.select(options.select);
    }
    
    return query.exec();
  }

  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    let query = this.model.find(filter);
    
    if (options?.populate) {
      query = query.populate(options.populate);
    }
    
    if (options?.select) {
      query = query.select(options.select);
    }
    
    if (options?.sort) {
      query = query.sort(options.sort);
    }
    
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    
    if (options?.page && options?.limit) {
      const skip = (options.page - 1) * options.limit;
      query = query.skip(skip);
    }
    
    return query.exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async updateById(id: string, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
  }

  async updateOne(filter: FilterQuery<T>, data: UpdateQuery<T>): Promise<T | null> {
    return this.model.findOneAndUpdate(filter, data, { new: true, runValidators: true }).exec();
  }

  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  async deleteOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOneAndDelete(filter).exec();
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  async exists(filter: FilterQuery<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1).exec();
    return count > 0;
  }
}
