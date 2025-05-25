import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
export class FavoritesComponent implements OnInit {
  beaches: { id: string; name: string; coverUrl: string }[] = [];
  loading = true;
  error: string | null = null; // Añadido para manejar errores en la UI

  constructor(private favoritesService: FavoritesService) {}

  async ngOnInit() {
    this.loading = true;
    this.error = null;

    try {
      // Asegúrate de que la base de datos esté inicializada
      await this.favoritesService['databaseService'].init();
      console.log('Database initialized in FavoritesComponent');

      this.favoritesService.getFavoriteBeaches().subscribe({
        next: (beaches) => {
          console.log('Favorite beaches loaded:', beaches);
          this.beaches = beaches;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading favorite beaches:', error);
          this.beaches = [];
          this.error = 'No se pudieron cargar las playas favoritas.';
          this.loading = false;
        },
      });
    } catch (error) {
      console.error('Error initializing database in FavoritesComponent:', error);
      this.error = 'Error al inicializar la base de datos.';
      this.beaches = [];
      this.loading = false;
    }
  }
}