import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteHistoryDialogComponent } from './website-history-dialog.component';

describe('WebsiteHistoryDialogComponent', () => {
  let component: WebsiteHistoryDialogComponent;
  let fixture: ComponentFixture<WebsiteHistoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteHistoryDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WebsiteHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
