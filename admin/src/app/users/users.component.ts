import { Component, OnInit } from '@angular/core';
import { UserService } from '../core/services/user.service';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  loading = false;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalUsers = 0;
  limit = 10;

  // Filters
  selectedRole = '';
  searchQuery = '';
  isActiveFilter: any = '';

  // Modal
  showDeleteModal = false;
  selectedUser: any = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAdmin) {
      alert('Access denied. Admin privileges required.');
      this.router.navigate(['/login']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;

    const query: any = {
      page: this.currentPage,
      limit: this.limit
    };

    if (this.selectedRole) query.role = this.selectedRole;
    if (this.searchQuery) query.search = this.searchQuery;
    if (this.isActiveFilter !== '') query.isActive = this.isActiveFilter === 'true';

    this.userService.getAllUsers(query).subscribe({
      next: (response) => {
        this.users = response.users;
        this.totalUsers = response.total;
        this.totalPages = response.pages;
        this.currentPage = response.page;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        alert('Failed to load users');
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearFilters(): void {
    this.selectedRole = '';
    this.searchQuery = '';
    this.isActiveFilter = '';
    this.currentPage = 1;
    this.loadUsers();
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadUsers();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  toggleUserStatus(user: any): void {
    if (confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`)) {
      this.userService.toggleUserStatus(user._id).subscribe({
        next: () => {
          user.isActive = !user.isActive;
          alert('User status updated successfully');
        },
        error: (error) => {
          console.error('Error updating user status:', error);
          alert('Failed to update user status');
        }
      });
    }
  }

  openDeleteModal(user: any): void {
    this.selectedUser = user;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedUser = null;
  }

  confirmDelete(): void {
    if (this.selectedUser) {
      this.userService.deleteUser(this.selectedUser._id).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.closeDeleteModal();
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Failed to delete user');
        }
      });
    }
  }

  getRoleBadgeClass(role: string): string {
    const classes: any = {
      'admin': 'bg-purple-100 text-purple-800',
      'seller': 'bg-green-100 text-green-800',
      'buyer': 'bg-blue-100 text-blue-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
