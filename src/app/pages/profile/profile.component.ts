import { Component, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonContent, IonInput, IonButton, IonLabel, ToastController } from '@ionic/angular/standalone';
import { AuthStateService } from '../../services/auth-state.service';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import type { User as FirebaseUser } from 'firebase/auth';
import { User } from '../../models/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonInput, IonButton, IonLabel],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  userData: Partial<User> = { email: '', firstName: '', lastName: '', imageUrl: '' };
  formData: Partial<User> = { email: '', firstName: '', lastName: '' };
  userPhoto: string = '/images/avatar.jpg';
  isImagePopupVisible: boolean = false;
  newImageUrl: string = '';

  private _authStateService = inject(AuthStateService);
  private _authService = inject(AuthService);
  private _platformId = inject(PLATFORM_ID);
  private _toastCtrl = inject(ToastController);

  ngOnInit(): void {
    this._authStateService.user$.subscribe((user) => {
      if (user) {
        this.loadUserData(user);
      }
    });
  }

  private loadUserData(user: FirebaseUser): void {
    if (isPlatformBrowser(this._platformId)) {
      const cachedPhoto = localStorage.getItem('userPhoto');
      if (cachedPhoto) {
        this.userPhoto = cachedPhoto;
      }
    }

    this._authService.getUserById(user.uid).subscribe({
      next: (userData: User | null) => {
        if (userData) {
          this.userData = { ...userData };
          this.formData = { ...userData };
          this.userPhoto = userData.imageUrl || '/images/avatar.jpg';
          if (isPlatformBrowser(this._platformId)) {
            localStorage.setItem('userPhoto', this.userPhoto);
          }
        }
      },
      error: (error) => {
        console.error('Error loading user data:', error);
        this.showToast('Error al cargar los datos del usuario.', 'danger');
      },
    });
  }

  toggleImagePopup(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.isImagePopupVisible = !this.isImagePopupVisible;
    if (!this.isImagePopupVisible) {
      this.newImageUrl = '';
    }
  }

  async updateImageUrl(): Promise<void> {
    const user = this._authStateService.currentUser;
    if (!this.newImageUrl || !user) {
      this.showToast('Por favor, ingresa una URL válida o asegúrate de estar autenticado.', 'danger');
      return;
    }

    const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
    if (!urlPattern.test(this.newImageUrl)) {
      this.showToast('La URL debe ser una imagen válida (png, jpg, jpeg, gif, webp).', 'danger');
      return;
    }

    try {
      await this._authService.updateUser({ id: user.uid, imageUrl: this.newImageUrl });
      this.userPhoto = this.newImageUrl;
      this.userData.imageUrl = this.newImageUrl;
      if (isPlatformBrowser(this._platformId)) {
        localStorage.setItem('userPhoto', this.newImageUrl);
      }
      this.showToast('Foto de perfil actualizada correctamente.', 'success');
      this.toggleImagePopup();
    } catch (error) {
      console.error('Error updating image URL:', error);
      this.showToast('Error al actualizar la imagen.', 'danger');
    }
  }

  async saveChanges(): Promise<void> {
    const user = this._authStateService.currentUser;
    if (!user) {
      this.showToast('No estás autenticado.', 'danger');
      return;
    }

    try {
      await this._authService.updateUser({
        id: user.uid,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
      });
      this.userData = {
        ...this.userData,
        firstName: this.formData.firstName,
        lastName: this.formData.lastName,
      };
      this.showToast('Datos actualizados correctamente.', 'success');
    } catch (error) {
      console.error('Error saving changes:', error);
      this.showToast('Error al guardar los cambios.', 'danger');
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
}