import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Beach } from '../../models/beach';
import { AuthStateService } from '../../services/auth-state.service';
import { FavoritesService } from '../../services/favourites.service';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import type { User as FirebaseUser } from 'firebase/auth';
import {DatabaseService} from "../../services/database.service";

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
  user: FirebaseUser | null = null;

  private authStateService = inject(AuthStateService);
  private favoritesService = inject(FavoritesService);
  private router = inject(Router);
  private toastController = inject(ToastController);
  private databaseService = inject(DatabaseService);

  ngOnInit(): void {
    console.log('BeachDetailLayoutComponent received beach:', this.beach);
    if (!this.beach) {
      console.error('No beach data provided to BeachDetailLayoutComponent');
      return;
    }

    this.authStateService.user$.subscribe({
      next: (user) => {
        this.user = user;
        if (user && this.beach?.id) {
          this.isFavorite$ = this.favoritesService.isFavoriteBeach(user.uid, this.beach.id);
        } else {
          this.isFavorite$ = of(false);
        }
      },
      error: (error) => {
        console.error('Error fetching user from AuthStateService:', error);
        this.isFavorite$ = of(false);
      }
    });
  }

  async toggleFavorite(): Promise<void> {
    if (!this.beach) {
      console.error('Cannot toggle favorite: beach is null');
      return;
    }

    if (!this.user) {
      const toast = await this.toastController.create({
        message: 'Debes iniciar sesión para guardar favoritos.',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
      this.router.navigate(['/auth/login']);
      return;
    }

    try {
      const isCurrentlyFavorite = await this.favoritesService.isFavoriteBeach(this.user.uid, this.beach.id).toPromise();
      if (isCurrentlyFavorite) {
        await this.favoritesService.removeFavoriteBeach(this.user.uid, this.beach.id);
        this.databaseService.removeFavorite(this.beach.id);
        const toast = await this.toastController.create({
          message: `${this.beach.name} eliminada de favoritos.`,
          duration: 2000,
          color: 'success',
          position: 'bottom',
        });
        await toast.present();
      } else {
        await this.favoritesService.addFavoriteBeach(this.user.uid, this.beach.id);
        this.databaseService.addFavorite(this.beach);
        const toast = await this.toastController.create({
          message: `${this.beach.name} añadida a favoritos.`,
          duration: 2000,
          color: 'success',
          position: 'bottom',
        });
        await toast.present();
      }
      this.isFavorite$ = of(!isCurrentlyFavorite);
    } catch (error: any) {
      console.error('Error toggling favorite:', error);
      const toast = await this.toastController.create({
        message: `Error al gestionar favoritos: ${error.message}`,
        duration: 2000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  }
}
