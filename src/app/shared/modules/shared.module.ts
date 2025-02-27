import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './prime-ng.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { UsersService } from '../services/users.service';
import { WorldsService } from '../services/worlds.service';
import { MessageService } from 'primeng/api';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    PrimeNgModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule

  ],
  exports: [
    CommonModule,
    RouterModule,
    PrimeNgModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule
  ],
})
export class SharedModule { }

export function sharedProviders() {
  return [
    UsersService,
    WorldsService,
    MessageService
  ]
}
