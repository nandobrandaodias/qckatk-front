import { Component } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { SharedModule } from '../../../shared/modules/shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  imports: [NavbarComponent, SharedModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
    signUpForm: FormGroup;
  
    startSignupForm(){
      this.signUpForm = new FormGroup({
        username: new FormControl('', [Validators.required, Validators.minLength(5)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required, Validators.minLength(5)]),
        confirmpassword: new FormControl('', [Validators.required]),
      })
    }
  
    ngOnInit(){
      this.startSignupForm()
    }
  
    submitSignup(){
      console.log("Tentando acessar...")
      console.log(this.signUpForm.value)
    }
}
