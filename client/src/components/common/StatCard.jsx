export default function StatCard({ eyebrow, title, value, note }) {
  return (
    <article className="stat-card">
      <span className="stat-card__eyebrow">{eyebrow}</span>
      <h3 className="stat-card__value">{value}</h3>
      <p className="stat-card__title">{title}</p>
      {note ? <small className="stat-card__note">{note}</small> : null}
    </article>
  );
}
