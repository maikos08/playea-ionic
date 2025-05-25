import { Injectable, inject } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Platform, ToastController } from '@ionic/angular';

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
  private initialized = false;

  private toastController = inject(ToastController);
  private platform = inject(Platform);

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.initOnceIfNeeded(); // call only once
  }

  public async initOnceIfNeeded() {
    if (this.initialized) return;

    await this.platform.ready();
    this.isWeb = Capacitor.getPlatform() === 'web';

    if (!this.isWeb) {
      try {
        const existing = await this.sqlite.isConnection(this.STORAGE_DB, false);

        let db: SQLiteDBConnection;

        if (existing.result) {
          this.showDebugToast('🔁 Retrieving existing connection...');
          db = await this.sqlite.retrieveConnection(this.STORAGE_DB, false);
        } else {
          this.showDebugToast('🆕 Creating new SQLite connection...');
          db = await this.sqlite.createConnection(
            this.STORAGE_DB,
            false,
            'no-encryption',
            1,
            false
          );
        }

        await db.open();
        this.db = db;

        await db.execute(`
        CREATE TABLE IF NOT EXISTS favorites (
          id TEXT PRIMARY KEY,
          title TEXT,
          coverUrl TEXT
        );
      `);

        this.showDebugToast('✅ SQLite connection ready');
      } catch (error: any) {
        console.error('SQLite init error:', error);
        this.showDebugToast(`❌ SQLite init failed: ${error.message || error}`);
      }
    } else {
      this.showDebugToast('ℹ️ Web mode using localStorage');
    }

    this.initialized = true;
  }

  async addFavorite(item: Item): Promise<void> {
    await this.initOnceIfNeeded();

    try {
      if (this.isWeb) {
        const favorites = await this.getFavorites();
        const exists = favorites.some((fav) => fav.id === item.id);
        if (!exists) {
          favorites.push(item);
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
          this.showDebugToast(`Web: Added ${item.title}`);
        } else {
          this.showDebugToast(`Web: ${item.title} already exists`);
        }
      } else if (this.db) {
        await this.db.run(
          `INSERT OR REPLACE INTO favorites (id, title, coverUrl) VALUES (?, ?, ?)`,
          [item.id, item.title, item.coverUrl]
        );
        this.showDebugToast(`SQLite: Added ${item.title}`);
      }
    } catch (err: any) {
      this.showDebugToast(`❌ addFavorite error: ${err.message}`);
    }
  }

  async removeFavorite(id: string): Promise<void> {
    await this.initOnceIfNeeded();

    try {
      if (this.isWeb) {
        const favorites = await this.getFavorites();
        const updatedFavorites = favorites.filter((fav: any) => fav.id !== id);
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(updatedFavorites)
        );
        this.showDebugToast(`Web: Removed item ${id}`);
      } else if (this.db) {
        await this.db.run(`DELETE FROM favorites WHERE id = ?`, [id]);
        this.showDebugToast(`SQLite: Removed item ${id}`);
      }
    } catch (err: any) {
      this.showDebugToast(`❌ removeFavorite error: ${err.message}`);
    }
  }

  async getFavorites(): Promise<Item[]> {
    await this.initOnceIfNeeded();

    try {
      if (this.isWeb) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : [];
        this.showDebugToast(`Web: Loaded ${data.length} favorites`);
        return data;
      } else if (this.db) {
        const res = await this.db.query(`SELECT * FROM favorites`);
        this.showDebugToast(
          `SQLite: Loaded ${res.values?.length ?? 0} favorites`
        );
        return res.values ?? [];
      }
    } catch (err: any) {
      this.showDebugToast(`❌ getFavorites error: ${err.message}`);
    }

    return [];
  }

  async isFavorite(id: string): Promise<boolean> {
    await this.initOnceIfNeeded();

    try {
      if (this.isWeb) {
        const favorites = await this.getFavorites();
        const result = favorites.some((fav: any) => fav.id === id);
        this.showDebugToast(`Web: isFavorite ${id}: ${result}`);
        return result;
      } else if (this.db) {
        const res = await this.db.query(
          `SELECT id FROM favorites WHERE id = ?`,
          [id]
        );
        const result = !!(res.values && res.values.length > 0);
        this.showDebugToast(`SQLite: isFavorite ${id}: ${result}`);
        return result;
      }
    } catch (err: any) {
      this.showDebugToast(`❌ isFavorite error: ${err.message}`);
    }

    return false;
  }

  async clearFavorites(): Promise<void> {
    await this.initOnceIfNeeded();

    try {
      if (this.isWeb) {
        localStorage.removeItem(this.STORAGE_KEY);
        this.showDebugToast('Web: Cleared favorites');
      } else if (this.db) {
        await this.db.execute(`DELETE FROM favorites`);
        this.showDebugToast('SQLite: Cleared favorites');
      }
    } catch (err: any) {
      this.showDebugToast(`❌ clearFavorites error: ${err.message}`);
    }
  }

  private async showDebugToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      color: 'medium',
      position: 'bottom',
    });
    await toast.present();
  }
}
