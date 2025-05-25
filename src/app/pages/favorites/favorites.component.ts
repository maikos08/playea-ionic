import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TitlePageComponent } from '../../components/title-page/title-page.component';
import { BeachGridComponent } from '../../components/beach-grid/beach-grid.component';
import { FavoritesService } from '../../services/favourites.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Beach } from '../../models/beach';
import { HeaderAlignmentComponent } from 'src/app/components/header-alignment/header-alignment.component';
import { IonContent } from "@ionic/angular/standalone";
import {DatabaseService} from "../../services/database.service";

@Component({
  selector: 'app-user-favourites',
  standalone: true,
  imports: [IonContent, CommonModule, BeachGridComponent, TitlePageComponent, HeaderAlignmentComponent],
  templateUrl: './favorites.component.html',
})
export class FavoritesComponent implements OnInit {
  beaches: Beach[] = [];
  loading = true;

  private authStateService = inject(AuthStateService);
  private favoritesService = inject(FavoritesService);
  private databaseService = inject(DatabaseService);
  private favouritesBeachs: Beach[] = [];

  async loadFavorites(){
    this.favouritesBeachs = await this.databaseService.getFavorites();
    console.log(this.favouritesBeachs);
    this.loading = false;
  }


  ngOnInit() {
    this.loadFavorites()
  //   this.authStateService.user$.subscribe({
  //     next: (user) => {
  //       if (user) {
  //         this.favoritesService.getFavoriteBeachesDetails(user.uid).subscribe({
  //           next: (beaches) => {
  //             this.beaches = beaches;
  //             this.loading = false;
  //           },
  //           error: (error) => {
  //             console.error('Error fetching favorite beaches:', error);
  //             this.beaches = [];
  //             this.loading = false;
  //           },
  //           complete: () => {
  //           },
  //         });
  //       } else {
  //         console.log('No authenticated user found');
  //         this.beaches = [];
  //         this.loading = false;
  //       }
  //     },
  //     error: (error) => {
  //       console.error('Error subscribing to user state:', error);
  //       this.beaches = [];
  //       this.loading = false;
  //     },
  //     complete: () => {
  //     },
  //   });
    console.log("Anterior")
  }
}
