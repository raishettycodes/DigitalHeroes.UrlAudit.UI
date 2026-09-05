import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditResultComponent } from './audit-result.component';

describe('AuditResultComponent', () => {
  let component: AuditResultComponent;
  let fixture: ComponentFixture<AuditResultComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditResultComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AuditResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
