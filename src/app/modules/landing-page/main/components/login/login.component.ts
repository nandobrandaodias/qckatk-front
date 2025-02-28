import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../../shared/modules/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{
  authService = inject(AuthService)
  loginForm: FormGroup;

  startLoginForm(){
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(5)]),
      password: new FormControl('', [Validators.required, Validators.minLength(5)])
  })
    console.log(this.loginForm)
  }

  ngOnInit(){
    this.startLoginForm()
  }

  submitLogin(){
    if(this.loginForm.valid) this.authService.login(this.loginForm.value)
  }
}
