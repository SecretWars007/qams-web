import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('Main.ts: Bootstrapping application...');
bootstrapApplication(AppComponent, appConfig)
  .then(() => console.log('Main.ts: Application bootstrapped successfully'))
  .catch((err) => {
    console.error('Main.ts: Bootstrap error:', err);
  });
