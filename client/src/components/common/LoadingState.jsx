export default function LoadingState({ label = 'Dang tai du lieu...' }) {
  return (
    <div className="loading-state">
      <div className="loading-state__pulse" aria-hidden="true">
        <span className="loading-state__dot" />
        <span className="loading-state__dot" />
        <span className="loading-state__dot" />
      </div>
      <p>{label}</p>
    </div>
  );
}
