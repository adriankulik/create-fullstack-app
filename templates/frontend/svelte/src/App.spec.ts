import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import App from './App.svelte'

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ result: 10 }),
  })
)

describe('App', () => {
  beforeEach(() => {
    fetch.mockClear()
  })

  it('renders a heading', () => {
    const { getByText } = render(App)
    expect(getByText('Multiplier App (Svelte)')).toBeInTheDocument()
  })

  it('submits a number and displays the result', async () => {
    const { getByLabelText, getByText, getByRole } = render(App)
    
    const input = getByLabelText(/Enter a number/i)
    const button = getByRole('button', { name: /Multiply by 2/i })

    await fireEvent.input(input, { target: { value: '5' } })
    await fireEvent.click(button)

    expect(fetch).toHaveBeenCalledTimes(1)
    
    await waitFor(() => expect(getByText(/Result:/i)).toBeInTheDocument())
    expect(getByText('10')).toBeInTheDocument()
  })
})
