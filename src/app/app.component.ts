import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingOverlayComponent } from './features/shared/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingOverlayComponent],
  template: `
    <router-outlet></router-outlet>
    <app-loading-overlay></app-loading-overlay>
  `,
})
export class AppComponent {
  constructor() {
    console.log('AppComponent: Application initialized');
  }
}
