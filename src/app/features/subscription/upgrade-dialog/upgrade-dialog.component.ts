import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-upgrade-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule
  ],
  templateUrl: './upgrade-dialog.component.html',
  styleUrl: './upgrade-dialog.component.css'
})
export class UpgradeDialogComponent {

  constructor(
    private dialogRef: MatDialogRef<UpgradeDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      message: string;
    }
  ) {}

  viewPlans(): void {
    this.dialogRef.close('view-plans');
  }

  cancel(): void {
    this.dialogRef.close();
  }
}