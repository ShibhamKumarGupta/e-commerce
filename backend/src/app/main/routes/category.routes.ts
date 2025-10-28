import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

const router = Router();
const categoryController = new CategoryController();

// Public routes
router.get('/active', categoryController.getActiveCategories);

// Protected routes (Admin only)
router.post('/', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, categoryController.createCategory);
router.get('/', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, categoryController.getAllCategories);
router.get('/:id', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, categoryController.getCategoryById);
router.put('/:id', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, categoryController.updateCategory);
router.delete('/:id', AuthMiddleware.authenticate, AuthMiddleware.isAdmin, categoryController.deleteCategory);

export default router;
