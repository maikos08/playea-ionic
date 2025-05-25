import { Injectable } from '@angular/core';
import {Capacitor} from "@capacitor/core";
import {Beach} from "../models/beach";
import {Platform} from "@ionic/angular";
import {CapacitorSQLite, SQLiteConnection, SQLiteDBConnection} from "@capacitor-community/sqlite";

@Injectable({
  providedIn: 'root'
})

export class DatabaseService {

  private sqlite: SQLiteConnection;
  private db: SQLiteDBConnection | null = null;
  private isWeb: boolean = false;
  private readonly STORAGE_KEY = 'favorites';
  private readonly STORAGE_DB = 'favoritesDB';

  constructor(private platform: Platform) {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  private async init() {
    await this.platform.ready();
    this.isWeb = Capacitor.getPlatform() === 'web';

    if (!this.isWeb) {
      try {
        const db = await this.sqlite.createConnection(
          this.STORAGE_DB, false, 'no-encryption', 1, false
        );
        await db.open();
        this.db = db;
        await db.execute(`
          CREATE TABLE IF NOT EXISTS favorites (
            id TEXT PRIMARY KEY,
            coverUrl TEXT,
            name TEXT,
            island TEXT,
            municipality TEXT,
            accessByCar BOOLEAN,
            accessByFoot TEXT,
            annualMaxOccupancy TEXT,
            blueFlag BOOLEAN,
            classification TEXT,
            environmentCondtion TEXT,
            hasSand BOOLEAN,
            hasRock BOOLEAN,
            hasToilets BOOLEAN,
            hasShowers BOOLEAN,
            longitude INTEGER,
            latitude INTEGER,
            length INTEGER,
          );
        `);
      } catch (error) {
        console.error('Error opening SQLite database', error);
      }
    }
  }

  async getFavorites(): Promise<Beach[]> {
    if (this.isWeb) {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } else if (this.db) {
      const res = await this.db.query(`SELECT * FROM favorites`);
      console.log('Playas favoritas:', res);
      return res.values ?? [];
    }
    return [];
  }

  async addFavorite(beach: Beach ): Promise<void> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      const exists = favorites.some(fav => fav.id === beach.id);
      if (!exists) {
        const favouriteBeach = {
          id: beach.id,
          name: beach.name,
          coverUrl: beach.coverUrl
        };
        favorites.push(<Beach>favouriteBeach);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(favorites));
        //this.favoritesChanged.next();
      }
    } else if (this.db) {
      await this.db.run(
        `INSERT OR REPLACE INTO favorites (id, coverUrl, name, island, municipality, accessByCar, accessByFoot, annualMaxOccupancy, blueFlag, classification, environmentCondition, hasSand, hasRock, hasToilets, hasShowers, longitude, latitude, length) VALUES (?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?)`,
        [beach.id, beach.coverUrl, beach.name, beach.island, beach.municipality, beach.accessByCar, beach.accessByFoot, beach.annualMaxOccupancy, beach.blueFlag, beach.classification, beach.environmentCondition, beach.hasSand, beach.hasRock, beach.hasToilets, beach.hasShowers, beach.hasShowers, beach.longitude, beach.latitude, beach.length]
      );
      //this.favoritesChanged.next();
    }
    console.log('Adding favorites', beach);
  }

  async isFavorite(id: string): Promise<boolean> {
    if (this.isWeb) {
      const favorites = await this.getFavorites();
      return favorites.some((fav: any) => fav.id === id);
    } else if (this.db) {
      const res =
        await this.db.query(`SELECT id FROM favorites WHERE id = ?`, [id]);
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
}
