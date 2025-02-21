import { Component, EventEmitter, HostListener, Output, ViewChild } from '@angular/core';
import { SharedModule } from '../../../shared/modules/shared.module';
import { Popover } from 'primeng/popover';
import { LoginComponent } from "./components/login/login.component";

@Component({
  selector: 'app-main',
  imports: [SharedModule, LoginComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {
  @Output() onBlur = new EventEmitter<void>();
  @ViewChild('op') op!: Popover;
  showLogin: boolean = false;

  @HostListener('blur') // Escuta o evento de blur
  onBlurHandler() {
    this.onBlur.emit(); // Dispara o evento onBlur
  }

  toggleLogin() {
    this.showLogin = !this.showLogin
  }
}
