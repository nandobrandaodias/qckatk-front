import { SharedModule } from '@/app/shared/modules/shared.module';
import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  imports: [SharedModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

}
