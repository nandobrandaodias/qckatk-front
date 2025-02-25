import { Component } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { LoginComponent } from "../../../modules/landing-page/main/components/login/login.component";

@Component({
  selector: 'app-navbar',
  imports: [SharedModule, LoginComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  showLogin: boolean = false;

  toggleLogin() {
    this.showLogin = !this.showLogin
  }
}
