import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { IonicModule, ToastController } from '@ionic/angular';
import { UserHeaderComponent } from '../user-header/user-header.component';
import { PopupService } from '../../services/popup.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, IonicModule, UserHeaderComponent],
})
export class HeaderComponent implements OnInit {
  isRegistered: boolean = false;
  isPopupOpen: boolean = false;
  userPhoto: string = 'assets/avatar.jpg';

  private _popupService = inject(PopupService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _toastCtrl = inject(ToastController);

  ngOnInit(): void {
    this._popupService.isPopupVisible$.subscribe((visible) => {
      this.isPopupOpen = visible;
    });

    this._popupService.isRegistered$.subscribe((isRegistered) => {
      this.isRegistered = isRegistered;
    });

    this._popupService.userPhoto$.subscribe((photo) => {
      this.userPhoto = photo;
    });
  }

  async logout(): Promise<void> {
    try {
      await this._authService.logout();
      this._popupService.closePopup();
      await this.showToast('Sesión cerrada exitosamente', 'success');
      this._router.navigate(['/auth/login']);
    } catch (error) {
      console.error('Logout error:', error);
      await this.showToast('Error al cerrar sesión', 'danger');
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this._toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!this.isPopupOpen) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.popup__container') && !target.closest('.user-header__menu-toggle')) {
      this._popupService.closePopup();
    }
  }
}
