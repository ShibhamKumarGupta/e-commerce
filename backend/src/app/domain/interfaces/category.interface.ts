import { Document } from 'mongoose';

export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  iconSvg?: string;
  createdAt: Date;
  updatedAt: Date;
}
