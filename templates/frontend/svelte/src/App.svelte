<script lang="ts">
  let number: string = '';
  let result: number | null = null;
  let error: string | null = null;

  async function handleSubmit() {
    error = null;
    result = null;

    try {
      const response = await fetch('http://localhost:8000/api/multiply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ number: parseFloat(number) }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      result = data.result;
    } catch (err: unknown) {
      error = (err as Error).message;
    }
  }
</script>

<main style="padding: 2rem; font-family: sans-serif;">
  <h1>Multiplier App (Svelte)</h1>
  <form on:submit|preventDefault={handleSubmit} style="margin-bottom: 1rem;">
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
