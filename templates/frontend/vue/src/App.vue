<script setup lang="ts">
import { ref } from 'vue'

interface MultiplyResponse {
  result: number
}

const number = ref<string>('')
const result = ref<number | null>(null)
const error = ref<string | null>(null)

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const handleSubmit = async () => {
  error.value = null
  result.value = null

  try {
    const response = await fetch(`${apiUrl}/api/multiply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ number: parseFloat(number.value) }),
    })

    if (!response.ok) {
      throw new Error('Network response was not ok')
    }

    const data: MultiplyResponse = await response.json()
    result.value = data.result
  } catch (err: unknown) {
    error.value = (err as Error).message
  }
}
</script>

<template>
  <main style="padding: 2rem; font-family: sans-serif;">
    <h1>Multiplier App (Vue)</h1>
    <form
      style="margin-bottom: 1rem;"
      @submit.prevent="handleSubmit"
    >
      <label
        for="numberInput"
        style="display: block; margin-bottom: 0.5rem;"
      >
        Enter a number:
      </label>
      <input
        id="numberInput"
        v-model="number"
        type="number"
        step="any"
        required
        style="padding: 0.5rem; margin-right: 0.5rem;"
      >
      <button
        type="submit"
        style="padding: 0.5rem 1rem;"
      >
        Multiply by 2
      </button>
    </form>

    <div
      v-if="result !== null"
      style="margin-top: 1rem; padding: 1rem; background-color: #e0ffe0; border: 1px solid #00cc00;"
    >
      <strong>Result:</strong> {{ result }}
    </div>

    <div
      v-if="error"
      style="margin-top: 1rem; padding: 1rem; background-color: #ffe0e0; border: 1px solid #cc0000;"
    >
      <strong>Error:</strong> {{ error }}
    </div>
  </main>
</template>
