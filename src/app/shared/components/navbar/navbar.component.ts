import { Component, inject } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { LoginComponent } from "../../../modules/landing-page/main/components/login/login.component";
import { AuthService } from '../../modules/auth/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [SharedModule, LoginComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService)
  showLogin: boolean = false;

  get getUserToken(){
    return this.authService.isAuthenticatedUser() 
  }

  toggleLogin() {
    this.showLogin = !this.showLogin
  }

  logout(){
    this.authService.logout()
  }
}
