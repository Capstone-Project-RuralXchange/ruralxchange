import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import EquipmentPage from './pages/EquipmentPage';
import SpecialistsPage from './pages/SpecialistsPage';
import RequirementsPage from './pages/RequirementsPage';
import { equipmentAPI, specialistAPI, requirementAPI } from './utils/api';

jest.mock('./utils/api', () => ({
  equipmentAPI: { getAll: jest.fn() },
  specialistAPI: { getAll: jest.fn() },
  requirementAPI: { getAll: jest.fn(), respond: jest.fn() },
}));
jest.mock('./context/AuthContext', () => ({ useAuth: () => ({ user: null }) }));
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));

const renderPage = (ui) => render(<BrowserRouter>{ui}</BrowserRouter>);
const fail = () => Promise.reject({ response: { data: { message: 'Server down' } } });
const cases = [
  ['equipment', EquipmentPage, equipmentAPI, /No equipment found/],
  ['specialists', SpecialistsPage, specialistAPI, /No specialists found/],
  ['requirements', RequirementsPage, requirementAPI, /No requirements found/],
];

describe.each(cases)('%s browse page states', (name, Page, api, emptyText) => {
  beforeEach(() => { api.getAll.mockReset(); });
  test('API failure shows an error with retry, never the empty state; retry recovers', async () => {
    api.getAll.mockImplementationOnce(fail);
    api.getAll.mockImplementation(() => Promise.resolve({ data: { data: [], total: 0, pages: 1 } }));
    renderPage(<Page />);
    expect(await screen.findByTestId('load-error')).toBeInTheDocument();
    expect(screen.queryByText(emptyText)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Retry'));
    expect(await screen.findByText(emptyText)).toBeInTheDocument();
    expect(screen.queryByTestId('load-error')).not.toBeInTheDocument();
  });
  test('a genuine empty response shows the empty state, not an error', async () => {
    api.getAll.mockResolvedValue({ data: { data: [], total: 0, pages: 1 } });
    renderPage(<Page />);
    expect(await screen.findByText(emptyText)).toBeInTheDocument();
    expect(screen.queryByTestId('load-error')).not.toBeInTheDocument();
  });
});

test('specialist browse no longer offers the legacy Booked status filter', async () => {
  specialistAPI.getAll.mockResolvedValue({ data: { data: [], total: 0, pages: 1 } });
  renderPage(<SpecialistsPage />);
  await screen.findByText(/No specialists found/);
  const options = screen.getAllByRole('option').map(o => o.textContent);
  expect(options).toContain('available');
  expect(options).not.toContain('Booked');
  expect(options).not.toContain('booked');
});
