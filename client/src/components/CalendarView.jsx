import { useState } from 'react';
import MonthView from './MonthView.jsx';
import YearView from './YearView.jsx';

export default function CalendarView({ reservations, session, onCreateClick, onEditClick, onDeleteClick }) {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const goToPrevMonth = () => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goToNextMonth = () => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };
  const goToToday = () => setCurrentDate(new Date());

  const monthLabel = currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  return (
    <div className="calendar-container">
      <div className="calendar-toolbar">
        <div className="toolbar-left">
          <button className="btn btn-ghost" onClick={goToToday}>Aujourd'hui</button>
          {view === 'month' && (
            <>
              <button className="btn btn-icon" onClick={goToPrevMonth} title="Mois précédent">‹</button>
              <span className="month-label">{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</span>
              <button className="btn btn-icon" onClick={goToNextMonth} title="Mois suivant">›</button>
            </>
          )}
        </div>
        <div className="toolbar-right">
          <div className="view-toggle">
            <button
              className={`btn ${view === 'month' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setView('month')}
            >Mois</button>
            <button
              className={`btn ${view === 'year' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setView('year')}
            >Année</button>
          </div>
          <button className="btn btn-success" onClick={() => onCreateClick()}>
            + Nouvelle réservation
          </button>
        </div>
      </div>

      <div className="legend">
        <span className="legend-item"><span className="legend-dot option"></span>Option (provisoire)</span>
        <span className="legend-item"><span className="legend-dot confirme"></span>Confirmé</span>
      </div>

      {view === 'month' ? (
        <MonthView
          currentDate={currentDate}
          reservations={reservations}
          session={session}
          onDayClick={onCreateClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
        />
      ) : (
        <YearView
          year={currentDate.getFullYear()}
          reservations={reservations}
          session={session}
          onDayClick={onCreateClick}
          onEditClick={onEditClick}
          onDeleteClick={onDeleteClick}
          onMonthClick={(month) => {
            setCurrentDate(new Date(currentDate.getFullYear(), month, 1));
            setView('month');
          }}
        />
      )}
    </div>
  );
}
