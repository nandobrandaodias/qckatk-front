import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { SharedModule } from '../../../utils/modules/shared.module';

@Component({
  selector: 'app-home',
  imports: [SharedModule],
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
