<script lang="ts">
  interface MultiplyResponse {
    result: number;
  }

  let number: string = $state('');
  let result: number | null = $state(null);
  let error: string | null = $state(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  async function handleSubmit(e: Event) {
    e.preventDefault();
    error = null;
    result = null;

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
      result = data.result;
    } catch (err: unknown) {
      error = (err as Error).message;
    }
  }
</script>

<main style="padding: 2rem; font-family: sans-serif;">
  <h1>Multiplier App (Svelte)</h1>
  <form onsubmit={handleSubmit} style="margin-bottom: 1rem;">
    <label for="numberInput" style="display: block; margin-bottom: 0.5rem;">
      Enter a number:
    </label>
    <input
      id="numberInput"
      type="number"
      step="any"
      bind:value={number}
      required
      style="padding: 0.5rem; margin-right: 0.5rem;"
    />
    <button type="submit" style="padding: 0.5rem 1rem;">
      Multiply by 2
    </button>
  </form>

  {#if result !== null}
    <div style="margin-top: 1rem; padding: 1rem; background-color: #e0ffe0; border: 1px solid #00cc00;">
      <strong>Result:</strong> {result}
    </div>
  {/if}

  {#if error}
    <div style="margin-top: 1rem; padding: 1rem; background-color: #ffe0e0; border: 1px solid #cc0000;">
      <strong>Error:</strong> {error}
    </div>
  {/if}
</main>
