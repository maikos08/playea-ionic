import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

export interface FavoriteItem {
  id: string;
  title: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isWeb = false;

  private readonly DB_NAME = 'favoritesDB';
  private readonly STORAGE_KEY = 'favorites';

  constructor(private platform: Platform) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.init();
  }

  private async init() {
    await this.platform.ready();
    this.isWeb = Capacitor.getPlatform() === 'web';

    if (!this.isWeb) {
      try {
        const db = await this.sqlite.createConnection(
          this.DB_NAME,
          false,
          'no-encryption',
          1,
          false
        );
        await db.open();
        this.db = db;
        await db.execute(`
          CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            title TEXT,
            imageUrl TEXT
          );
        `);
      } catch (error) {
        console.error('Error opening SQLite database:', error);
      }
    }
  }

  async addFavorite(item: FavoriteItem): Promise<void> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      if (!favorites.some((fav) => fav.id === item.id)) {
        favorites.push(item);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
      }
    } else if (this.db) {
      await this.db.run(
        `INSERT OR REPLACE INTO favorites (id, title, imageUrl) VALUES (?, ?, ?)`,
        [item.id, item.title, item.imageUrl]
      );
    }
  }

  async removeFavorite(id: string): Promise<void> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const updated = favorites.filter((fav) => fav.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } else if (this.db) {
      await this.db.run(`DELETE FROM favorites WHERE id = ?`, [id]);
    }
  }

  async getFavorites(): Promise<FavoriteItem[]> {
    if (this.isWeb) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } else if (this.db) {
      const res = await this.db.query(`SELECT * FROM favorites`);
      return res.values ?? [];
    }
    return [];
  }

  async isFavorite(id: string): Promise<boolean> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.id === id);
    } else if (this.db) {
      const res = await this.db.query(`SELECT id FROM favorites WHERE id = ?`, [
        id,
      ]);
      return !!(res.values && res.values.length > 0);
    }
    return false;
  }

  async clearFavorites(): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(this.STORAGE_KEY);
    } else if (this.db) {
      await this.db.execute(`DELETE FROM favorites`);
    }
  }
}
