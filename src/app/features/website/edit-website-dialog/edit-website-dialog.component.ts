import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule
} from '@angular/material/dialog';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { Website } from '../../../core/models/website.model';

@Component({
  selector: 'app-edit-website-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  templateUrl: './edit-website-dialog.component.html',
  styleUrls: ['./edit-website-dialog.component.css']
})
export class EditWebsiteDialogComponent {

  website: Website;

  constructor(
    private dialogRef: MatDialogRef<EditWebsiteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: Website
  ) {
    this.website = {
      ...data
    };
  }

  save(): void {

    if (!this.website.name.trim()) {
      alert('Website name is required.');
      return;
    }

    if (!this.website.url.trim()) {
      alert('Website URL is required.');
      return;
    }

    this.dialogRef.close(this.website);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}