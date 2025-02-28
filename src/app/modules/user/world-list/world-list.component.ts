import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { World } from '../../../shared/interfaces/world';
import { FormNewWorldComponent } from './components/form-new-world/form-new-world.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { WorldsService } from '../../../shared/services/worlds.service';

@Component({
  selector: 'app-world-list',
  imports: [SharedModule, FormNewWorldComponent, NavbarComponent],
  templateUrl: './world-list.component.html',
  styleUrl: './world-list.component.css'
})

export class WorldListComponent implements OnInit{
  worldsService = inject(WorldsService)
  worlds: World[] = []
  visibleNewWorld: boolean = false;

  ngOnInit(): void {
    this.worldsService.list().subscribe({
      next: (res: any)=>{
        this.worlds = res
      }
    })
  }


  openWorldDialog(){
    this.visibleNewWorld = true
  }
  
  closeWorldDialog(){
    this.visibleNewWorld = false
  }

  selectWorld(world: any){
    console.log(world)
  }
}
