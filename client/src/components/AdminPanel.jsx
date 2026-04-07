import { useState } from 'react';

const STATUT_LABEL = { option: 'Option', confirme: 'Confirmé' };

function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function AdminPanel({ reservations, membres, session, onEdit, onDelete, onUpdateMembres, onDeletePast }) {
  const [filterMembre, setFilterMembre] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterDebut, setFilterDebut] = useState('');
  const [filterFin, setFilterFin] = useState('');
  const [tab, setTab] = useState('reservations'); // 'reservations' | 'membres'
  const [newMembre, setNewMembre] = useState('');
  const [membresEdit, setMembresEdit] = useState([...membres]);
  const [membresMsg, setMembresMsg] = useState('');

  const filtered = reservations.filter(r => {
    if (filterMembre && r.membre !== filterMembre) return false;
    if (filterStatut && r.statut !== filterStatut) return false;
    if (filterDebut && r.fin < filterDebut) return false;
    if (filterFin && r.debut > filterFin) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => a.debut.localeCompare(b.debut));

  const handleAddMembre = () => {
    const nom = newMembre.trim();
    if (!nom || membresEdit.includes(nom)) return;
    setMembresEdit([...membresEdit, nom]);
    setNewMembre('');
  };

  const handleRemoveMembre = (nom) => {
    if (!window.confirm(`Supprimer "${nom}" de la liste ? Les réservations existantes ne seront pas effacées.`)) return;
    setMembresEdit(membresEdit.filter(m => m !== nom));
  };

  const handleSaveMembres = async () => {
    const res = await onUpdateMembres(membresEdit);
    if (res.ok) {
      setMembresMsg('Liste sauvegardée.');
    } else {
      setMembresMsg('Erreur lors de la sauvegarde.');
    }
    setTimeout(() => setMembresMsg(''), 3000);
  };

  return (
    <div className="admin-panel">
      <div className="admin-tabs">
        <button
          className={`tab ${tab === 'reservations' ? 'active' : ''}`}
          onClick={() => setTab('reservations')}
        >Réservations ({reservations.length})</button>
        <button
          className={`tab ${tab === 'membres' ? 'active' : ''}`}
          onClick={() => setTab('membres')}
        >Membres</button>
      </div>

      {tab === 'reservations' && (
        <>
          <div className="admin-filters">
            <select value={filterMembre} onChange={e => setFilterMembre(e.target.value)}>
              <option value="">Tous les membres</option>
              {membres.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}>
              <option value="">Tous les statuts</option>
              <option value="option">Option</option>
              <option value="confirme">Confirmé</option>
            </select>
            <input type="date" value={filterDebut} onChange={e => setFilterDebut(e.target.value)} title="Période depuis" />
            <input type="date" value={filterFin} onChange={e => setFilterFin(e.target.value)} title="Période jusqu'au" />
            <button className="btn btn-ghost" onClick={() => { setFilterMembre(''); setFilterStatut(''); setFilterDebut(''); setFilterFin(''); }}>
              Réinitialiser
            </button>
          </div>

          <div className="admin-table-wrapper">
            {sorted.length === 0 ? (
              <div className="empty-state">Aucune réservation trouvée.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Membre</th>
                    <th>Arrivée</th>
                    <th>Départ</th>
                    <th>Statut</th>
                    <th>Note</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(r => (
                    <tr key={r.id}>
                      <td><strong>{r.membre}</strong></td>
                      <td>{formatDate(r.debut)}</td>
                      <td>{formatDate(r.fin)}</td>
                      <td>
                        <span className={`statut-badge ${r.statut}`}>
                          {STATUT_LABEL[r.statut]}
                        </span>
                      </td>
                      <td className="note-cell">{r.note || '—'}</td>
                      <td className="actions-cell">
                        <button className="btn btn-sm btn-ghost" onClick={() => onEdit(r)}>Modifier</button>
                        <button className="btn btn-sm btn-danger" onClick={() => onDelete(r.id)}>Supprimer</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="admin-danger-zone">
            <h3>Zone dangereuse</h3>
            <button className="btn btn-danger" onClick={onDeletePast}>
              🗑️ Supprimer toutes les réservations passées
            </button>
          </div>
        </>
      )}

      {tab === 'membres' && (
        <div className="membres-panel">
          <h3>Liste des membres ({membresEdit.length})</h3>
          <ul className="membres-list">
            {membresEdit.map(m => (
              <li key={m} className="membre-item">
                <span>{m}</span>
                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveMembre(m)}>Supprimer</button>
              </li>
            ))}
          </ul>
          <div className="add-membre">
            <input
              type="text"
              value={newMembre}
              onChange={e => setNewMembre(e.target.value)}
              placeholder="Nouveau prénom"
              onKeyDown={e => e.key === 'Enter' && handleAddMembre()}
            />
            <button className="btn btn-primary" onClick={handleAddMembre}>Ajouter</button>
          </div>
          <button className="btn btn-success" onClick={handleSaveMembres}>Sauvegarder la liste</button>
          {membresMsg && <div className="form-success">{membresMsg}</div>}
        </div>
      )}
    </div>
  );
}
