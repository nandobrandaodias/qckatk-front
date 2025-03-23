import { Component, inject } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';
import { LoginComponent } from "../../../modules/landing-page/main/components/login/login.component";
import { AuthService } from '../../modules/auth/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-navbar',
  imports: [SharedModule, LoginComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  router = inject(Router)
  authService = inject(AuthService)
  user = this.authService.userToken()
  logo: any
  showLogin: boolean = false;
  items: any[] = [
    {
      label: this.user.username,
    },
    {separator: true},
    {
      label: 'Opções',
      items: [
          {
              label: 'Meu Perfil',
              icon: 'pi pi-user',
              command: () => {
                this.router.navigate(["/meu-perfil"]);
              }
          },
          {
              label: 'Meus Mundos',
              icon: 'pi pi-globe',
              command: () => {
                this.router.navigate(["/meus-mundos"]);
              }
          },
          {
              label: 'Sair',
              icon: 'pi pi-sign-out',
              command: () => {
                this.logout();
            }
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
