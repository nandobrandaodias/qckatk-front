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
  items: any[] = [
    {
      label: 'Opções',
      items: [
          {
              label: 'Meu Perfil',
              icon: 'pi pi-user'
          },
          {
              label: 'Meus Mundos',
              icon: 'pi pi-globe'
          },
          {
              label: 'Sair',
              icon: 'pi pi-sign-out'
          }
      ]
  }
  ]

  ngOnInit(){
  }

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
