import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BeachGridComponent } from 'src/app/components/beach-grid/beach-grid.component';
import { Beach } from 'src/app/models/beach';
import { beachesList } from 'src/app/constants/beaches-list';
import { BeachService } from 'src/app/services/beach.service';
import { IonContent, IonSpinner, IonGrid } from "@ionic/angular/standalone";
import { HeaderAlignmentComponent } from 'src/app/components/header-alignment/header-alignment.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [IonGrid, IonSpinner, IonContent, BeachGridComponent, CommonModule, HeaderAlignmentComponent]
})
export class HomeComponent implements OnInit {
  beaches: Beach[] = [];
  loading = false;

  constructor(private beachService: BeachService) {}
  ngOnInit() {
    this.loading = true;
    this.beachService.getAllBeaches().subscribe((beaches) => {
      this.beaches = beaches;
      this.loading = false;
    });
    console.log('beaches', this.beaches);
    console.log('beachesList', beachesList);
  }
}
