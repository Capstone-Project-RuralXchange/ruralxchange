import React from 'react';
import { useTranslation } from 'react-i18next';

// Shown when a list request fails, so a failure is never mistaken for "no results".
const LoadError = ({ message, onRetry }) => {
  const { t } = useTranslation();
  return (
    <div role="alert" data-testid="load-error" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
      <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{t('Could not load results')}</h3>
      <p style={{ marginBottom: '1rem' }}>{message || t('Please check your connection and try again.')}</p>
      <button type="button" className="btn btn-primary" onClick={onRetry}>{t('Retry')}</button>
    </div>
  );
};

export default LoadError;
