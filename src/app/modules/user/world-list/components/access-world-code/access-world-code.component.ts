import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SharedModule } from '../../../../../shared/modules/shared.module';
import { WorldsService } from '../../../../../shared/services/worlds.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LabelComponent } from "../../../../../shared/components/label/label.component";
import { Router } from '@angular/router';

@Component({
  selector: 'app-access-world-code',
  imports: [SharedModule, LabelComponent],
  templateUrl: './access-world-code.component.html',
  styleUrl: './access-world-code.component.css',
})
export class AccessWorldCodeComponent {
  @Input() visible: boolean;
  @Output() refreshEvent = new EventEmitter<boolean>();
  @Output() closeEvent = new EventEmitter<boolean>();
  worldsService = inject(WorldsService);
  router = inject(Router);
  loadingWorld: boolean = false
  worldForm: FormGroup;
  world: any = ''
  notFound: boolean = false
  password: string = ''

  ngOnInit(){
    this.startWorldForm()
  }

  startWorldForm() {
    this.worldForm = new FormGroup({code: new FormControl('', [Validators.required])});
  }

  searchWorld(){
    if(this.worldForm.value.code.length != 6){
      this.world = ''
      return
    }
    this.loadingWorld = true
    this.notFound = false
    
    this.worldsService.findByCode(this.worldForm.value.code).subscribe({
      next: (res: any)=> {
        this.world = res || null;
        this.notFound = !res;
        this.loadingWorld = false;
      },
      error: () => {
        this.loadingWorld = false
        console.log("Um erro ocorreu!")
      }
    })

  }

  async enterWorld() {
    await this.worldsService.join(this.world._id, {password: this.password}).subscribe({
      next: (res)=> {
        if(!res) return
        this.router.navigate(['tabletop/', this.world._id])
       },
      error: (e)=> {
        console.log(e)
      }
      });
  }

  close() {
    this.closeEvent.emit();
  }
}
