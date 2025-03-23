import { SharedModule } from '@/app/shared/modules/shared.module';
import { WorldsService } from '@/app/shared/services/worlds.service';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LabelComponent } from "../../../../../shared/components/label/label.component";

@Component({
  selector: 'app-show-world',
  imports: [SharedModule, LabelComponent],
  templateUrl: './show-world.component.html',
  styleUrl: './show-world.component.css'
})
export class ShowWorldComponent {
    @Input() world: any;
    @Input() visible: boolean;
    @Output() refreshEvent = new EventEmitter<boolean>();
    @Output() closeEvent = new EventEmitter<boolean>();
    worldsService = inject(WorldsService);
    router = inject(Router);
    notFound: boolean = false
    password: string = ''

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
