import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { FavoritesService} from "./favourites.service";

export interface FavoriteBeach {
  id: string;
  name: string;
  coverUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isWeb = true;
  private readonly DB_NAME = 'favoritesDB';
  private favouritesService = new FavoritesService();

  constructor(private platform: Platform) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    // this.init();
  }

  private async init() {
    await this.platform.ready();
    this.isWeb = Capacitor.getPlatform() === 'web';

    if (!this.isWeb) {
      try {
        this.db = await this.sqlite.createConnection(
          this.DB_NAME,
          false, // encrypted
          'no-encryption', // mode
          1, // version
          false // readonly
        );
        await this.db.open();
        await this.createTableIfNotExists();
      } catch (error) {
        console.error('SQLite Init Error:', error);
      }
    }
  }

  private async createTableIfNotExists() {
    if (!this.db) return;

    const dropQuery = `DROP TABLE IF EXISTS favorites;`;
    await this.db.execute(dropQuery);

    const query = `
      CREATE TABLE IF NOT EXISTS favorites (
        id TEXT PRIMARY KEY,
        name TEXT,
        coverUrl TEXT
      );
    `;
    await this.db.execute(query);
  }

  async isFavorite(id: string): Promise<boolean> {
    if (this.isWeb) {
      const stored = localStorage.getItem('favorites');
      const favorites: FavoriteBeach[] = stored ? JSON.parse(stored) : [];
      return favorites.some((b) => b.id === id);
    } else {
      // const res = await this.db.query(`SELECT id FROM favorites WHERE id = ?`, [
      //   id,
      // ]);
      // return !!(res.values && res.values.length > 0);
    }
    return false;
  }

  async addFavorite(userid: string | undefined, beach: FavoriteBeach): Promise<void> {
    if (this.isWeb) {
      const stored = localStorage.getItem('favorites');
      const favorites: FavoriteBeach[] = stored ? JSON.parse(stored) : [];
      if (!favorites.some((b) => b.id === beach.id)) {
        favorites.push(beach);
        localStorage.setItem('favorites', JSON.stringify(favorites));
      }
    } else {
      // await this.db.run(
      //   `INSERT OR REPLACE INTO favorites (id, name, coverUrl) VALUES (?, ?, ?)`,
      //   [beach.id, beach.name, beach.coverUrl]
      // );
      this.favouritesService.addFavoriteBeach(userid, beach.id)
    }
  }

  async removeFavorite(userid: string | undefined, beachid: string): Promise<void> {
    if (this.isWeb) {
      const stored = localStorage.getItem('favorites');
      const favorites: FavoriteBeach[] = stored ? JSON.parse(stored) : [];
      const updated = favorites.filter((b) => b.id !== beachid);
      localStorage.setItem('favorites', JSON.stringify(updated));
    } else if (this.db) {
      // await this.db.run(`DELETE FROM favorites WHERE id = ?`, [id]);
      this.favouritesService.removeFavoriteBeach(userid, beachid)
    }
  }

  async getFavorites(): Promise<FavoriteBeach[]> {
    if (this.isWeb) {
      const stored = localStorage.getItem('favorites');
      return stored ? JSON.parse(stored) : [];
    } else if (this.db) {
      // const res = await this.db.query(`SELECT * FROM favorites`);
      // return res.values ?? [];
    }
    return [];
  }

  async clearFavorites(): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem('favorites');
    } else if (this.db) {
      // await this.db.execute(`DELETE FROM favorites`);
    }
  }
}
