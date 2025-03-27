import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { World } from '../../../shared/interfaces/world';
import { FormNewWorldComponent } from './components/form-new-world/form-new-world.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { WorldsService } from '../../../shared/services/worlds.service';
import { AccessWorldCodeComponent } from "./components/access-world-code/access-world-code.component";
import { ShowWorldComponent } from "./components/show-world/show-world.component";


enum DialogType {
  Form = 'form',
  Code = 'code',
  Show = 'show'
}
@Component({
  selector: 'app-world-list',
  imports: [SharedModule, FormNewWorldComponent, NavbarComponent, AccessWorldCodeComponent, ShowWorldComponent],
  templateUrl: './world-list.component.html',
  styleUrl: './world-list.component.css'
})

export class WorldListComponent implements OnInit{
  worldsService = inject(WorldsService)
  selected_world: any;
  worlds: World[] = [];
  loadingWorlds: boolean = false;
  visibleNewWorld: boolean = false;
  visibleAccessCode: boolean = false;
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
      case DialogType.Code:
        this.visibleAccessCode = true;
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
      case DialogType.Code:
        this.visibleAccessCode = false;
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
    this.worldsService.list().subscribe({
      next: (res: any)=>{
        this.worlds = res;
        this.loadingWorlds = false
      },
      error: (e) => {
        console.log('Erro!')
        this.loadingWorlds = false
      }
    })
  }
}
