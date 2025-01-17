/* eslint-disable testing-library/prefer-find-by */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'; // For better assertions
import PaginatedTable from './index';

// Mock Fetch API
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          { 's.no': 1, 'percentage.funded': '50%', 'amt.pledged': '1000' },
          { 's.no': 2, 'percentage.funded': '75%', 'amt.pledged': '2000' },
          { 's.no': 3, 'percentage.funded': '90%', 'amt.pledged': '3000' },
          { 's.no': 4, 'percentage.funded': '100%', 'amt.pledged': '4000' },
          { 's.no': 5, 'percentage.funded': '110%', 'amt.pledged': '5000' },
          { 's.no': 6, 'percentage.funded': '120%', 'amt.pledged': '6000' },
        ]),
    })
  );
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('PaginatedTable Component', () => {
  test('renders loading state initially', async () => {
    render(<PaginatedTable />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('displays table data after fetch', async () => {
    render(<PaginatedTable />);

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('1000')).toBeInTheDocument();
    });
  });

  test('handles pagination correctly', async () => {
    render(<PaginatedTable />);

    // Wait for data to load
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Verify initial page data
    await waitFor(() => expect(screen.getByText('50%')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.queryByText('120%')).not.toBeInTheDocument()
    );

    // Navigate to the next page
    const nextButton = screen.getByText(/next/i);
    fireEvent.click(nextButton);

    await waitFor(() => expect(screen.getByText('120%')).toBeInTheDocument());
  });

  test('changes page size and resets to the first page', async () => {
    render(<PaginatedTable />);

    // Wait for data to load
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Change page size
    const pageSizeSelect = await waitFor(() =>
      screen.getByLabelText(/Page Size/i)
    );
    fireEvent.change(pageSizeSelect, { target: { value: '10' } });

    // Verify all rows on a single page
    const fiftyPercent = await screen.findByText('50%');
    const hundredTwentyPercent = await screen.findByText('120%');

    // Assertions
    expect(fiftyPercent).toBeInTheDocument();
    expect(hundredTwentyPercent).toBeInTheDocument();
  });

  test('handles no data gracefully', async () => {
    // Mock fetch to return empty data
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
      })
    );

    render(<PaginatedTable />);

    // Wait for data to load
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

    // Verify no rows
    await waitFor(() =>
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    );

    // Ensure "50%" is not present
    await waitFor(() =>
      expect(screen.queryByText(/50%/)).not.toBeInTheDocument()
    );

    // Wait for "no data available" to appear
    const noDataText = await screen.findByText(/no data available/i);
    expect(noDataText).toBeInTheDocument();
  });
});
