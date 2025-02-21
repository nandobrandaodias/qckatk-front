import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../shared/modules/shared.module';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";

@Component({
  selector: 'app-home',
  imports: [SharedModule, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  items: MenuItem[] | undefined;

  ngOnInit() {
      this.items = [
          {
              label: 'Início',
              icon: 'pi pi-home',
          },
          {
              label: 'Lista de Mundos',
              icon: 'pi pi-home',
          },
          {
              label: 'Perfil',
              icon: 'pi pi-home',
          },
      ];
  }
}
