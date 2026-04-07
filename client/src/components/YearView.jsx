const MOIS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
const JOURS_COURTS = ['L','M','M','J','V','S','D'];

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  let startDow = (firstDay.getDay() + 6) % 7;
  const days = [];
  for (let i = -startDow; i < lastDay.getDate(); i++) {
    days.push(new Date(year, month, 1 + i));
  }
  while (days.length % 7 !== 0) {
    const last = days[days.length - 1];
    days.push(new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1));
  }
  return days;
}

function getReservationsForDay(reservations, dateStr) {
  return reservations.filter(r => r.debut <= dateStr && r.fin >= dateStr);
}

function MiniMonth({ year, month, reservations, onDayClick, onMonthClick }) {
  const days = getMonthDays(year, month);
  const today = toDateStr(new Date());

  return (
    <div className="mini-month">
      <div className="mini-month-title" onClick={() => onMonthClick(month)}>
        {MOIS[month]}
      </div>
      <div className="mini-grid-header">
        {JOURS_COURTS.map((j, i) => <span key={i}>{j}</span>)}
      </div>
      <div className="mini-grid">
        {days.map(day => {
          const dateStr = toDateStr(day);
          const isCurrentMonth = day.getMonth() === month;
          const isToday = dateStr === today;
          const dayRes = getReservationsForDay(reservations, dateStr);
          const hasOption = dayRes.some(r => r.statut === 'option');
          const hasConfirme = dayRes.some(r => r.statut === 'confirme');

          return (
            <div
              key={dateStr}
              className={[
                'mini-day',
                !isCurrentMonth && 'other-month',
                isToday && 'today',
                hasConfirme && 'has-confirme',
                !hasConfirme && hasOption && 'has-option'
              ].filter(Boolean).join(' ')}
              onClick={() => isCurrentMonth && onDayClick(dateStr, dateStr)}
              title={dayRes.map(r => r.membre).join(', ')}
            >
              {isCurrentMonth ? day.getDate() : ''}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function YearView({ year, reservations, onDayClick, onMonthClick }) {
  return (
    <div className="year-view">
      <h2 className="year-title">{year}</h2>
      <div className="year-grid">
        {Array.from({ length: 12 }, (_, i) => (
          <MiniMonth
            key={i}
            year={year}
            month={i}
            reservations={reservations}
            onDayClick={onDayClick}
            onMonthClick={onMonthClick}
          />
        ))}
      </div>
    </div>
  );
}
