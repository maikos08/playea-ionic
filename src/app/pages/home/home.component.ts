import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BeachGridComponent } from 'src/app/components/beach-grid/beach-grid.component';
import { Beach } from 'src/app/models/beach';
import { beachesList } from 'src/app/constants/beaches-list';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [BeachGridComponent, CommonModule]
})
export class HomeComponent {
  beaches: Beach[] = beachesList;
  loading = false;

}
