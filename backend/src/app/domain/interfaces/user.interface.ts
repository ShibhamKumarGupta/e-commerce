import { MongoDocument } from '../../types/mongo.type';

export enum UserRole {
  ADMIN = 'admin',
  BUYER = 'buyer',
  SELLER = 'seller'
}

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export interface IUser extends MongoDocument {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: IAddress;
  avatar?: string;
  isActive: boolean;
  commissionRate?: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}
