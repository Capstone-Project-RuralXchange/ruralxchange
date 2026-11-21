import React, { useState } from 'react';
import { equipmentAPI } from '../utils/api';
import toast from 'react-hot-toast';
export default function EquipmentEditModal({ equipment, onClose, onSaved }) {
  const [form, setForm] = useState({ title: equipment.title || '', pricePerDay: equipment.pricePerDay ?? '',
    availabilityStatus: equipment.availabilityStatus === 'maintenance' ? 'maintenance' : 'available',
    minRentalDays: equipment.minRentalDays ?? 1, maxRentalDays: equipment.maxRentalDays ?? 365 });
  const [saving, setSaving] = useState(false);
  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  async function save(e) {
    e.preventDefault(); if (saving) return;
    if (Number(form.minRentalDays) > Number(form.maxRentalDays)) return toast.error('Minimum rental days cannot exceed maximum');
    setSaving(true);
    try {
      const response = await equipmentAPI.update(equipment._id, { ...form, pricePerDay: Number(form.pricePerDay), minRentalDays: Number(form.minRentalDays), maxRentalDays: Number(form.maxRentalDays) });
      onSaved(response.data.data); toast.success('Equipment updated'); onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Could not save equipment'); }
    finally { setSaving(false); }
  }
  return <div role="presentation" style={{ position: 'fixed', inset: 0, zIndex: 2000, background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <section role="dialog" aria-modal="true" aria-labelledby="edit-equipment-title" className="card equipment-edit-dialog" style={{ padding: 24, width: '100%', maxWidth: 440, maxHeight: '90vh', overflowY: 'auto' }}>
      <h2 id="edit-equipment-title" style={{ marginBottom: 16 }}>Edit equipment</h2>
      <form onSubmit={save}>
        <label>Title<input className="form-input" required value={form.title} onChange={e => set('title', e.target.value)} /></label>
        <label>Price per day (₹)<input className="form-input" type="number" required min="0" step="0.01" value={form.pricePerDay} onChange={e => set('pricePerDay', e.target.value)} /></label>
        <label>Minimum rental days<input className="form-input" type="number" required min="1" step="1" value={form.minRentalDays} onChange={e => set('minRentalDays', e.target.value)} /></label>
        <label>Maximum rental days<input className="form-input" type="number" required min="1" step="1" value={form.maxRentalDays} onChange={e => set('maxRentalDays', e.target.value)} /></label>
        <label>Status<select className="form-input" value={form.availabilityStatus} onChange={e => set('availabilityStatus', e.target.value)}><option value="available">Available for date requests</option><option value="maintenance">Maintenance</option></select></label>
        <p style={{ margin: '12px 0', fontSize: 13 }}>Booked dates are managed by bookings and cannot be cleared here.</p>
        <div style={{ display: 'flex', gap: 12 }}><button className="btn btn-primary" disabled={saving} type="submit">{saving ? 'Saving...' : 'Save'}</button><button className="btn" type="button" onClick={onClose} disabled={saving}>Close</button></div>
      </form>
    </section>
  </div>;
}
