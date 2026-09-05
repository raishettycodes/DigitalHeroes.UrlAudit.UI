import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';
import { LayoutService } from '../../core/services/layout.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    SidebarComponent,
    NavbarComponent
  ],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {

  sidebarOpen = true;

  private toggleSubscription?: Subscription;

  constructor(
    private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    this.toggleSubscription =
      this.layoutService.toggleSidebar$.subscribe(() => {
        this.sidebarOpen = !this.sidebarOpen;
      });
  }

  ngOnDestroy(): void {
    this.toggleSubscription?.unsubscribe();
  }
}

