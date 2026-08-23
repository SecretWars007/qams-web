import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'qams_theme';
  theme = signal<Theme>(this.getInitialTheme());
  isDark = signal<boolean>(false);

  constructor() {
    this.updateDarkMode();

    // Reaccionar cuando cambie el signal de tema
    effect(() => {
      const current = this.theme();
      localStorage.setItem(this.THEME_KEY, current);
      this.updateDarkMode();
    });

    // Escuchar cambios en preferencias del sistema
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.theme() === 'system') {
          this.updateDarkMode();
        }
      });
    }
  }

  setTheme(newTheme: Theme) {
    this.theme.set(newTheme);
  }

  toggleDark() {
    const next: Theme = this.isDark() ? 'light' : 'dark';
    this.setTheme(next);
  }

  private getInitialTheme(): Theme {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem(this.THEME_KEY) as Theme;
    return stored || 'light';
  }

  private updateDarkMode() {
    if (typeof document === 'undefined') return;
    const current = this.theme();
    let dark = false;

    if (current === 'dark') {
      dark = true;
    } else if (current === 'system') {
      dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    this.isDark.set(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
