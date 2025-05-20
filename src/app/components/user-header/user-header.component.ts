import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-user-header',
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss'],
  imports: [IonicModule, CommonModule]
})
export class UserHeaderComponent  implements OnInit {
  isRegistered = false;
  constructor() { }

  ngOnInit() {}

}
