import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommentWithBeachAndUser } from "../../services/comments.service";
import { User } from "firebase/auth";
import { Router } from "@angular/router";
import { AuthStateService } from "../../services/auth-state.service";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common"; // Importar CommonModule

@Component({
  selector: 'app-comment-item',
  templateUrl: './comment-item.component.html',
  styleUrls: ['./comment-item.component.scss'],
  imports: [
    CommonModule, // Añadir CommonModule aquí
    FormsModule
  ]
})
export class CommentItemComponent implements OnInit {
  @Input() comment!: CommentWithBeachAndUser;
  @Output() delete = new EventEmitter<string>();
  @Output() update = new EventEmitter<{
    id: string;
    text: string;
    rating: number;
  }>();

  currentUser: User | null = null;
  editing: boolean = false;
  editedText: string = '';
  editedRating: number = 0;
  hoveredStar: number = 0;

  constructor(
    private router: Router,
    private authStateService: AuthStateService
  ) {}

  ngOnInit() {
    this.authStateService.user$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  canEdit(): boolean {
    return this.currentUser?.uid === this.comment.user.id;
  }

  startEdit() {
    this.editing = true;
    this.editedText = this.comment.comment.text;
    this.editedRating = this.comment.comment.rating;
  }

  cancelEdit() {
    this.editing = false;
  }

  saveEdit() {
    this.update.emit({
      id: this.comment.comment.id,
      text: this.editedText,
      rating: this.editedRating,
    });
    this.editing = false;
  }

  deleteComment() {
    this.delete.emit(this.comment.comment.id);
  }
}
