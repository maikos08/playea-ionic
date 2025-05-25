// sqlite.service.ts
import { Injectable } from '@angular/core';
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root',
})
export class SQLiteService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;

  async init(): Promise<void> {
    if (!this.db) {
      const db = await this.sqlite.createConnection(
        'favoritesDB',
        false,
        'no-encryption',
        1,
        false
      );
      await db.open();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS favorites (
          userId TEXT,
          beachId TEXT,
          PRIMARY KEY (userId, beachId)
        )
      `);
      this.db = db;
    }
  }

  async addFavorite(userId: string, beachId: string): Promise<void> {
    await this.db?.run(
      `INSERT OR IGNORE INTO favorites (userId, beachId) VALUES (?, ?)`,
      [userId, beachId]
    );
  }

  async removeFavorite(userId: string, beachId: string): Promise<void> {
    await this.db?.run(
      `DELETE FROM favorites WHERE userId = ? AND beachId = ?`,
      [userId, beachId]
    );
  }

  async isFavorite(userId: string, beachId: string): Promise<boolean> {
    const res = await this.db?.query(
      `SELECT 1 FROM favorites WHERE userId = ? AND beachId = ?`,
      [userId, beachId]
    );
    return !!(res && res.values && res.values.length > 0);
  }

  async getFavorites(userId: string): Promise<string[]> {
    const res = await this.db?.query(
      `SELECT beachId FROM favorites WHERE userId = ?`,
      [userId]
    );
    return res?.values?.map((row) => row.beachId) ?? [];
  }
}
