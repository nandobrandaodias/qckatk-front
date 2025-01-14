import { Routes } from '@angular/router';
import { MainComponent } from './modules/landing-page/main/main.component';
import { HomeComponent } from './modules/user/home/home.component';
import { TabletopComponent } from './modules/tabletop/tabletop/tabletop.component';

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
        path: 'tabletop/:id',
        component: TabletopComponent
    }
];
