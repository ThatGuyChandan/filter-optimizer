import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Dashboard from './Dashboard';

test('renders dashboard title', () => {
  render(
    <Provider store={store}>
      <Dashboard />
    </Provider>
  );
  expect(screen.getByText(/BI Dashboard - Filter Optimization/i)).toBeInTheDocument();
}); 