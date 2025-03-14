import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { WorldsService } from '../../../../../shared/services/worlds.service';
import { LabelComponent } from '../../../../../shared/components/label/label.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form-new-world',
  imports: [SharedModule, LabelComponent],
  templateUrl: './form-new-world.component.html',
  styleUrl: './form-new-world.component.css',
})
export class FormNewWorldComponent {
  @Input() visible: boolean;
  @Output() refreshEvent = new EventEmitter<boolean>();
  @Output() closeEvent = new EventEmitter<boolean>();
  worldsService = inject(WorldsService);
  worldForm: FormGroup;
  hasPassword: boolean = false;

  ngOnInit(){
    this.startWorldForm()
  }

  startWorldForm() {
    this.worldForm = new FormGroup(
      {
        name: new FormControl('', [Validators.required]),
        description: new FormControl(''),
        system: new FormControl(''),
        password: new FormControl(''),
        public: new FormControl(true, [Validators.required]),
      }
    );
  }

  saveWorld() {
    if(!this.worldForm.valid) return
    this.worldsService
      .create(this.worldForm.value)
      .subscribe({
        next: () => {
          this.startWorldForm();
          this.closeEvent.emit();
          this.refreshEvent.emit();
        },
      });
  }

  togglePassword(){
    this.worldForm.get('password')?.setValue('')
  }

  close() {
    this.closeEvent.emit();
  }
}
