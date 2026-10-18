import { Injectable, signal } from '@angular/core';
import { Observable, defer, finalize } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private pending = 0;
  readonly isLoading = signal(false);

  begin(): void {
    this.pending += 1;
    this.isLoading.set(true);
  }

  end(): void {
    this.pending = Math.max(0, this.pending - 1);
    this.isLoading.set(this.pending > 0);
  }

  track<T>(source: Observable<T>): Observable<T> {
    return defer(() => {
      this.begin();
      return source.pipe(finalize(() => this.end()));
    });
  }
}
