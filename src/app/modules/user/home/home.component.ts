import { Component, inject } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { Router } from '@angular/router';
import { NavbarComponent } from '@/app/shared/components/navbar/navbar.component';
import { UsersService } from '@/app/shared/services/users.service';
import { ShowWorldComponent } from "../world-list/components/show-world/show-world.component";
import { WorldsService } from '@/app/shared/services/worlds.service';

interface World {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  lastAccessed?: Date;
  userCount?: number;
  isOwner?: boolean;
}
@Component({
  selector: 'app-home',
  imports: [SharedModule, NavbarComponent, ShowWorldComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  router: Router = inject(Router);
  userService: UsersService = inject(UsersService);
  worldsService: WorldsService = inject(WorldsService);
  myWorlds: World[] = [];
  popularWorlds: World[] = [];
  user: any;
  loadingPopular: boolean = false
  loadingUserData: boolean = false
  selected_world: any = '';
  visibleShowCode: boolean = false
  defaultImage = 'not_found.svg'
  
  ngOnInit(): void {
    this.loadUserData()

    this.popularWorlds = [
      {
        id: 12,
        name: 'Mundo Nova Terra',
        description: 'O mundo mais popular da plataforma',
        imageUrl: 'assets/worlds/nova.jpg',
        userCount: 4768,
      },
      {
        id: 6,
        name: 'Mundo Epsilon',
        description: 'Reconhecido por seus desafios',
        imageUrl: 'assets/worlds/epsilon.jpg',
        userCount: 3241,
      },
      {
        id: 9,
        name: 'Mundo Atlantis',
        description: 'Explorações oceânicas',
        imageUrl: 'assets/worlds/atlantis.jpg',
        userCount: 2879,
      },
      {
        id: 2,
        name: 'Mundo Beta',
        description: 'Desafios tecnológicos',
        imageUrl: 'assets/worlds/beta.jpg',
        userCount: 2532,
      },
    ];
  }

  navigateToWorld(worldId: number): void {
    this.router.navigate(['/worlds', worldId]);
  }

  viewAllMyWorlds(): void {
    this.router.navigate(['/my-worlds']);
  }

  viewAllVisitedWorlds(): void {
    this.router.navigate(['/history']);
  }

  viewAllPopularWorlds(): void {
    this.router.navigate(['/popular-worlds']);
  }

  createNewWorld(): void {
    this.router.navigate(['/create-world']);
  }

  greetingUser() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    else if (hour >= 12 && hour < 18) return 'Boa tarde';
    else return 'Boa noite';
  }

  async loadUserData(){
    this.loadingUserData = true
    await this.userService.getUserInfo().subscribe({
      next: (res) => {
        this.loadingUserData = false
        this.user = res
        this.user.image = this.user.image ?? this.defaultImage
      },
      error: (e) => {
        this.loadingUserData = false
      }
    })
  }

  showWorld(code: any){
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
  }

  closeWorldDialog(modal: string){
    if(modal == 'show')this.visibleShowCode = false
  }
}
