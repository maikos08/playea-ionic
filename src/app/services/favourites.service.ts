import { Injectable, inject } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DatabaseService } from './database.service';

export interface FavoriteBeach {
  id: string;
  name: string;
  coverUrl: string;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private databaseService = inject(DatabaseService);

  async addFavoriteBeach(beach: FavoriteBeach): Promise<void> {
    await this.databaseService.addFavorite(beach);
  }

  async removeFavoriteBeach(beachId: string): Promise<void> {
    await this.databaseService.removeFavorite(beachId);
  }

  isFavoriteBeach(beachId: string): Observable<boolean> {
    return from(this.databaseService.isFavorite(beachId));
  }

  getFavoriteBeaches(): Observable<FavoriteBeach[]> {
    return from(this.databaseService.getFavorites()).pipe(
      map((items: FavoriteBeach[]) =>
        items.map((item) => ({
          id: item.id,
          name: item.name,
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
