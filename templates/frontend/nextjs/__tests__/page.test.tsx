import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../app/page';

// Mock fetch
globalThis.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ result: 10 }),
  } as unknown as Response)
) as typeof fetch;

describe('Home', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('renders a heading', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /Multiplier App/i });
    expect(heading).toBeInTheDocument();
  });

  it('submits a number and displays the result', async () => {
    render(<Home />);
    
    const input = screen.getByLabelText(/Enter a number/i);
    const button = screen.getByRole('button', { name: /Multiply by 2/i });

    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(button);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:8000/api/multiply', expect.any(Object));

    const result = await waitFor(() => screen.getByText(/Result:/i));
    expect(result).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});
