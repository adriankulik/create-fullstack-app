import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

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
    const wrapper = mount(App)
    expect(wrapper.find('h1').text()).toBe('Multiplier App (Vue)')
  })

  it('submits a number and displays the result', async () => {
    const wrapper = mount(App)
    
    const input = wrapper.find('#numberInput')
    await input.setValue('5')
    
    await wrapper.find('form').trigger('submit')

    expect(fetch).toHaveBeenCalledTimes(1)
    
    // Wait for the next tick for the UI to update
    await new Promise(resolve => setTimeout(resolve, 0))
    
    expect(wrapper.text()).toContain('Result: 10')
  })
})
