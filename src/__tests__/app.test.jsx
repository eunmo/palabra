import React from 'react';
import { render } from '@testing-library/react';
import App from '../app';

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const element = getByText(/Palabra!/i);
  expect(element).toBeInTheDocument();
});
