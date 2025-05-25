import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderAlignmentComponent } from 'src/app/components/header-alignment/header-alignment.component';
import { BeachGridComponent } from '../../components/beach-grid/beach-grid.component';
import { TitlePageComponent } from '../../components/title-page/title-page.component';
import { DatabaseService } from '../../services/database.service';

@Component({
  selector: 'app-user-favourites',
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    BeachGridComponent,
    TitlePageComponent,
    HeaderAlignmentComponent,
  ],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent {
  beaches: { id: string; name: string; coverUrl: string }[] = [];
  loading = true;

  constructor(private databaseService: DatabaseService) {}

  async ionViewWillEnter() {
    this.loading = true;

    try {
      const favorites = await this.databaseService.getFavorites();

      this.beaches = favorites.map((fav) => ({
        id: fav.id,
        name: fav.name,
        coverUrl: fav.coverUrl,
      }));
    } catch (error) {
      console.error('Error loading local favorites:', error);
      this.beaches = [];
    } finally {
      this.loading = false;
    }
  }
}
