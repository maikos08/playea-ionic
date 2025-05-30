import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { beachesList } from '../../constants/beaches-list';
import { Beach } from '../../models/beach';
import { BeachCardComponent } from '../beach-card/beach-card.component';
// import { BeachService } from '../../services/beach.service';

@Component({
  selector: 'app-beach-grid',
  standalone: true,
  imports: [CommonModule, BeachCardComponent],
  templateUrl: './beach-grid.component.html',
  styleUrls: ['./beach-grid.component.scss'],
})
export class BeachGridComponent implements OnInit {
  @Input() beaches: any[] = [];
  @Input() showEmptyState: boolean = false;
  // beachService = inject(BeachService);
  uploadStatus: string = '';
  beachesJson: Beach[] = beachesList;

  trackById(index: number, beach: Beach): string {
    return beach.id;
  }
  ngOnInit() {
    console.log('Number of beaches:', this.beaches.length);
  }
  /* async loadBeachesToFirebase(): Promise<void> {
    try {
      await this.beachService.createBeaches(this.beachesJson);
      this.uploadStatus = 'Beaches uploaded successfully!';
      console.log('Beaches uploaded successfully');
    } catch (error) {
      this.uploadStatus = 'Error uploading beaches';
      console.error('Error uploading beaches:', error);
    }
  } */
}
