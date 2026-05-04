import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main style="padding: 2rem; font-family: sans-serif;">
      <h1>Multiplier App (Angular)</h1>
      <form (submit)="handleSubmit($event)" style="margin-bottom: 1rem;">
        <label for="numberInput" style="display: block; margin-bottom: 0.5rem;">
          Enter a number:
        </label>
        <input
          id="numberInput"
          type="number"
          step="any"
          [(ngModel)]="number"
          name="number"
          required
          style="padding: 0.5rem; margin-right: 0.5rem;"
        />
        <button type="submit" style="padding: 0.5rem 1rem;">
          Multiply by 2
        </button>
      </form>

      <div *ngIf="result !== null" style="margin-top: 1rem; padding: 1rem; background-color: #e0ffe0; border: 1px solid #00cc00;">
        <strong>Result:</strong> {{ result }}
      </div>

      <div *ngIf="error" style="margin-top: 1rem; padding: 1rem; background-color: #ffe0e0; border: 1px solid #cc0000;">
        <strong>Error:</strong> {{ error }}
      </div>
    </main>
  `,
})
export class AppComponent {
  number: string = '';
  result: number | null = null;
  error: string | null = null;

  async handleSubmit(event: Event) {
    event.preventDefault();
    this.error = null;
    this.result = null;

    try {
      const response = await fetch('http://localhost:8000/api/multiply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: parseFloat(this.number) }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      this.result = data.result;
    } catch (err: any) {
      this.error = err.message;
    }
  }
}
