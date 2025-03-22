import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedModule, sharedProviders } from './shared/modules/shared.module';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SharedModule],
  providers: [...sharedProviders(),
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'qckatk-front';
}
