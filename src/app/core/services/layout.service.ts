import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {

  private readonly toggleSidebarSource = new Subject<void>();

  readonly toggleSidebar$: Observable<void> =
    this.toggleSidebarSource.asObservable();

  toggleSidebar(): void {
    this.toggleSidebarSource.next();
  }
}