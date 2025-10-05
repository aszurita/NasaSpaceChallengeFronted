import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders home page title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Welcome to Spaceper/i);
  expect(titleElement).toBeInTheDocument();
});
