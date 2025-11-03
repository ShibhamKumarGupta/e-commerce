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
  sold?: number;  // Track total units sold
  
  // Discount Management
  discountPercentage?: number;  // 0-100 percentage
  discountedPrice?: number;     // calculated price after discount
  isOnSale?: boolean;           // flag to mark product on sale
  isFlashDeal?: boolean;        // flag to mark as flash deal
  saleStartDate?: Date;         // when discount starts
  saleEndDate?: Date;           // when discount ends
}
