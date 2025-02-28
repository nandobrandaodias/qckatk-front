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
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { MenuModule } from 'primeng/menu';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip'


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
    PasswordModule,
    ToggleButtonModule,
    ToastModule,
    MenuModule,
    TableModule,
    ChipModule
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
    PasswordModule,
    ToggleButtonModule,
    ToastModule,
    MenuModule,
    TableModule,
    ChipModule
  ]
})
export class PrimeNgModule { }
