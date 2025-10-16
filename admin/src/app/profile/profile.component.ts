import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: any = null;
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  loading = false;
  activeTab = 'profile';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.initializeForms();
    });

    // Load fresh profile data
    this.loadProfile();
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      phone: [this.currentUser?.phone || ''],
      address: this.fb.group({
        street: [this.currentUser?.address?.street || ''],
        city: [this.currentUser?.address?.city || ''],
        state: [this.currentUser?.address?.state || ''],
        zipCode: [this.currentUser?.address?.zipCode || ''],
        country: [this.currentUser?.address?.country || '']
      })
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  loadProfile(): void {
    this.authService.getProfile().subscribe({
      next: (response) => {
        // Profile updated in auth service
      },
      error: (error) => {
        console.error('Error loading profile:', error);
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loading = true;
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.loading = false;
      },
      error: (error) => {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
        this.loading = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }

    this.loading = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        alert('Password changed successfully!');
        this.passwordForm.reset();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error changing password:', error);
        alert('Failed to change password. Please check your current password.');
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  isFieldInvalid(fieldName: string, formGroup: FormGroup = this.profileForm): boolean {
    const field = formGroup.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string, formGroup: FormGroup = this.profileForm): string {
    const field = formGroup.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength']) return `Minimum ${field.errors['minlength'].requiredLength} characters required`;
    }
    return '';
  }
}
