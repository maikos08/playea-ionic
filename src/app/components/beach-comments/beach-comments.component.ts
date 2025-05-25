import { Component, EventEmitter, inject, OnInit, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommentItemComponent } from '../comment-item/comment-item.component';
import { CommentWithBeachAndUser } from '../../services/comments.service';
import { User } from 'firebase/auth';
import { Beach } from '../../models/beach';
import { AuthStateService } from '../../services/auth-state.service';

type FirebaseUser = import('@angular/fire/auth').User;

@Component({
  selector: 'app-beach-comments',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    CommentItemComponent,
  ],
  templateUrl: './beach-comments.component.html',
  styleUrls: ['./beach-comments.component.scss'],
})
export class BeachCommentsComponent implements OnInit {
  @Input() comments: CommentWithBeachAndUser[] = [];
  @Input() currentUser: User | null = null;
  @Input() beach: Beach | null = null;
  @Output() addComment = new EventEmitter<{ text: string; rating: number }>();
  @Output() updateComment = new EventEmitter<{
    id: string;
    text: string;
    rating: number;
  }>();
  @Output() deleteComment = new EventEmitter<string>();

  authStateService = inject(AuthStateService);
  router = inject(Router);
  user: FirebaseUser | null = null;

  newCommentText: string = '';
  newCommentRating: number = 0;

  ngOnInit() {
    this.authStateService.user$.subscribe((user) => {
      this.user = user;
    });
    console.log(this.user);
    console.log('Comments received playa:', this.comments);
  }

  setRating(star: number) {
    console.log('Star clicked:', star); // Debug log
    this.newCommentRating = star;
    console.log('newCommentRating updated to:', this.newCommentRating); // Debug log
  }

  onAddComment() {
    console.log('Add comment');
    if (!this.user) {
      this.router.navigate(['/auth/login']);
      return;
    }
    if (
      !this.newCommentText.trim() ||
      this.newCommentRating < 1 ||
      this.newCommentRating > 5
    ) {
      return;
    }
    this.addComment.emit({
      text: this.newCommentText,
      rating: this.newCommentRating,
    });
    console.log(this.newCommentText);
    this.newCommentText = '';
    this.newCommentRating = 0;
  }
}
