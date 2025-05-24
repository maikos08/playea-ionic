import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-page',
  templateUrl: './title-page.component.html',
  styleUrls: ['./title-page.component.scss'],
})
export class TitlePageComponent {
  @Input() title: string = '🏝️ Default Title';
  @Input() backgroundSrc: string =
    'https://images.pexels.com/photos/457882/pexels-photo-457882.jpeg';
}
