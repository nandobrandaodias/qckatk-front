import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { WorldCardComponent } from './components/world-card/world-card.component';
import { World } from '../../../shared/interfaces/world';
import { FormNewWorldComponent } from './components/form-new-world/form-new-world.component';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-world-list',
  imports: [SharedModule, WorldCardComponent, FormNewWorldComponent, NavbarComponent],
  templateUrl: './world-list.component.html',
  styleUrl: './world-list.component.css'
})

export class WorldListComponent implements OnInit{
  worlds: World[] = []
  visibleNewWorld: boolean = false;

  ngOnInit(): void {
    for(let i = 0; i < 10; i++){
      let x: World = {
        id: String(i),
        name: `Teste ${i}`,
        banner: '',
        description: '',
        owner: {}
      } 
      this.worlds.push(x)
    }
    console.log(this.worlds)
  }


  openWorldDialog(){
    this.visibleNewWorld = true
  }
  
  closeWorldDialog(){
    this.visibleNewWorld = false
  }
}
