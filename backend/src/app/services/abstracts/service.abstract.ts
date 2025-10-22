import { AbstractRepository } from '../../domain/repositories/abstracts/repository.abstract';
import { Document, FilterQuery } from 'mongoose';
import { QueryOptions } from '../../types/mongo.type';

export abstract class AbstractService<T extends Document> {
  protected repository: AbstractRepository<T>;

  constructor(repository: AbstractRepository<T>) {
    this.repository = repository;
  }

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    return this.repository.findById(id, options);
  }

  async findOne(filter: FilterQuery<T>, options?: QueryOptions): Promise<T | null> {
    return this.repository.findOne(filter, options);
  }

  async find(filter: FilterQuery<T>, options?: QueryOptions): Promise<T[]> {
    return this.repository.find(filter, options);
  }

  async create(data: Partial<T>): Promise<T> {
    return this.repository.create(data);
  }

  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return this.repository.updateById(id, data as any);
  }

  async deleteById(id: string): Promise<T | null> {
    return this.repository.deleteById(id);
  }

  async count(filter: FilterQuery<T>): Promise<number> {
    return this.repository.count(filter);
  }
}
