import { Injectable, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DatabaseService, Item } from './database.service';

export interface FavoriteBeach {
  id: string;
  name: string;
  coverUrl: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private databaseService = inject(DatabaseService);
  private isNative = Capacitor.isNativePlatform();

  constructor() {
    if (this.isNative) {
      this.databaseService['init']?.(); // Ensure native DB is initialized
    }
  }

  async addFavoriteBeach(beach: FavoriteBeach): Promise<void> {
    const item: Item = {
      id: beach.id,
      title: beach.name,
      coverUrl: beach.coverUrl,
    };
    await this.databaseService.addFavorite(item);
  }

  async removeFavoriteBeach(beachId: string): Promise<void> {
    await this.databaseService.removeFavorite(beachId);
  }

  isFavoriteBeach(beachId: string): Observable<boolean> {
    return from(this.databaseService.isFavorite(beachId));
  }

  getFavoriteBeaches(): Observable<FavoriteBeach[]> {
    return from(this.databaseService.getFavorites()).pipe(
      map((items: Item[]) =>
        items.map((item) => ({
          id: item.id,
          name: item.title,
          coverUrl: item.coverUrl,
        }))
      ),
      catchError(() => of([]))
    );
  }

  async clearFavorites(): Promise<void> {
    await this.databaseService.clearFavorites();
  }
}
