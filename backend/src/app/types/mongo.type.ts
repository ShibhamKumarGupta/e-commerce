import mongoose from 'mongoose';

export type ObjectId = mongoose.Types.ObjectId;

export interface MongoDocument extends mongoose.Document {
  _id: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
  populate?: string | string[];
  select?: string;
}

export interface AggregationPipeline {
  $match?: any;
  $group?: any;
  $sort?: any;
  $limit?: number;
  $skip?: number;
  $lookup?: any;
  $project?: any;
}
