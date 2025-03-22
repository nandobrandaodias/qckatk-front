import { Routes } from '@angular/router';
import { MainComponent } from './modules/landing-page/main/main.component';
import { AuthGuard } from './shared/modules/auth/auth.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: '',
        canActivateChild: [AuthGuard],
        loadChildren: () => [
            {
                path: 'home',
                loadComponent: ()=>import('./modules/user/home/home.component').then((m) => m.HomeComponent),

            },        
            {
                path: 'list',
                loadComponent: ()=>import('./modules/user/world-list/world-list.component').then((m) => m.WorldListComponent)
            },
            {
                path: 'meu-perfil',
                loadComponent: ()=>import('./modules/user/profile/profile.component').then((m) => m.ProfileComponent)
            },
            {
                path: 'meus-mundos',
                loadComponent: ()=>import('./modules/user/my-worlds/my-worlds.component').then((m) => m.MyWorldsComponent)
            },
            {
                path: 'tabletop/:id',
                loadComponent: ()=>import('./modules/tabletop/tabletop/tabletop.component').then((m) => m.TabletopComponent)
            },
        ]
    },
    {
        path: 'signup',
        loadComponent: ()=>import('./modules/landing-page/register/register.component').then((m) => m.RegisterComponent)
    },
    {
        path: '**',
        redirectTo: '/'
    }
];
