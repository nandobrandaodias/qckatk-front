import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { World } from '../../../shared/interfaces/world';
import { FormNewWorldComponent } from './components/form-new-world/form-new-world.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { WorldsService } from '../../../shared/services/worlds.service';
import { AccessWorldCodeComponent } from "./components/access-world-code/access-world-code.component";

@Component({
  selector: 'app-world-list',
  imports: [SharedModule, FormNewWorldComponent, NavbarComponent, AccessWorldCodeComponent],
  templateUrl: './world-list.component.html',
  styleUrl: './world-list.component.css'
})

export class WorldListComponent implements OnInit{
  worldsService = inject(WorldsService)
  worlds: World[] = []
  visibleNewWorld: boolean = false;
  visibleAccessCode: boolean = false;

  ngOnInit(): void {
    this.listWorld()
  }


  openWorldDialog(dialog: string){
    if(dialog == 'form') this.visibleNewWorld = true
    if(dialog == 'code') this.visibleAccessCode = true
  }
  
  closeWorldDialog(dialog: string){
    if(dialog == 'form') this.visibleNewWorld = false
    if(dialog == 'code') this.visibleAccessCode = false
  }

  listWorld(){
    this.worldsService.list().subscribe({
      next: (res: any)=>{
        this.worlds = res
      }
    })
  }

  selectWorld(world: any){
    console.log(world)
  }
}
