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
  private isInitialized = false;

  constructor(private platform: Platform) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async init(): Promise<void> {
    if (this.isInitialized) {
      console.log('Database already initialized');
      return;
    }

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
        // Usar CREATE TABLE IF NOT EXISTS para evitar eliminar datos existentes
        await db.execute(`
          CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            title TEXT,
            coverUrl TEXT
          );
        `);
        this.isInitialized = true;
        console.log('SQLite database initialized successfully');
      } catch (error) {
        console.error('Error initializing SQLite database:', error);
        this.isInitialized = false;
        throw error;
      }
    } else {
      this.isInitialized = true;
      console.log('Web platform, using localStorage');
    }
  }

  async addFavorite(item: Item): Promise<void> {
    await this.init(); // Asegurar inicialización
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const exists = favorites.some((fav) => fav.id === item.id);
      if (!exists) {
        favorites.push(item);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
        console.log('Favorite added to localStorage:', item);
      }
    } else if (this.db) {
      try {
        await this.db.run(
          `INSERT OR REPLACE INTO favorites (id, title, coverUrl) VALUES (?, ?, ?)`,
          [item.id, item.title, item.coverUrl]
        );
        console.log('Favorite added to SQLite:', item);
      } catch (error) {
        console.error('Error adding favorite to SQLite:', error);
        throw error;
      }
    }
  }

  async removeFavorite(id: string): Promise<void> {
    await this.init();
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter((fav) => fav.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFavorites));
      console.log('Favorite removed from localStorage:', id);
    } else if (this.db) {
      try {
        await this.db.run(`DELETE FROM favorites WHERE id = ?`, [id]);
        console.log('Favorite removed from SQLite:', id);
      } catch (error) {
        console.error('Error removing favorite from SQLite:', error);
        throw error;
      }
    }
  }

  async getFavorites(): Promise<Item[]> {
    await this.init();
    if (this.isWeb) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const favorites = stored ? JSON.parse(stored) : [];
      console.log('Favorites from localStorage:', favorites);
      return favorites;
    } else if (this.db) {
      try {
        const res = await this.db.query(`SELECT * FROM favorites`);
        const favorites = res.values ?? [];
        console.log('Favorites from SQLite:', favorites);
        return favorites;
      } catch (error) {
        console.error('Error querying favorites from SQLite:', error);
        return [];
      }
    }
    return [];
  }

  async isFavorite(id: string): Promise<boolean> {
    await this.init();
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      return favorites.some((fav) => fav.id === id);
    } else if (this.db) {
      try {
        const res = await this.db.query(`SELECT id FROM favorites WHERE id = ?`, [id]);
        return !!(res.values && res.values.length > 0);
      } catch (error) {
        console.error('Error checking favorite in SQLite:', error);
        return false;
      }
    }
    return false;
  }

  async clearFavorites(): Promise<void> {
    await this.init();
    if (this.isWeb) {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Favorites cleared from localStorage');
    } else if (this.db) {
      try {
        await this.db.execute(`DELETE FROM favorites`);
        console.log('Favorites cleared from SQLite');
      } catch (error) {
        console.error('Error clearing favorites from SQLite:', error);
        throw error;
      }
    }
  }
}