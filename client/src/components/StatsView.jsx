export default function StatsView({ reservations, membres }) {
  // ── Calcul des stats par membre ─────────────────────────────────────
  const stats = membres.map(membre => {
    const resa = reservations.filter(r => r.membre === membre);
    const sejours = resa.length;
    const nuits = resa.reduce((acc, r) => {
      const d1 = new Date(r.debut);
      const d2 = new Date(r.fin);
      const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
      return acc + (diff > 0 ? diff : 1);
    }, 0);
    const confirmes = resa.filter(r => r.statut === 'confirme').length;
    const options   = resa.filter(r => r.statut === 'option').length;
    return { membre, sejours, nuits, confirmes, options };
  }).filter(s => s.sejours > 0 || true); // afficher tout le monde

  const maxNuits   = Math.max(...stats.map(s => s.nuits), 1);
  const maxSejours = Math.max(...stats.map(s => s.sejours), 1);

  const COLORS = [
    '#3b82f6','#10b981','#f59e0b','#ef4444',
    '#8b5cf6','#ec4899','#14b8a6','#f97316',
  ];

  // ── Total global ────────────────────────────────────────────────────
  const totalNuits   = stats.reduce((a, s) => a + s.nuits, 0);
  const totalSejours = stats.reduce((a, s) => a + s.sejours, 0);

  return (
    <div className="stats-container">
      <h2 className="stats-title">📊 Statistiques d'occupation</h2>

      {/* ── Cartes résumé ── */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-card-value">{totalSejours}</div>
          <div className="stat-card-label">Séjours total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{totalNuits}</div>
          <div className="stat-card-label">Nuits total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.filter(s => s.sejours > 0).length}</div>
          <div className="stat-card-label">Membres actifs</div>
        </div>
      </div>

      {/* ── Histogramme NUITS ── */}
      <div className="chart-block">
        <h3 className="chart-title">Nuits passées par personne</h3>
        <div className="bar-chart">
          {stats.map((s, i) => (
            <div key={s.membre} className="bar-group">
              <div className="bar-label-top">{s.nuits > 0 ? s.nuits : ''}</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${Math.round((s.nuits / maxNuits) * 100)}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
              <div className="bar-name">{s.membre}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Histogramme SÉJOURS ── */}
      <div className="chart-block">
        <h3 className="chart-title">Nombre de séjours par personne</h3>
        <div className="bar-chart">
          {stats.map((s, i) => (
            <div key={s.membre} className="bar-group">
              <div className="bar-label-top">{s.sejours > 0 ? s.sejours : ''}</div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    height: `${Math.round((s.sejours / maxSejours) * 100)}%`,
                    background: COLORS[i % COLORS.length],
                  }}
                />
              </div>
              <div className="bar-name">{s.membre}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tableau détaillé ── */}
      <div className="chart-block">
        <h3 className="chart-title">Détail par personne</h3>
        <div className="stats-table-wrapper">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Membre</th>
                <th>Séjours</th>
                <th>Nuits</th>
                <th>Confirmés</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {stats
                .slice()
                .sort((a, b) => b.nuits - a.nuits)
                .map((s, i) => (
                  <tr key={s.membre}>
                    <td>
                      <span
                        className="dot"
                        style={{ background: COLORS[membres.indexOf(s.membre) % COLORS.length] }}
                      />
                      {s.membre}
                    </td>
                    <td>{s.sejours}</td>
                    <td><strong>{s.nuits}</strong></td>
                    <td>
                      {s.confirmes > 0 && (
                        <span className="statut-badge confirme">{s.confirmes}</span>
                      )}
                    </td>
                    <td>
                      {s.options > 0 && (
                        <span className="statut-badge option">{s.options}</span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
