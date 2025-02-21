import { Component } from '@angular/core';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [SharedModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent{
  loginForm: FormGroup;

  startLoginForm(){
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    })
  }

  ngOnInit(){
    this.startLoginForm()
  }

  submitLogin(){
    console.log("Tentando acessar...")
    console.log(this.loginForm.value)
  }
}
