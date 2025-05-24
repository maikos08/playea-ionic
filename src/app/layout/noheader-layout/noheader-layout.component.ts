import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonContent, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'noheader-layout',
  standalone: true,
  templateUrl: './noheader-layout.component.html',
  imports: [CommonModule, RouterModule, IonContent, IonRouterOutlet],
  styleUrl: './noheader-layout.component.scss'
})
export class NoHeaderLayoutComponent {}