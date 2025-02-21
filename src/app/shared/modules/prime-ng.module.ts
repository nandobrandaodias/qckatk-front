import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Menubar } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { Ripple } from 'primeng/ripple';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { PopoverModule } from 'primeng/popover';
import { PasswordModule } from 'primeng/password';



@NgModule({
  declarations: [],
  imports: [
    ButtonModule,
    Menubar, 
    BadgeModule, 
    AvatarModule, 
    InputTextModule, 
    Ripple,
    DataViewModule,
    DialogModule,
    PopoverModule,
    PasswordModule
  ],
  exports: [
    ButtonModule,
    Menubar, 
    BadgeModule, 
    AvatarModule, 
    InputTextModule, 
    Ripple,
    DataViewModule,
    DialogModule,
    PopoverModule,
    PasswordModule
  ]
})
export class PrimeNgModule { }
