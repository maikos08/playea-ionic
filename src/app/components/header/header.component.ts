import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { UserHeaderComponent } from '../user-header/user-header.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, IonicModule, UserHeaderComponent] 
})
export class HeaderComponent implements OnInit {
  isRegistered = false;
  isPopupOpen = false;

  constructor() {}

  ngOnInit() {}

  togglePopup() {
    this.isPopupOpen = !this.isPopupOpen;
  }

  closePopup() {
    this.isPopupOpen = false;
  }
}