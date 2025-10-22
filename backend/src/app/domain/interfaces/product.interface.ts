import { ObjectId, MongoDocument } from '../../types/mongo.type';

export interface IReview {
  user: ObjectId;
  name: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface IProduct extends MongoDocument {
  seller: ObjectId;
  name: string;
  description: string;
  price: number;
  category: string;
  brand?: string;
  images: string[];
  stock: number;
  rating: number;
  numReviews: number;
  reviews: IReview[];
  isActive: boolean;
}
