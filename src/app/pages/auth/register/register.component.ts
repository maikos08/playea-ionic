import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormControl, NonNullableFormBuilder } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { togglePasswordView } from '../../../utils/toggle-password-view';
import { isRequired, hasEmailError, hasPasswordLengthError, hasPasswordMatchError } from '../../../utils/validators';
import { AuthService } from '../../../services/auth.service';
import { IonContent, IonInput, IonButton, IonCheckbox } from '@ionic/angular/standalone';
import { ToastController } from '@ionic/angular';

interface RegisterForm {
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  terms: FormControl<boolean>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonContent,
    IonInput,
    IonButton,
    IonCheckbox
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  passwordVisible = false;
  confirmPasswordVisible = false;
  isLoading = false;

  private _formBuilder = inject(NonNullableFormBuilder);
  private _router = inject(Router);
  private _authService = inject(AuthService);
  private _toastCtrl = inject(ToastController);

  registerForm = this._formBuilder.group<RegisterForm>({
    firstName: this._formBuilder.control('', [Validators.required]),
    lastName: this._formBuilder.control('', [Validators.required]),
    email: this._formBuilder.control('', [Validators.required, Validators.email]),
    password: this._formBuilder.control('', [Validators.required, Validators.minLength(8)]),
    confirmPassword: this._formBuilder.control('', [Validators.required]),
    terms: this._formBuilder.control(false, [Validators.requiredTrue]),
  });

  isRequired(field: keyof RegisterForm) {
    return isRequired(field, this.registerForm);
  }

  hasEmailError() {
    return hasEmailError(this.registerForm);
  }

  hasPasswordLengthError() {
    return hasPasswordLengthError(this.registerForm);
  }

  hasPasswordMatchError() {
    return hasPasswordMatchError(this.registerForm);
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
    togglePasswordView('register-password-text', 'register-toggle-icon');
  }

  toggleConfirmationPassword(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    togglePasswordView('register-password-confirmation-text', 'confirmation-toggle-icon');
  }

  async onSubmit() {
    if (this.registerForm.invalid || this.hasPasswordMatchError()) {
      this.registerForm.markAllAsTouched();
      await this.showToast('Por favor completa correctamente el formulario', 'danger');
      return;
    }

    this.isLoading = true;
    try {
      const { firstName, lastName, email, password } = this.registerForm.value;
      await this._authService.register({
        firstName: firstName!,
        lastName: lastName!,
        email: email!,
        password: password!
      });
      await this.showToast('Registro exitoso', 'success');
      this._router.navigate(['/']);
    } catch (error: any) {
      console.error('Error en el registro:', error);
      await this.showToast('Error al registrarse. Intenta nuevamente.', 'danger');
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
