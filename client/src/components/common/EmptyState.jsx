export default function EmptyState({ title, note }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{note}</p>
    </div>
  );
}
