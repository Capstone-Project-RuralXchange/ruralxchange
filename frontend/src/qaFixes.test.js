import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { getDurationDays } from './utils/constants';
import EquipmentEditModal from './components/EquipmentEditModal';
import { equipmentAPI } from './utils/api';
jest.mock('./utils/api', () => ({ equipmentAPI: { update: jest.fn(() => Promise.resolve({ data: { data: { _id: 'test', pricePerDay: 0 } } })) } }));
jest.mock('react-hot-toast', () => ({ success: jest.fn(), error: jest.fn() }));
test('same-day rentals cost one day, October 20-22 costs three', () => {
  expect(getDurationDays(new Date(2099,9,20),new Date(2099,9,20))).toBe(1);
  expect(getDurationDays(new Date(2099,9,20),new Date(2099,9,22))).toBe(3);
  expect(getDurationDays(null,null)).toBe(0);
});
test('zero equipment price is visible and preserved on save', async () => {
  equipmentAPI.update.mockResolvedValue({ data: { data: { _id: 'test', pricePerDay: 0 } } });
  const onSaved=jest.fn(),onClose=jest.fn();
  render(<EquipmentEditModal equipment={{_id:'test',title:'Test',pricePerDay:0}} onSaved={onSaved} onClose={onClose} />);
  expect(screen.getByLabelText('Price per day (₹)')).toHaveValue(0);
  fireEvent.click(screen.getByText('Save'));
  await waitFor(()=>expect(onSaved).toHaveBeenCalled());
  expect(equipmentAPI.update).toHaveBeenCalledWith('test',expect.objectContaining({pricePerDay:0,minRentalDays:1,maxRentalDays:365}));
});
