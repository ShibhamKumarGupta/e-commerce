import mongoose from 'mongoose';
import { ErrorHelper } from '../helpers/error.helper';

export class ObjectIdValidator {
  static isValid(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  static validate(id: string, fieldName: string = 'ID'): void {
    if (!this.isValid(id)) {
      throw ErrorHelper.badRequest(`Invalid ${fieldName}`);
    }
  }

  static validateMultiple(ids: string[], fieldName: string = 'IDs'): void {
    const invalidIds = ids.filter(id => !this.isValid(id));
    if (invalidIds.length > 0) {
      throw ErrorHelper.badRequest(`Invalid ${fieldName}: ${invalidIds.join(', ')}`);
    }
  }

  static toObjectId(id: string): mongoose.Types.ObjectId {
    this.validate(id);
    return new mongoose.Types.ObjectId(id);
  }
}
