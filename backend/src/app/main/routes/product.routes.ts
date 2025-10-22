import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { UserRole } from '../../domain/interfaces/user.interface';

export class ProductRoutes {
  public router: Router;
  private productController: ProductController;

  constructor() {
    this.router = Router();
    this.productController = new ProductController();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get('/', this.productController.getAllProducts);
    this.router.get('/categories', this.productController.getCategories);
    this.router.get('/:id', this.productController.getProductById);

    this.router.post(
      '/',
      AuthMiddleware.authenticate,
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.productController.createProduct
    );

    this.router.put(
      '/:id',
      AuthMiddleware.authenticate,
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.productController.updateProduct
    );

    this.router.delete(
      '/:id',
      AuthMiddleware.authenticate,
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.productController.deleteProduct
    );

    this.router.post(
      '/:id/reviews',
      AuthMiddleware.authenticate,
      this.productController.addReview
    );

    this.router.get(
      '/seller/my-products',
      AuthMiddleware.authenticate,
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.productController.getSellerProducts
    );

    this.router.get(
      '/seller/stats',
      AuthMiddleware.authenticate,
      AuthMiddleware.authorize(UserRole.SELLER, UserRole.ADMIN),
      this.productController.getSellerProductStats
    );

    this.router.get(
      '/admin/stats',
      AuthMiddleware.authenticate,
      AuthMiddleware.isAdmin,
      this.productController.getProductStats
    );

    this.router.put(
      '/admin/:id',
      AuthMiddleware.authenticate,
      AuthMiddleware.isAdmin,
      this.productController.adminUpdateProduct
    );

    this.router.delete(
      '/admin/:id',
      AuthMiddleware.authenticate,
      AuthMiddleware.isAdmin,
      this.productController.adminDeleteProduct
    );
  }
}
