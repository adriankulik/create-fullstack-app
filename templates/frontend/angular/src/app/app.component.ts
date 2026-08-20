import { Component, ChangeDetectorRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface MultiplyResponse {
  result: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app.component.html',
})
export class AppComponent {
  number = '';
  result: number | null = null;
  error: string | null = null;

  // Configure via environment: defaults to localhost for development
  private apiUrl = 'http://localhost:8000';

  private cdr = inject(ChangeDetectorRef);

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.error = null;
    this.result = null;

    try {
      const response = await fetch(`${this.apiUrl}/api/multiply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: parseFloat(this.number) }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: MultiplyResponse = await response.json();
      this.result = data.result;
    } catch (err: unknown) {
      this.error = (err as Error).message;
    }

    this.cdr.detectChanges();
  }
}
