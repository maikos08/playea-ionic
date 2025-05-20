import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BeachGridComponent } from 'src/app/components/beach-grid/beach-grid.component';
import { Beach } from 'src/app/models/beach';
import { beachesList } from 'src/app/constants/beaches-list';
import { BeachService } from 'src/app/services/beach.service';
import { IonContent, IonSpinner, IonGrid } from "@ionic/angular/standalone";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [IonGrid, IonSpinner, IonContent, BeachGridComponent, CommonModule,]
})
export class HomeComponent implements OnInit {
  beaches: Beach[] = beachesList;
  loading = false;

  constructor(private beachService: BeachService) {}
  ngOnInit() {
    /* this.loading = true;
    this.beachService.createBeaches(this.beaches).then(() => {
      console.log('Beaches created successfully');
      this.loading = false;
    }).catch((error) => {
      console.error('Error creating beaches:', error);
      this.loading = false;
    }); */
  }
}
