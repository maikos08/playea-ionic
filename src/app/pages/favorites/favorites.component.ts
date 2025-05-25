import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderAlignmentComponent } from 'src/app/components/header-alignment/header-alignment.component';
import { BeachGridComponent } from '../../components/beach-grid/beach-grid.component';
import { TitlePageComponent } from '../../components/title-page/title-page.component';
import { FavoritesService } from '../../services/favourites.service';

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

  constructor(private favoritesService: FavoritesService) {}

  async ionViewWillEnter() {
    this.loading = true;

    this.favoritesService.getFavoriteBeaches().subscribe({
      next: (beaches) => {
        // Adapt plain favorites into Beach model if needed
        this.beaches = beaches.map((fav) => ({
          id: fav.id,
          name: fav.name,
          coverUrl: fav.coverUrl,
        }));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading local favorites:', error);
        this.beaches = [];
        this.loading = false;
      },
    });
  }
}
