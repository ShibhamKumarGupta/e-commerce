import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  loading = false;
  updatingProfile = false;
  changingPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[\d\s\+\-\(\)]{10,15}$/)]],
      street: ['', [Validators.minLength(5)]],
      city: ['', [Validators.minLength(2)]],
      state: ['', [Validators.minLength(2)]],
      zipCode: ['', [Validators.pattern(/^\d{5,10}$/)]],
      country: ['', [Validators.minLength(2)]]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(50)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading = true;
    this.authService.getProfile().subscribe({
      next: (response) => {
        this.user = response.data.user;
        if (this.user) {
          this.profileForm.patchValue({
            name: this.user.name,
            email: this.user.email,
            phone: this.user.phone || '',
            street: this.user.address?.street || '',
            city: this.user.address?.city || '',
            state: this.user.address?.state || '',
            zipCode: this.user.address?.zipCode || '',
            country: this.user.address?.country || ''
          });
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.updatingProfile = true;
    const formValue = this.profileForm.value;
    
    const updateData = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      address: {
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode,
        country: formValue.country
      }
    };

    this.authService.updateProfile(updateData).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.updatingProfile = false;
      },
      error: (error) => {
        alert(error.message || 'Failed to update profile');
        this.updatingProfile = false;
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    this.changingPassword = true;
    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        alert('Password changed successfully!');
        this.passwordForm.reset();
        this.changingPassword = false;
      },
      error: (error) => {
        alert(error.message || 'Failed to change password');
        this.changingPassword = false;
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }
}
