import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { IonContent, IonHeader } from '@ionic/angular/standalone';

@Component({
  selector: 'main-layout',
  standalone: true,
  templateUrl: './main-layout.component.html',
  imports: [CommonModule, RouterModule, HeaderComponent, IonHeader, IonContent],
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}