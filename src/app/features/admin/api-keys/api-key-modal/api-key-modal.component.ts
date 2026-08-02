import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-api-key-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './api-key-modal.component.html',
  styleUrls: ['./api-key-modal.component.scss']
})
export class ApiKeyModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  private readonly fb = inject(FormBuilder);
  
  form: FormGroup;
  
  constructor() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      projectId: ['global', Validators.required],
      expiresAt: [null]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      // Si expiresAt está vacío, lo quitamos
      const data = { ...this.form.value };
      if (!data.expiresAt) {
        delete data.expiresAt;
      }
      this.save.emit(data);
    }
  }
}
