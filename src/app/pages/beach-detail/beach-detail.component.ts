import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';
import { BeachCommentsComponent } from '../../components/beach-comments/beach-comments.component';
import { BeachDetailLayoutComponent } from '../../components/beach-detail-layout/beach-detail-layout.component';
import { Beach } from '../../models/beach';
import { AuthStateService } from '../../services/auth-state.service';
import { BeachService } from '../../services/beach.service';
import {
  CommentService,
  CommentWithBeachAndUser,
} from '../../services/comments.service';
import {IonicModule} from "@ionic/angular";
import {HeaderAlignmentComponent} from "../../components/header-alignment/header-alignment.component";

@Component({
  selector: 'app-beach-detail',
  standalone: true,
  imports: [
    CommonModule,
    BeachDetailLayoutComponent,
    BeachCommentsComponent,
    IonicModule,
    HeaderAlignmentComponent,
  ],
  templateUrl: './beach-detail.component.html',
  styleUrls: ['./beach-detail.component.scss'],
})
export class BeachDetailComponent implements OnInit {
  beach: Beach | null = null;
  comments: CommentWithBeachAndUser[] = [];
  currentUser: User | null = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private beachService: BeachService,
    private commentService: CommentService,
    private authStateService: AuthStateService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.authStateService.user$.subscribe((user) => {
      this.currentUser = user;
    });

    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.beachService.getAllBeaches().subscribe({
        next: (beaches) => {
          this.beach =
            beaches.find(
              (beach) =>
                beach.name.replace(/ /g, '-').toLowerCase() ===
                slug.toLowerCase()
            ) || null;
          this.loading = false;
          if (this.beach) {
            this.loadComments();
            console.log(this.comments);
          } else {
            this.router.navigate(['/beaches']);
          }
        },
        error: (error) => {
          console.error('Error fetching beaches:', error);
          this.router.navigate(['/beaches']);
          this.loading = false;
        },
      });
    }
  }

  loadComments(): void {
    if (!this.beach) return;
    this.commentService.getCommentsByBeachId(this.beach.id).subscribe({
      next: (comments) => {
        console.log('Fetched comments:', comments); // Debug log
        this.comments = [...comments]; // Ensure new array reference
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.comments = [];
      },
    });
  }

  async addComment(event: { text: string; rating: number }): Promise<void> {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    if (!this.beach) {
      console.error('No beach selected');
      return;
    }
    try {
      await this.commentService.createComment({
        text: event.text,
        rating: event.rating,
        userId: this.currentUser.uid,
        beachId: this.beach.id,
      });
      console.log('Comment created, reloading comments...'); // Debug log
      this.loadComments();
    } catch (error: any) {
      console.error('Error adding comment:', error);
      // Show error in UI (e.g., toast)
    }
  }

  onDeleteComment(commentId: string) {
    this.commentService
      .deleteComment(commentId)
      .then(() => {
        this.loadComments();
      })
      .catch((err) => console.error('Delete failed', err));
  }

  onUpdateComment(update: { id: string; text: string; rating: number }) {
    this.commentService
      .updateComment(update.id, {
        text: update.text,
        rating: update.rating,
      })
      .then(() => {
        this.loadComments();
      })
      .catch((err) => console.error('Update failed', err));
  }
}
