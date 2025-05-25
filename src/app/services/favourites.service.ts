import { Injectable, inject } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';
import { Observable, combineLatest, from, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Beach } from '../models/beach';
import { BeachService } from './beach.service';
import { SQLiteService } from './sqlite.service';
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private firestore = inject(Firestore);
  private beachService = inject(BeachService);
  private sqliteService = inject(SQLiteService);

  private isNative = Capacitor.isNativePlatform();

  constructor() {
    if (this.isNative) {
      this.sqliteService.init();
    }
  }

  async addFavoriteBeach(userId: string, beachId: string): Promise<void> {
    if (this.isNative) {
      return this.sqliteService.addFavorite(userId, beachId);
    } else {
      const userDocRef = doc(this.firestore, `Users/${userId}`);
      await updateDoc(userDocRef, { [`favorites.${beachId}`]: true });
    }
  }

  async removeFavoriteBeach(userId: string, beachId: string): Promise<void> {
    if (this.isNative) {
      return this.sqliteService.removeFavorite(userId, beachId);
    } else {
      const userDocRef = doc(this.firestore, `Users/${userId}`);
      await updateDoc(userDocRef, { [`favorites.${beachId}`]: false });
    }
  }

  isFavoriteBeach(userId: string, beachId: string): Observable<boolean> {
    if (this.isNative) {
      return from(this.sqliteService.isFavorite(userId, beachId));
    } else {
      const userDocRef = doc(this.firestore, `Users/${userId}`);
      return from(getDoc(userDocRef)).pipe(
        map((docSnap) => docSnap.data()?.['favorites']?.[beachId] === true),
        catchError(() => of(false))
      );
    }
  }

  getFavoriteBeaches(userId: string): Observable<string[]> {
    if (this.isNative) {
      return from(this.sqliteService.getFavorites(userId));
    } else {
      const userDocRef = doc(this.firestore, `Users/${userId}`);
      return from(getDoc(userDocRef)).pipe(
        map((docSnap) => {
          const data = docSnap.data();
          return data?.['favorites']
            ? Object.keys(data['favorites']).filter(
                (id) => data['favorites'][id] === true
              )
            : [];
        }),
        catchError(() => of([]))
      );
    }
  }

  getFavoriteBeachesDetails(userId: string): Observable<Beach[]> {
    return this.getFavoriteBeaches(userId).pipe(
      switchMap((ids) =>
        ids.length
          ? combineLatest(
              ids.map((id) =>
                this.beachService
                  .getBeachById(id)
                  .pipe(catchError(() => of(null)))
              )
            )
          : of([])
      ),
      map((beaches) => beaches.filter((b): b is Beach => b !== null)),
      catchError(() => of([]))
    );
  }
}
