import { Component, ViewChild } from '@angular/core';
import { SharedModule } from '../../modules/shared.module';

@Component({
  selector: 'app-navbar',
  imports: [SharedModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
}
