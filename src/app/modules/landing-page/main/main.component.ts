import { Component } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
@Component({
  selector: 'app-main',
  imports: [SharedModule, NavbarComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
}
