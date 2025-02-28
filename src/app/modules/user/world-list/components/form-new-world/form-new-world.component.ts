import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { WorldsService } from '../../../../../shared/services/worlds.service';
import { LabelComponent } from "../../../../../shared/components/label/label.component";

@Component({
  selector: 'app-form-new-world',
  imports: [SharedModule, LabelComponent],
  templateUrl: './form-new-world.component.html',
  styleUrl: './form-new-world.component.css'
})
export class FormNewWorldComponent {
  @Input() visible: boolean;
  @Output() closeEvent = new EventEmitter<boolean>();
  worldsService = inject(WorldsService);
  name: string;
  description: string;
  public: boolean = true;

  saveWorld(){
    if(!this.name) return
    this.worldsService.create({
      name: this.name,
      description: this.description,
      public: this.public
    }).subscribe({
      next: ()=>{
        this.closeEvent.emit()
      }
    })
  }

  close(){
    this.closeEvent.emit()
  }
}
