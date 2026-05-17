'use client';

import { useState, FormEvent } from 'react';

interface MultiplyResponse {
  result: number;
}

export default function Home() {
  const [number, setNumber] = useState<string>('');
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`${apiUrl}/api/multiply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: parseFloat(number) }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data: MultiplyResponse = await response.json();
      setResult(data.result);
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  };

  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Multiplier App</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <label htmlFor="numberInput" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Enter a number:
        </label>
        <input
          id="numberInput"
          type="number"
          step="any"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          required
          style={{ padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Multiply by 2
        </button>
      </form>

      {result !== null && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#e0ffe0', border: '1px solid #00cc00' }}>
          <strong>Result:</strong> {result}
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#ffe0e0', border: '1px solid #cc0000' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </main>
  );
}
