import { render, screen } from '@testing-library/react';

import Footer from './Footer';

vi.mock('../api', () => ({
  API_DISPLAY_URL: 'http://test-api.example.com',
}));

describe('Footer', () => {
  it('renders the API URL', () => {
    render(<Footer />);
    expect(screen.getByText('API: http://test-api.example.com')).toBeInTheDocument();
  });

  it('renders as a footer element', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer).toBeInTheDocument();
    expect(footer?.className).toContain('fixed-bottom');
  });
});
