import { useState } from 'react';

export default function Login({ membres, onLogin }) {
  const [nom, setNom] = useState('');
  const [wantsAdmin, setWantsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nom) { setError('Sélectionnez votre prénom.'); return; }
    setError('');

    if (wantsAdmin) {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password })
        });
        if (res.ok) {
          onLogin(nom, true, password);
        } else {
          setError('Mot de passe administrateur incorrect.');
        }
      } catch {
        setError('Impossible de contacter le serveur.');
      } finally {
        setLoading(false);
      }
    } else {
      onLogin(nom, false, '');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <span className="login-logo">🏖️</span>
          <h1>Maison Noirmoutier</h1>
          <p>Calendrier partagé</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nom">Qui êtes-vous ?</label>
            <select
              id="nom"
              value={nom}
              onChange={e => setNom(e.target.value)}
              required
            >
              <option value="">— Sélectionnez votre prénom —</option>
              {membres.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div className="form-group admin-toggle">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={wantsAdmin}
                onChange={e => setWantsAdmin(e.target.checked)}
              />
              Se connecter en tant qu'administrateur
            </label>
          </div>

          {wantsAdmin && (
            <div className="form-group">
              <label htmlFor="password">Mot de passe admin</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mot de passe"
                autoFocus
              />
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn btn-primary btn-full" disabled={loading || !nom}>
            {loading ? 'Connexion…' : 'Accéder au calendrier'}
          </button>
        </form>
      </div>
    </div>
  );
}
