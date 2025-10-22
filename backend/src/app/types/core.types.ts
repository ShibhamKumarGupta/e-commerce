import { Request } from 'express';
import { IUser } from '../domain/interfaces/user.interface';

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  rating?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
}
