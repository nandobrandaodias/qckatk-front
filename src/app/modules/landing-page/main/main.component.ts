import { Component } from '@angular/core';
import { SharedModule } from '../../../utils/modules/shared.module';

@Component({
  selector: 'app-main',
  imports: [SharedModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {

}
