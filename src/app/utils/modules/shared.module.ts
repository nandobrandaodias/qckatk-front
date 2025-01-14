import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PrimeNgModule } from './prime-ng.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    PrimeNgModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    PrimeNgModule
  ]
})
export class SharedModule { }
