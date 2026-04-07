import { useState } from 'react';

const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

// Returns YYYY-MM-DD string for a Date
function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

// Get all days in the grid for a month (Mon-based, 6 weeks max)
function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  // Monday=0 ... Sunday=6
  let startDow = (firstDay.getDay() + 6) % 7;
  const days = [];
  for (let i = -startDow; i < lastDay.getDate(); i++) {
    const d = new Date(year, month, 1 + i);
    days.push(d);
  }
  // Fill to complete last week
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return days;
}

function getReservationsForDay(reservations, dateStr) {
  return reservations.filter(r => r.debut <= dateStr && r.fin >= dateStr);
}

export default function MonthView({ currentDate, reservations, session, onDayClick, onEditClick, onDeleteClick }) {
  const [selecting, setSelecting] = useState(null); // { start: dateStr }
  const [hoverDate, setHoverDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthGrid(year, month);
  const today = toDateStr(new Date());

  const selStart = selecting?.start;
  const selEnd = hoverDate;

  const isInSelection = (dateStr) => {
    if (!selStart || !selEnd) return false;
    const [a, b] = selStart <= selEnd ? [selStart, selEnd] : [selEnd, selStart];
    return dateStr >= a && dateStr <= b;
  };

  const handleDayMouseDown = (dateStr) => {
    setSelecting({ start: dateStr });
  };

  const handleDayMouseUp = (dateStr) => {
    if (!selecting) return;
    const [a, b] = selecting.start <= dateStr
      ? [selecting.start, dateStr]
      : [dateStr, selecting.start];
    setSelecting(null);
    setHoverDate(null);
    onDayClick(a, b);
  };

  const handleDayClick = (dateStr) => {
    if (!selecting) {
      onDayClick(dateStr, dateStr);
    }
  };

  return (
    <div className="month-view" onMouseLeave={() => { setSelecting(null); setHoverDate(null); }}>
      <div className="month-grid-header">
        {JOURS.map(j => <div key={j} className="day-header">{j}</div>)}
      </div>
      <div className="month-grid">
        {days.map(day => {
          const dateStr = toDateStr(day);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = dateStr === today;
          const dayReservations = getReservationsForDay(reservations, dateStr);
          const inSel = isInSelection(dateStr);

          return (
            <div
              key={dateStr}
              className={[
                'day-cell',
                !isCurrentMonth && 'other-month',
                isToday && 'today',
                inSel && 'in-selection'
              ].filter(Boolean).join(' ')}
              onMouseDown={() => handleDayMouseDown(dateStr)}
              onMouseEnter={() => selecting && setHoverDate(dateStr)}
              onMouseUp={() => handleDayMouseUp(dateStr)}
              onClick={() => handleDayClick(dateStr)}
            >
              <span className="day-number">{day.getDate()}</span>
              <div className="day-reservations">
                {dayReservations.map(r => {
                  const canEdit = session.isAdmin || r.membre === session.nom;
                  const isStart = r.debut === dateStr;
                  const isEnd = r.fin === dateStr;
                  return (
                    <div
                      key={r.id}
                      className={[
                        'reservation-band',
                        r.statut,
                        isStart && 'band-start',
                        isEnd && 'band-end',
                        (!isStart && !isEnd) && 'band-middle'
                      ].filter(Boolean).join(' ')}
                      title={`${r.membre}${r.note ? ' — ' + r.note : ''}`}
                      onClick={e => { e.stopPropagation(); if (canEdit) onEditClick(r); }}
                    >
                      {isStart && (
                        <span className="band-label">
                          {r.membre}
                          {canEdit && (
                            <button
                              className="band-delete"
                              title="Supprimer"
                              onClick={e => { e.stopPropagation(); onDeleteClick(r.id); }}
                            >✕</button>
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
