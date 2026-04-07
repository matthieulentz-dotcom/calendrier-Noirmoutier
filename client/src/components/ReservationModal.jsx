import { useState, useEffect } from 'react';

export default function ReservationModal({ reservation, defaultDebut, defaultFin, session, membres, onSave, onClose, loading }) {
  const isEdit = !!reservation;
  const canEditMembre = session.isAdmin && isEdit;

  const [form, setForm] = useState({
    debut: defaultDebut || new Date().toISOString().split('T')[0],
    fin: defaultFin || new Date().toISOString().split('T')[0],
    statut: 'option',
    note: '',
    membre: session.nom
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (reservation) {
      setForm({
        debut: reservation.debut,
        fin: reservation.fin,
        statut: reservation.statut,
        note: reservation.note || '',
        membre: reservation.membre
      });
    }
  }, [reservation]);

  const set = (field) => (e) => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.debut > form.fin) {
      setError('La date de début doit être avant la date de fin.');
      return;
    }
    onSave(isEdit ? { ...form, id: reservation.id } : form);
  };

  const nuitCount = () => {
    const d = new Date(form.debut);
    const f = new Date(form.fin);
    const diff = Math.round((f - d) / (1000 * 60 * 60 * 24));
    if (diff === 0) return '1 journée';
    return `${diff + 1} jours (${diff} nuit${diff > 1 ? 's' : ''})`;
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>{isEdit ? 'Modifier la réservation' : 'Nouvelle réservation'}</h2>
          <button className="btn btn-icon modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {canEditMembre && (
            <div className="form-group">
              <label>Membre</label>
              <select value={form.membre} onChange={set('membre')}>
                {membres.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          )}
          {!canEditMembre && isEdit && (
            <div className="form-group">
              <label>Membre</label>
              <div className="form-static">{form.membre}</div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="debut">Date d'arrivée</label>
              <input
                id="debut"
                type="date"
                value={form.debut}
                onChange={set('debut')}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="fin">Date de départ</label>
              <input
                id="fin"
                type="date"
                value={form.fin}
                min={form.debut}
                onChange={set('fin')}
                required
              />
            </div>
          </div>

          {form.debut && form.fin && (
            <div className="duration-hint">{nuitCount()}</div>
          )}

          <div className="form-group">
            <label>Statut</label>
            <div className="statut-toggle">
              <label className={`statut-option ${form.statut === 'option' ? 'active option' : ''}`}>
                <input
                  type="radio"
                  name="statut"
                  value="option"
                  checked={form.statut === 'option'}
                  onChange={set('statut')}
                />
                🟡 Option (provisoire)
              </label>
              <label className={`statut-option ${form.statut === 'confirme' ? 'active confirme' : ''}`}>
                <input
                  type="radio"
                  name="statut"
                  value="confirme"
                  checked={form.statut === 'confirme'}
                  onChange={set('statut')}
                />
                🟢 Confirmé
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="note">Note (optionnelle)</label>
            <input
              id="note"
              type="text"
              value={form.note}
              onChange={set('note')}
              placeholder="Ex : avec les enfants, week-end seulement…"
              maxLength={200}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enregistrement…' : isEdit ? 'Modifier' : 'Réserver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
