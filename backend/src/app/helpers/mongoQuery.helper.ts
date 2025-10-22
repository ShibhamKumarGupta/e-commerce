import { FilterQuery } from 'mongoose';
import { QueryOptions } from '../types/mongo.type';

export class MongoQueryHelper {
  static buildPaginationOptions(page?: number, limit?: number): QueryOptions {
    const options: QueryOptions = {};
    
    if (page && limit) {
      options.page = page;
      options.limit = limit;
    }
    
    return options;
  }

  static buildSortOptions(sortField?: string, order?: 'asc' | 'desc'): Record<string, 1 | -1> {
    if (!sortField) {
      return { createdAt: -1 };
    }
    
    return { [sortField]: order === 'asc' ? 1 : -1 };
  }

  static buildSearchFilter(searchTerm?: string, fields: string[] = []): FilterQuery<any> {
    if (!searchTerm || fields.length === 0) {
      return {};
    }

    const searchRegex = new RegExp(searchTerm, 'i');
    return {
      $or: fields.map(field => ({ [field]: searchRegex }))
    };
  }

  static buildRangeFilter(field: string, min?: number, max?: number): FilterQuery<any> {
    const filter: any = {};
    
    if (min !== undefined || max !== undefined) {
      filter[field] = {};
      if (min !== undefined) filter[field].$gte = min;
      if (max !== undefined) filter[field].$lte = max;
    }
    
    return filter;
  }

  static combineFilters(...filters: FilterQuery<any>[]): FilterQuery<any> {
    return Object.assign({}, ...filters);
  }

  static buildTextSearchFilter(searchTerm: string): FilterQuery<any> {
    return { $text: { $search: searchTerm } };
  }
}
