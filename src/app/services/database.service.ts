import { Injectable, inject } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';
import { Platform, ToastController } from '@ionic/angular';
import { FavoriteBeach } from './favourites.service';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isWeb: boolean = false;
  private readonly STORAGE_KEY = 'favorites';
  private readonly STORAGE_DB = 'favoritesDB';

  private toastController = inject(ToastController);

  constructor(private platform: Platform) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
    this.init();
  }

  private async init() {
    await this.platform.ready();
    this.isWeb = Capacitor.getPlatform() === 'web';

    if (!this.isWeb) {
      try {
        const isConn = await this.sqlite.isConnection(this.STORAGE_DB, false);

        if (isConn.result) {
          await this.showToast('🔄 Reusing existing SQLite connection');
          this.db = await this.sqlite.retrieveConnection(
            this.STORAGE_DB,
            false
          );
        } else {
          await this.showToast('🆕 Creating new SQLite connection');
          this.db = await this.sqlite.createConnection(
            this.STORAGE_DB,
            false,
            'no-encryption',
            1,
            false
          );
        }

        const isOpen = await this.db.isDBOpen();
        if (!isOpen) {
          await this.db.open();
          await this.showToast('✅ DB opened');
        }

        await this.db.execute(`
          CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            name TEXT,
            coverUrl TEXT
          );
        `);

        await this.showToast('✅ Favorites table ready');
      } catch (error: any) {
        console.error('Error opening SQLite database', error);
        await this.showToast(
          `❌ SQLite init failed: ${error.message || error}`
        );
      }
    } else {
      await this.showToast('ℹ️ Using localStorage on Web');
    }
  }

  async addFavorite(item: FavoriteBeach): Promise<void> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const exists = favorites.some((fav) => fav.id === item.id);
      if (!exists) {
        favorites.push(item);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
        await this.showToast(`Web: Added ${item.name}`);
      }
    } else if (this.db) {
      await this.db.run(
        `INSERT OR REPLACE INTO favorites (id, name, coverUrl) VALUES (?, ?, ?)`,
        [item.id, item.name, item.coverUrl]
      );
      await this.showToast(`SQLite: Added ${item.name}`);
    }
  }

  async removeFavorite(id: string): Promise<void> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const updatedFavorites = favorites.filter((fav: any) => fav.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFavorites));
      await this.showToast(`Web: Removed ${id}`);
    } else if (this.db) {
      await this.db.run(`DELETE FROM favorites WHERE id = ?`, [id]);
      await this.showToast(`SQLite: Removed ${id}`);
    }
  }

  async getFavorites(): Promise<FavoriteBeach[]> {
    if (this.isWeb) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const data = stored ? JSON.parse(stored) : [];
      await this.showToast(`Web: Loaded ${data.length} favorites`);
      return data;
    } else if (this.db) {
      const res = await this.db.query(`SELECT * FROM favorites`);
      await this.showToast(
        `SQLite: Loaded ${res.values?.length ?? 0} favorites`
      );
      return res.values ?? [];
    }
    return [];
  }

  async isFavorite(id: string): Promise<boolean> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const result = favorites.some((fav: any) => fav.id === id);
      await this.showToast(`Web: isFavorite ${id}: ${result}`);
      return result;
    } else if (this.db) {
      const res = await this.db.query(`SELECT id FROM favorites WHERE id = ?`, [
        id,
      ]);
      const result = !!(res.values && res.values.length > 0);
      await this.showToast(`SQLite: isFavorite ${id}: ${result}`);
      return result;
    }
    return false;
  }

  async clearFavorites(): Promise<void> {
    if (this.isWeb) {
      localStorage.removeItem(this.STORAGE_KEY);
      await this.showToast('Web: Cleared favorites');
    } else if (this.db) {
      await this.db.execute(`DELETE FROM favorites`);
      await this.showToast('SQLite: Cleared favorites');
    }
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color: 'medium',
      position: 'bottom',
    });
    await toast.present();
  }
}
