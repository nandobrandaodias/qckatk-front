import { Component, inject, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { WorldCardComponent } from './components/world-card/world-card.component';
import { World } from '../../../shared/interfaces/world';
import { FormNewWorldComponent } from './components/form-new-world/form-new-world.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { UsersService } from '../../../shared/services/users.service';
import { WorldsService } from '../../../shared/services/worlds.service';

@Component({
  selector: 'app-world-list',
  imports: [SharedModule, WorldCardComponent, FormNewWorldComponent, NavbarComponent],
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
    console.log(this.worlds)
  }


  openWorldDialog(){
    this.visibleNewWorld = true
  }
  
  closeWorldDialog(){
    this.visibleNewWorld = false
  }
}
