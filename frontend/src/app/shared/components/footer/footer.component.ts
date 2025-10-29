import { Component, OnInit } from '@angular/core';
import { ProductService, ProductCategory } from '../../../core/services/product.service';
import { Product, ProductResponse } from '../../../core/models/product.model';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  currentYear = new Date().getFullYear();
  topCategories: ProductCategory[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getAllProducts({ limit: 1000 }).subscribe((response: ProductResponse) => {
      const products = response.products;
      const categoryRatings: { [key: string]: { total: number, count: number } } = {};

      products.forEach((product: Product) => {
        if (!categoryRatings[product.category]) {
          categoryRatings[product.category] = { total: 0, count: 0 };
        }
        categoryRatings[product.category].total += product.rating;
        categoryRatings[product.category].count += 1;
      });

      const avgRatings = Object.keys(categoryRatings).map(cat => ({
        category: cat,
        avgRating: categoryRatings[cat].total / categoryRatings[cat].count
      }));

      avgRatings.sort((a, b) => b.avgRating - a.avgRating);

      const topCats = avgRatings.slice(0, 4).map(item => item.category);

      this.productService.getCategories().subscribe((categories: ProductCategory[]) => {
        this.topCategories = categories.filter((cat: ProductCategory) => topCats.includes(cat.slug));
      });
    });
  }
}
