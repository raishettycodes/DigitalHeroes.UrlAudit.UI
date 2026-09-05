import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWebsiteDialogComponent } from './edit-website-dialog.component';

describe('EditWebsiteDialogComponent', () => {
  let component: EditWebsiteDialogComponent;
  let fixture: ComponentFixture<EditWebsiteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditWebsiteDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditWebsiteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
