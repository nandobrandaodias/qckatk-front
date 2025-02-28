import { Component, inject } from '@angular/core';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { SharedModule } from '../../../shared/modules/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../shared/services/users.service';
import { LabelComponent } from '../../../shared/components/label/label.component';
import { confirmPasswordValidator } from '../../../shared/utils/custom_validators/ConfirmPasswordValidator';

@Component({
  selector: 'app-register',
  imports: [NavbarComponent, SharedModule, LabelComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  usersService = inject(UsersService);
  signUpForm: FormGroup;

  startSignupForm() {
    this.signUpForm = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(5),
      ]),
      confirmpassword: new FormControl('', [Validators.required]),
    },
  {validators: confirmPasswordValidator});
  }

  ngOnInit() {
    this.startSignupForm();
  }

  submitSignup() {
    this.usersService.signUp(this.signUpForm.value);
  }
}
