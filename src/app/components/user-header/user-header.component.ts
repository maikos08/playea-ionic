import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener, PLATFORM_ID, Inject, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthStateService } from '../../services/auth-state.service';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import type { User as FirebaseUser } from 'firebase/auth';
import { User } from '../../models/user';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
  imports: [IonicModule, CommonModule],
  standalone: true
})
export class UserHeaderComponent implements OnInit {
  isRegistered: boolean = false;
  isPopupVisible: boolean = false;
  userPhoto: string = '/images/avatar.jpg';

  private _authStateService = inject(AuthStateService);
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this._platformId)) {
      this.loadUserPhotoFromLocalStorage();
    }

    this._authStateService.user$.subscribe((user) => {
      this.isRegistered = !!user;
      if (user) {
        this.loadUserData(user);
      } else {
        this.userPhoto = '/images/avatar.jpg';
        if (isPlatformBrowser(this._platformId)) {
          localStorage.removeItem('userPhoto');
        }
      }
    });
  }

  private loadUserData(user: FirebaseUser): void {
    if (isPlatformBrowser(this._platformId)) {
      const cachedPhoto = localStorage.getItem('userPhoto');
      if (cachedPhoto) {
        this.userPhoto = cachedPhoto;
        return;
      }
    }

    this._authService.getUserById(user.uid).subscribe({
      next: (userData: User | null) => {
        this.userPhoto = userData?.imageUrl || '/images/avatar.jpg';
        if (isPlatformBrowser(this._platformId)) {
          localStorage.setItem('userPhoto', this.userPhoto);
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.userPhoto = '/images/avatar.jpg';
        if (isPlatformBrowser(this._platformId)) {
          localStorage.setItem('userPhoto', this.userPhoto);
        }
      },
    });
  }

  private loadUserPhotoFromLocalStorage(): void {
    if (isPlatformBrowser(this._platformId)) {
      const cachedPhoto = localStorage.getItem('userPhoto');
      if (cachedPhoto && this.isRegistered) {
        this.userPhoto = cachedPhoto;
      }
    }
  }

  togglePopup(): void {
    this.isPopupVisible = !this.isPopupVisible;
  }

  closePopup(): void {
    this.isPopupVisible = false;
  }

  async logout(): Promise<void> {
    try {
      await this._authService.logout();
      this.closePopup();
      this._router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.isPopupVisible) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.popup__container') && !target.closest('.user-header__menu-toggle')) {
      this.closePopup();
    }
  }
}