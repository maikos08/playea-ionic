import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormControl, NonNullableFormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { togglePasswordView } from '../../../utils/toggle-password-view';
import { hasEmailError, isRequired, hasPasswordLengthError } from '../../../utils/validators';
import { AuthService } from '../../../services/auth.service';
import { IonContent, IonInput, IonButton } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

interface LoginForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  passwordVisible = false;
  isLoading = false;

  private _formBuilder = inject(NonNullableFormBuilder);
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _toastCtrl = inject(ToastController);

  loginForm = this._formBuilder.group<LoginForm>({
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required, Validators.minLength(6)]),
  });

  isRequired(field: keyof LoginForm) {
    return isRequired(field, this.loginForm);
  }

  hasEmailError() {
    return hasEmailError(this.loginForm);
  }

  hasPasswordLengthError() {
    return hasPasswordLengthError(this.loginForm);
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
    togglePasswordView('login-password-text', 'login-toggle-icon');
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      await this.showToast('Completa correctamente el formulario', 'danger');
      return;
    }

    this.isLoading = true;
    try {
      const { email, password } = this.loginForm.value;
      await this._authService.login(email!, password!);
      await this.showToast('Inicio de sesión exitoso', 'success');
      this._router.navigate(['/']);
    } catch (error: any) {
      console.error('Error en login:', error);
      await this.showToast('Credenciales incorrectas o error del servidor', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  private async showToast(message: string, color: 'success' | 'danger' = 'success') {
    const toast = await this._toastCtrl.create({
      message,
      duration: 2000,
      color,
      position: 'bottom',
    });
    await toast.present();
  }
}
