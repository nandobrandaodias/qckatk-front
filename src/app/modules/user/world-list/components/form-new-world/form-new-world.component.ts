import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../../shared/modules/shared.module';

@Component({
  selector: 'app-form-new-world',
  imports: [SharedModule],
  templateUrl: './form-new-world.component.html',
  styleUrl: './form-new-world.component.css'
})
export class FormNewWorldComponent {
  @Input() visible: boolean;
  @Output() closeEvent = new EventEmitter<boolean>();

  close(){
    this.closeEvent.emit()
  }
}
