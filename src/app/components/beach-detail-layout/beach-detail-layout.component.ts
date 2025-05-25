import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule, ToastController } from '@ionic/angular';
import { from, Observable, of } from 'rxjs';
import { Beach } from '../../models/beach';
import { DatabaseService } from '../../services/database.service';

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

  private databaseService = inject(DatabaseService);
  private router = inject(Router);
  private toastController = inject(ToastController);

  ngOnInit(): void {
    if (!this.beach) {
      console.error('No beach data provided to BeachDetailLayoutComponent');
      return;
    }

    this.isFavorite$ = from(this.databaseService.isFavorite(this.beach.id));
  }

  async toggleFavorite(): Promise<void> {
    if (!this.beach) {
      console.error('Cannot toggle favorite: beach is null');
      return;
    }

    try {
      const isCurrentlyFavorite = await this.databaseService.isFavorite(
        this.beach.id
      );

      if (isCurrentlyFavorite) {
        await this.databaseService.removeFavorite(this.beach.id);
        await this.showToast(
          `${this.beach.name} eliminada de favoritos.`,
          'success'
        );
      } else {
        await this.databaseService.addFavorite({
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
