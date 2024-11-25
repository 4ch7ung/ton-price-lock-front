export function CardHeader({ title, onRefresh }: { title: string, onRefresh?: () => void }) {
  return (
    <div className="card-header">
      <span>{title}</span>
      {onRefresh && (
        <button className="card-header-button" onClick={onRefresh}>
          Refresh
        </button>
      )}
    </div>
  );
}