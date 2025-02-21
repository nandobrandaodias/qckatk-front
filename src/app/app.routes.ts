import { Routes } from '@angular/router';
import { MainComponent } from './modules/landing-page/main/main.component';
import { HomeComponent } from './modules/user/home/home.component';
import { TabletopComponent } from './modules/tabletop/tabletop/tabletop.component';
import { WorldListComponent } from './modules/user/world-list/world-list.component';
import { RegisterComponent } from './modules/landing-page/register/register.component';

export const routes: Routes = [
    {
        path: '',
        component: MainComponent
    },
    {
        path: 'home',
        component: HomeComponent
    },
    {
        path: 'signup',
        component: RegisterComponent
    },
    {
        path: 'list',
        component: WorldListComponent
    },
    {
        path: 'tabletop/:id',
        component: TabletopComponent
    }
];
