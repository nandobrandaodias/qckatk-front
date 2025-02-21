import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import { PrimaryTheme } from './shared/utils/primary.theme';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: PrimaryTheme,
        options: {
          prefix: 'qa',
          darkModeSelector: '.app-dark-mode',
          cssLayer: {
              name: 'primeng',
              order: 'tailwind-base, primeng, tailwind-utilities'
          }
      }
      },
    }),
  ],
};