import { body, ValidationChain } from 'express-validator';

export class UserValidator {
  static register(): ValidationChain[] {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
      body('role')
        .optional()
        .isIn(['buyer', 'seller', 'admin'])
        .withMessage('Invalid role'),
      body('phone')
        .optional()
        .trim()
    ];
  }

  static login(): ValidationChain[] {
    return [
      body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),
      body('password')
        .notEmpty()
        .withMessage('Password is required')
    ];
  }

  static updateProfile(): ValidationChain[] {
    return [
      body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
      body('phone')
        .optional()
        .trim(),
      body('address')
        .optional()
        .isObject()
        .withMessage('Address must be an object')
    ];
  }

  static changePassword(): ValidationChain[] {
    return [
      body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
      body('newPassword')
        .notEmpty()
        .withMessage('New password is required')
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
    ];
  }
}
