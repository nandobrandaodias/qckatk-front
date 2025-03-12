import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { WorldsService } from '../../../../../shared/services/worlds.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-access-world-code',
  imports: [SharedModule],
  templateUrl: './access-world-code.component.html',
  styleUrl: './access-world-code.component.css',
})
export class AccessWorldCodeComponent {
  @Input() visible: boolean;
  @Output() refreshEvent = new EventEmitter<boolean>();
  @Output() closeEvent = new EventEmitter<boolean>();
  worldsService = inject(WorldsService);
  worldForm: FormGroup;
  world: any = {}
  notFound: boolean = false

  ngOnInit(){
    this.startWorldForm()
  }

  startWorldForm() {
    this.worldForm = new FormGroup({code: new FormControl('', [Validators.required])});
  }

  searchWorld(){
    if(this.worldForm.value.code.length != 6){
      this.world = {}
      return
    }

    this.notFound = false

    this.worldsService.findByCode(this.worldForm.value.code).subscribe({
      next: (res: any)=> {
        if(!res){
          this.notFound = true;
          return
        }
        this.world = res;
        this.notFound = false
      },
      error: () => {
        console.log("Um erro ocorreu!")
      }
    })

  }

  enterWorld() {
    if(!this.worldForm.valid) return
    this.worldsService.join(this.worldForm.value.code, {}).subscribe({})
  }

  close() {
    this.closeEvent.emit();
  }
}
