import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import HomePage from './pages/HomePage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Mock components that might cause issues during testing
jest.mock('./components/layout/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('./components/layout/Footer', () => () => <div data-testid="footer" />);

jest.mock('./utils/api', () => ({
  equipmentAPI: { getAll: jest.fn(() => Promise.resolve({ data: { data: [] } })) },
  specialistAPI: { getAll: jest.fn(() => Promise.resolve({ data: { data: [] } })) },
  seasonalAPI: { getCurrent: jest.fn(() => Promise.resolve({ data: { data: {} } })) },
}));

describe('i18n Smoke Test', () => {
  beforeEach(() => {
    // Reset language to English before each test
    act(() => {
      i18n.changeLanguage('en');
    });
  });

  test('toggles language and updates UI string', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <AuthProvider>
            <I18nextProvider i18n={i18n}>
              <HomePage />
            </I18nextProvider>
          </AuthProvider>
        </BrowserRouter>
      );
    });

    // Wait for the text to appear (using a partial match for one of the hero texts)
    expect(await screen.findByText(/Equipment \+ Operator/)).toBeInTheDocument();

    // Toggle to Kannada
    await act(async () => {
      i18n.changeLanguage('kn');
    });

    // "ಉಪಕರಣ + ಆಪರೇಟರ್" is the KN translation of "Equipment + Operator."
    expect(await screen.findByText(/ಉಪಕರಣ \+ ಆಪರೇಟರ್/)).toBeInTheDocument();
    
    // Toggle to Hindi
    await act(async () => {
      i18n.changeLanguage('hi');
    });

    // "उपकरण \+ ऑपरेटर" is the HI translation
    expect(await screen.findByText(/उपकरण \+ ऑपरेटर/)).toBeInTheDocument();
  });
});

