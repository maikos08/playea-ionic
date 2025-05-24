import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { IonicModule, NavController, ToastController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { BeachDetailLayoutComponent } from '../../components/beach-detail-layout/beach-detail-layout.component';
import { Beach } from '../../models/beach';
import { BeachService } from '../../services/beach.service';

@Component({
  selector: 'app-beach-detail',
  standalone: true,
  imports: [CommonModule, IonicModule, BeachDetailLayoutComponent, RouterModule],
  templateUrl: './beach-detail.component.html',
  styleUrls: ['./beach-detail.component.scss'],
})
export class BeachDetailComponent implements OnInit {
  beach: Beach | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private beachService: BeachService,
    private toastCtrl: ToastController
  ) {}

  ngOnInit(): void {
    console.log('Initializing BeachDetailComponent...');
    this.loading = true;

    const slug = this.route.snapshot.paramMap.get('slug');
    console.log('Received slug:', slug);
    if (slug) {
      this.beachService.getAllBeaches().subscribe({
        next: (beaches) => {
          console.log('Fetched beaches:', beaches.map((b) => b.name));
          this.beach = beaches.find(
            (beach) =>
              beach.name.replace(/ /g, '-').toLowerCase() === slug.toLowerCase()
          ) || null;
          console.log('Found beach:', this.beach);
          this.loading = false;
          if (!this.beach) {
            this.showErrorToast('Playa no encontrada');
            this.navCtrl.navigateBack('/beaches');
          }
        },
        error: (error) => {
          console.error('Error fetching beaches:', error);
          this.loading = false;
          this.showErrorToast('Error al cargar los datos de la playa');
          this.navCtrl.navigateBack('/beaches');
        },
        complete: () => {
          console.log('Subscription completed');
        }
      });
    } else {
      this.loading = false;
      console.error('No slug provided in route');
      this.showErrorToast('Ruta inválida');
      this.navCtrl.navigateBack('/beaches');
    }
  }

  private async showErrorToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  }
}