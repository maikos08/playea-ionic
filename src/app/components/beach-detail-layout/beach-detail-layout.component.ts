import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { Beach } from '../../models/beach';
import { FavoritesService } from '../../services/favourites.service';

@Component({
  selector: 'app-beach-detail-layout',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './beach-detail-layout.component.html',
  styleUrls: ['./beach-detail-layout.component.scss'],
})
export class BeachDetailLayoutComponent implements OnInit {
  @Input() beach: Beach | null = null;
  isFavorite$: Observable<boolean> = of(false);

  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  ngOnInit(): void {
    if (!this.beach) {
      console.error('No beach data provided to BeachDetailLayoutComponent');
      return;
    }

    this.isFavorite$ = this.favoritesService.isFavoriteBeach(this.beach.id);
  }

  async toggleFavorite(): Promise<void> {
    if (!this.beach) {
      console.error('Cannot toggle favorite: beach is null');
      return;
    }

    try {
      const isCurrentlyFavorite = await this.favoritesService
        .isFavoriteBeach(this.beach.id)
        .toPromise();

      if (isCurrentlyFavorite) {
        await this.favoritesService.removeFavoriteBeach(this.beach.id);
        await this.showToast(
          `${this.beach.name} eliminada de favoritos.`,
          'success'
        );
      } else {
        await this.favoritesService.addFavoriteBeach({
          id: this.beach.id,
          name: this.beach.name,
          coverUrl: this.beach.coverUrl || '',
        });
        await this.showToast(
          `${this.beach.name} añadida a favoritos.`,
          'success'
        );
      }

      this.isFavorite$ = of(!isCurrentlyFavorite);
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      await this.showToast(
        `Error al gestionar favoritos: ${error.message}`,
        'danger'
      );
    }
  }

  private async showToast(message: string, color: 'success' | 'danger') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}