export enum UserRole {
  ADMIN = 'admin',
  BUYER = 'buyer',
  SELLER = 'seller',
  ORDER_MANAGER = 'order-manager'
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  avatar?: string;
  isActive: boolean;
  commissionRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}
