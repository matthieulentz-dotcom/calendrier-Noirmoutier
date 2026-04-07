import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login.jsx';
import CalendarView from './components/CalendarView.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ReservationModal from './components/ReservationModal.jsx';

const API = '/api';

export default function App() {
  const [session, setSession] = useState(() => {
    const saved = sessionStorage.getItem('session');
    return saved ? JSON.parse(saved) : null;
  });
  const [membres, setMembres] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [showAdmin, setShowAdmin] = useState(false);
  const [modal, setModal] = useState(null); // { reservation, defaultDebut, defaultFin }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load config
  useEffect(() => {
    fetch(`${API}/config`)
      .then(r => r.json())
      .then(d => setMembres(d.membres))
      .catch(() => setError('Impossible de contacter le serveur.'));
  }, []);

  // Load reservations
  const loadReservations = useCallback(() => {
    fetch(`${API}/reservations`)
      .then(r => r.json())
      .then(setReservations)
      .catch(() => setError('Erreur lors du chargement des réservations.'));
  }, []);

  useEffect(() => {
    if (session) loadReservations();
  }, [session, loadReservations]);

  const handleLogin = (nom, isAdmin, password) => {
    const s = { nom, isAdmin, password: isAdmin ? password : '' };
    setSession(s);
    sessionStorage.setItem('session', JSON.stringify(s));
  };

  const handleLogout = () => {
    setSession(null);
    sessionStorage.removeItem('session');
    setShowAdmin(false);
  };

  const openCreate = (defaultDebut = null, defaultFin = null) => {
    setModal({ reservation: null, defaultDebut, defaultFin });
  };

  const openEdit = (reservation) => {
    setModal({ reservation, defaultDebut: null, defaultFin: null });
  };

  const closeModal = () => setModal(null);

  const handleSave = async (formData) => {
    setLoading(true);
    setError('');
    try {
      let res;
      if (formData.id) {
        res = await fetch(`${API}/reservations/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, currentUser: session.nom, password: session.password })
        });
      } else {
        res = await fetch(`${API}/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, membre: session.nom })
        });
      }
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Erreur lors de la sauvegarde.');
        return;
      }
      loadReservations();
      closeModal();
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette réservation ?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentUser: session.nom, password: session.password })
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.message || 'Erreur lors de la suppression.');
        return;
      }
      loadReservations();
    } catch {
      setError('Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMembres = async (nouveauxMembres) => {
    const res = await fetch(`${API}/config/membres`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: session.password, membres: nouveauxMembres })
    });
    if (res.ok) {
      const d = await res.json();
      setMembres(d.membres);
    }
    return res;
  };

  const handleDeletePast = async () => {
    if (!window.confirm('Supprimer toutes les réservations dont la date de fin est passée ?')) return;
    const res = await fetch(`${API}/admin/reservations/past`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: session.password })
    });
    if (res.ok) {
      const d = await res.json();
      loadReservations();
      alert(`${d.deleted} réservation(s) supprimée(s).`);
    }
  };

  if (!session) {
    return <Login membres={membres} onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <span className="app-logo">🏖️</span>
          <h1>Maison Noirmoutier</h1>
        </div>
        <div className="header-right">
          <span className="user-badge">{session.nom}{session.isAdmin && ' 👑'}</span>
          {session.isAdmin && (
            <button className="btn btn-secondary" onClick={() => setShowAdmin(!showAdmin)}>
              {showAdmin ? '📅 Calendrier' : '⚙️ Admin'}
            </button>
          )}
          <button className="btn btn-ghost" onClick={handleLogout}>Déconnexion</button>
        </div>
      </header>

      {error && (
        <div className="error-banner" onClick={() => setError('')}>
          ⚠️ {error} <span className="close-x">✕</span>
        </div>
      )}

      {showAdmin ? (
        <AdminPanel
          reservations={reservations}
          membres={membres}
          session={session}
          onEdit={openEdit}
          onDelete={handleDelete}
          onUpdateMembres={handleUpdateMembres}
          onDeletePast={handleDeletePast}
        />
      ) : (
        <CalendarView
          reservations={reservations}
          session={session}
          onCreateClick={openCreate}
          onEditClick={openEdit}
          onDeleteClick={handleDelete}
        />
      )}

      {modal && (
        <ReservationModal
          reservation={modal.reservation}
          defaultDebut={modal.defaultDebut}
          defaultFin={modal.defaultFin}
          session={session}
          membres={membres}
          onSave={handleSave}
          onClose={closeModal}
          loading={loading}
        />
      )}
    </div>
  );
}
