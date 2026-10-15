import { Injectable, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LoginResult, SessionUser } from './models';

const SESSION_KEY = 'electomap.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  readonly user = signal<SessionUser | null>(null);

  constructor() {
    afterNextRender(() => this.user.set(this.readSession()?.user ?? null));
  }

  get token(): string | null {
    return this.readSession()?.token ?? null;
  }

  saveSession(session: LoginResult): void {
    if (!isPlatformBrowser(this.platformId)) return;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.user.set(session.user);
  }

  clearSession(): void {
    if (isPlatformBrowser(this.platformId)) sessionStorage.removeItem(SESSION_KEY);
    this.user.set(null);
  }

  private readSession(): LoginResult | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const value = sessionStorage.getItem(SESSION_KEY);
    if (!value) return null;
    try {
      const session = JSON.parse(value) as LoginResult;
      return session.token && session.user ? session : null;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }
}
