import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PopupService {
  private isPopupVisible = new BehaviorSubject<boolean>(false);
  private userPhoto = new BehaviorSubject<string>('playea-ionic/src/assets/avatar.jpg');
  private isRegistered = new BehaviorSubject<boolean>(false);

  isPopupVisible$ = this.isPopupVisible.asObservable();
  userPhoto$ = this.userPhoto.asObservable();
  isRegistered$ = this.isRegistered.asObservable();

  togglePopup(): void {
    this.isPopupVisible.next(!this.isPopupVisible.value);
  }

  closePopup(): void {
    this.isPopupVisible.next(false);
  }

  setUserPhoto(photo: string): void {
    this.userPhoto.next(photo);
  }

  setIsRegistered(isRegistered: boolean): void {
    this.isRegistered.next(isRegistered);
  }
}