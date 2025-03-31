import { Component, inject } from '@angular/core';
import { NavbarComponent } from "../../../shared/components/navbar/navbar.component";
import { SharedModule } from '@/app/shared/modules/shared.module';
import { FormNewWorldComponent } from "../world-list/components/form-new-world/form-new-world.component";
import { ShowWorldComponent } from "../world-list/components/show-world/show-world.component";
import { WorldsService } from '@/app/shared/services/worlds.service';
import { World } from '@/app/shared/interfaces/world';

enum DialogType {
  Form = 'form',
  Show = 'show'
}

@Component({
  selector: 'app-my-worlds',
  imports: [NavbarComponent, SharedModule, FormNewWorldComponent, ShowWorldComponent],
  templateUrl: './my-worlds.component.html',
  styleUrl: './my-worlds.component.css'
})
export class MyWorldsComponent {
  worldsService = inject(WorldsService)
  selected_world: any;
  worlds: World[] = []
  loadingWorlds: boolean = false;
  visibleNewWorld: boolean = false;
  visibleShowCode: boolean = false;

  ngOnInit(): void {
    this.listWorld()
  }

  openWorldDialog(dialog: string, code?: string) {
    this.selected_world = '';
  
    switch (dialog) {
      case DialogType.Form:
        this.visibleNewWorld = true;
        break;
      case DialogType.Show:
        if (code) {
          this.worldsService.findByCode(code).subscribe({
            next: (res) => {
              this.selected_world = res;
              this.visibleShowCode = true;
            },
            error: ()=> {
              console.log("Mundo não encontrado...")
            }
          });
        }
        break;
      default:
        console.warn(`Dialogo desconhecido: ${dialog}`);
        break;
    }
  }
  
  closeWorldDialog(dialog: string) {
    switch (dialog) {
      case DialogType.Form:
        this.visibleNewWorld = false;
        break;
      case DialogType.Show:
        this.visibleShowCode = false;
        break;
      default:
        console.warn(`Dialogo desconhecido: ${dialog}`);
        break;
    }
  }
  listWorld(){
    this.loadingWorlds = true
    this.worldsService.listMine().subscribe({
      next: (res: any)=>{
        this.worlds = res
        this.loadingWorlds = false
      },
      error: (e)=> {
        console.log(e)
        this.loadingWorlds = false
      }
    })
  }
}
