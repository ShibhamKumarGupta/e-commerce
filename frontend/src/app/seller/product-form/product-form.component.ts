import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent implements OnInit {
  productForm: FormGroup;
  loading = false;
  isEditMode = false;
  productId: string | null = null;
  categories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    public router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(2000)]],
      price: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      brand: [''],
      images: [''],
      stock: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.productId = params['id'];
        if (this.productId) {
          this.loadProduct(this.productId);
        }
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  onCategoryChange(): void {
    const categoryControl = this.productForm.get('category');
    if (categoryControl && categoryControl.value === 'new') {
      const newCategory = prompt('Enter new category name:');
      if (newCategory) {
        // Convert to proper format (lowercase, no spaces)
        const formattedCategory = newCategory.trim().toLowerCase().replace(/\s+/g, '-');
        if (!this.categories.includes(formattedCategory)) {
          this.categories.push(formattedCategory);
        }
        categoryControl.setValue(formattedCategory);
      } else {
        categoryControl.setValue('');
      }
    }
  }

  loadProduct(id: string): void {
    this.loading = true;
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          category: product.category,
          brand: product.brand,
          images: product.images.join(', '),
          stock: product.stock,
          isActive: product.isActive
        });
        this.loading = false;
      },
      error: (error) => {
        alert('Failed to load product');
        this.router.navigate(['/seller/products']);
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    const formValue = this.productForm.value;
    
    const productData = {
      ...formValue,
      images: formValue.images ? formValue.images.split(',').map((url: string) => url.trim()) : []
    };

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: () => {
          alert('Product updated successfully!');
          this.router.navigate(['/seller/products']);
        },
        error: (error) => {
          alert(error.message || 'Failed to update product');
          this.loading = false;
        }
      });
    } else {
      this.productService.createProduct(productData).subscribe({
        next: () => {
          alert('Product created successfully!');
          this.router.navigate(['/seller/products']);
        },
        error: (error) => {
          alert(error.message || 'Failed to create product');
          this.loading = false;
        }
      });
    }
  }
}
