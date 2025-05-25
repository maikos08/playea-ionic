import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';

export interface Item {
  id: string;
  title: string;
  coverUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isWeb: boolean = false;
  private readonly STORAGE_KEY = 'favorites';
  private readonly STORAGE_DB = 'favoritesDB';

  //favoritesChanged = new BehaviorSubject<void>(undefined);

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
          this.STORAGE_DB,
          false,
          'no-encryption',
          1,
          false
        );
        await db.open();
        this.db = db;
        await db.execute(`DROP TABLE IF EXISTS favorites;`);
        await db.execute(`
  CREATE TABLE favorites (
    id TEXT PRIMARY KEY,
    title TEXT,
    coverUrl TEXT
  );
`);
      } catch (error) {
        console.error('Error opening SQLite database', error);
      }
    }
  }

  async addFavorite(item: Item): Promise<void> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const exists = favorites.some((fav) => fav.id === item.id);
      if (!exists) {
        const favoriteItem = {
          id: item.id,
          title: item.title,
          coverUrl: item.coverUrl,
        };

        favorites.push(favoriteItem);

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
        //this.favoritesChanged.next();
      }
    } else if (this.db) {
      await this.db.run(
        `INSERT OR REPLACE INTO favorites (id, title, coverUrl) VALUES (?, ?, ?)`,
        [item.id, item.title, item.coverUrl]
      );
      //this.favoritesChanged.next();
    }
  }

  async removeFavorite(id: string): Promise<void> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter((fav: any) => fav.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFavorites));
      //this.favoritesChanged.next();
    } else if (this.db) {
      await this.db.run(`DELETE FROM favorites WHERE id = ?`, [id]);
      //this.favoritesChanged.next();
    }
  }

  async getFavorites(): Promise<Item[]> {
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
      return favorites.some((fav: any) => fav.id === id);
    } else if (this.db) {
      const res = await this.db.query(`SELECT id FROM favorites WHERE id = ?`, [
        id,
      ]);
      //return res.values?.length > 0 ?? false;
      return !!(res.values && res.values.length > 0);
    }

    return false;
  }

  async clearFavorites(): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(this.STORAGE_KEY);
      //this.favoritesChanged.next();
    } else if (this.db) {
      await this.db.execute(`DELETE FROM favorites`);
      //this.favoritesChanged.next();
    }
  }
}
