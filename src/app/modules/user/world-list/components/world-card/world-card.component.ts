import { Component, Input } from '@angular/core';
import { World } from '../../../../../shared/interfaces/world';
import { SharedModule } from '../../../../../shared/modules/shared.module';

@Component({
  selector: 'app-world-card',
  imports: [SharedModule],
  templateUrl: './world-card.component.html',
  styleUrl: './world-card.component.css'
})
export class WorldCardComponent {
  @Input() world: World
}
