import { Component, Input } from '@angular/core';
import { World } from '../../../../../utils/interfaces/world';
import { SharedModule } from '../../../../../utils/modules/shared.module';

@Component({
  selector: 'app-world-card',
  imports: [SharedModule],
  templateUrl: './world-card.component.html',
  styleUrl: './world-card.component.css'
})
export class WorldCardComponent {
  @Input() world: World
}
