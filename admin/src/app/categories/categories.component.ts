import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CategoryService, Category } from '../core/services/category.service';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css']
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;
  showModal = false;
  isEditMode = false;
  currentCategory: Partial<Category> = {};
  private iconPreviewCache = new Map<string, SafeHtml>();

  constructor(private categoryService: CategoryService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoryService.getAllCategories().subscribe({
      next: (result) => {
        this.iconPreviewCache.clear();
        this.categories = result.categories;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        const errorMessage = error?.message || 'Failed to load categories';
        alert(`Failed to load categories: ${errorMessage}`);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.currentCategory = {
      name: '',
      description: '',
      iconSvg: '',
      isActive: true
    };
    this.showModal = true;
  }

  openEditModal(category: Category): void {
    this.isEditMode = true;
    this.currentCategory = { ...category };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.currentCategory = {};
  }

  saveCategory(): void {
    if (!this.currentCategory.name) {
      alert('Category name is required');
      return;
    }

    // Generate slug from name if not provided
    if (!this.currentCategory.slug) {
      this.currentCategory.slug = this.generateSlug(this.currentCategory.name);
    }

    if (this.isEditMode && this.currentCategory._id) {
      this.categoryService.updateCategory(this.currentCategory._id, this.currentCategory).subscribe({
        next: () => {
          alert('Category updated successfully');
          this.loadCategories();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error updating category:', error);
          alert('Failed to update category');
        }
      });
    } else {
      this.categoryService.createCategory(this.currentCategory).subscribe({
        next: () => {
          alert('Category created successfully');
          this.loadCategories();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error creating category:', error);
          alert('Failed to create category');
        }
      });
    }
  }

  deleteCategory(id: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          alert('Category deleted successfully');
          this.loadCategories();
        },
        error: (error) => {
          console.error('Error deleting category:', error);
          alert('Failed to delete category');
        }
      });
    }
  }

  toggleStatus(id: string): void {
    this.categoryService.toggleCategoryStatus(id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error toggling category status:', error);
        alert('Failed to toggle category status');
      }
    });
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  getIconPreview(iconSvg?: string): SafeHtml | null {
    if (!iconSvg) {
      return null;
    }
    if (this.iconPreviewCache.has(iconSvg)) {
      return this.iconPreviewCache.get(iconSvg)!;
    }
    const safe = this.sanitizer.bypassSecurityTrustHtml(iconSvg);
    this.iconPreviewCache.set(iconSvg, safe);
    return safe;
  }
}
