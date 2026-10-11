import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import HomePage from './pages/HomePage';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EQUIPMENT_CATEGORIES, SPECIALIST_TYPES, KARNATAKA_DISTRICTS } from './utils/constants';

// Mock components that might cause issues during testing
jest.mock('./components/layout/Navbar', () => () => <div data-testid="navbar" />);
jest.mock('./components/layout/Footer', () => () => <div data-testid="footer" />);

jest.mock('./utils/api', () => ({
  equipmentAPI: { getAll: jest.fn(() => Promise.resolve({ data: { data: [] } })) },
  specialistAPI: { getAll: jest.fn(() => Promise.resolve({ data: { data: [] } })) },
  seasonalAPI: { getCurrent: jest.fn(() => Promise.resolve({ data: { data: {} } })) },
}));

describe('i18n Translations & Completeness', () => {
  beforeEach(() => {
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

    // English
    expect(await screen.findByText(/Equipment \+ Operator/)).toBeInTheDocument();

    // Toggle to Kannada
    await act(async () => {
      i18n.changeLanguage('kn');
    });
    expect(await screen.findByText(/ಉಪಕರಣ \+ ಆಪರೇಟರ್/)).toBeInTheDocument();
    
    // Toggle to Hindi
    await act(async () => {
      i18n.changeLanguage('hi');
    });
    expect(await screen.findByText(/उपकरण \+ ऑपरेटर/)).toBeInTheDocument();
  });

  test('all 24 equipment categories have non-empty Kannada and Hindi translations', () => {
    i18n.changeLanguage('kn');
    EQUIPMENT_CATEGORIES.forEach(cat => {
      const translatedLabel = i18n.t(cat.label);
      const translatedValue = i18n.t(cat.value);
      expect(translatedLabel).not.toBe(cat.label); // Must be translated into Kannada
      expect(translatedLabel.length).toBeGreaterThan(0);
      expect(translatedValue.length).toBeGreaterThan(0);
    });

    i18n.changeLanguage('hi');
    EQUIPMENT_CATEGORIES.forEach(cat => {
      const translatedLabel = i18n.t(cat.label);
      const translatedValue = i18n.t(cat.value);
      expect(translatedLabel.length).toBeGreaterThan(0);
      expect(translatedValue.length).toBeGreaterThan(0);
    });
  });

  test('all 16 specialist types have non-empty Kannada and Hindi translations', () => {
    i18n.changeLanguage('kn');
    SPECIALIST_TYPES.forEach(s => {
      const translatedLabel = i18n.t(s.label);
      const translatedValue = i18n.t(s.value);
      expect(translatedLabel).not.toBe(s.label); // Must be translated into Kannada
      expect(translatedLabel.length).toBeGreaterThan(0);
      expect(translatedValue.length).toBeGreaterThan(0);
    });

    i18n.changeLanguage('hi');
    SPECIALIST_TYPES.forEach(s => {
      const translatedLabel = i18n.t(s.label);
      const translatedValue = i18n.t(s.value);
      expect(translatedLabel.length).toBeGreaterThan(0);
      expect(translatedValue.length).toBeGreaterThan(0);
    });
  });

  test('all requirement types and districts translate accurately', () => {
    i18n.changeLanguage('kn');
    expect(i18n.t('Bundle')).toBe('ಬಂಡಲ್ (ಉಪಕರಣ + ತಜ್ಞ)');
    expect(i18n.t('Tractor Driver')).toBe('ಟ್ರಾಕ್ಟರ್ ಚಾಲಕ');
    expect(i18n.t('Pump Mechanic')).toBe('ಪಂಪ್ ಮೆಕ್ಯಾನಿಕ್');
    expect(i18n.t('Painter')).toBe('ಪೇಂಟರ್');
    expect(i18n.t('Field Labourer')).toBe('ಕ್ಷೇತ್ರ ಕಾರ್ಮಿಕ');
    expect(i18n.t('Refrigeration Tech')).toBe('ಶೀತಲೀಕರಣ ತಂತ್ರಜ್ಞ');
    expect(i18n.t('Tractor')).toBe('ಟ್ರಾಕ್ಟರ್');
    expect(i18n.t('Harvester')).toBe('ಕೊಯ್ಲು ಯಂತ್ರ (ಹಾರ್ವೆಸ್ಟರ್)');
    expect(i18n.t('Water Pump')).toBe('ನೀರಿನ ಪಂಪ್');

    i18n.changeLanguage('hi');
    expect(i18n.t('Bundle')).toBe('बंडल (उपकरण + विशेषज्ञ)');
    expect(i18n.t('Tractor Driver')).toBe('ट्रैक्टर ड्राइवर');
    expect(i18n.t('Pump Mechanic')).toBe('पंप मैकेनिक');
    expect(i18n.t('Tractor')).toBe('ट्रैक्टर');
    expect(i18n.t('Harvester')).toBe('हार्वेस्टर');
    expect(i18n.t('Water Pump')).toBe('पानी का पंप');
  });

  test('CTA buttons, footer links, and tabs translate cleanly across languages', () => {
    // English
    i18n.changeLanguage('en');
    expect(i18n.t('List Your Equipment')).toBe('List Your Equipment');
    expect(i18n.t('List Equipment CTA')).toBe('List Your Equipment');
    expect(i18n.t('🚜 List Equipment CTA')).toBe('🚜 List Your Equipment');
    expect(i18n.t('Create Free Account')).toBe('Create Free Account');

    // Kannada
    i18n.changeLanguage('kn');
    expect(i18n.t('List Your Equipment')).toBe('ನಿಮ್ಮ ಉಪಕರಣವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ');
    expect(i18n.t('List Equipment CTA')).toBe('ನಿಮ್ಮ ಉಪಕರಣವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ');
    expect(i18n.t('🚜 List Equipment CTA')).toBe('🚜 ನಿಮ್ಮ ಉಪಕರಣವನ್ನು ಪಟ್ಟಿ ಮಾಡಿ');
    expect(i18n.t('Create Free Account')).toBe('ಉಚಿತ ಖಾತೆ ರಚಿಸಿ');

    // Hindi
    i18n.changeLanguage('hi');
    expect(i18n.t('List Your Equipment')).toBe('अपने उपकरण की सूची बनाएं');
    expect(i18n.t('List Equipment CTA')).toBe('अपने उपकरण की सूची बनाएं');
    expect(i18n.t('🚜 List Equipment CTA')).toBe('🚜 अपने उपकरण की सूची बनाएं');
    expect(i18n.t('Create Free Account')).toBe('मुफ़्त खाता बनाएँ');
  });
});


