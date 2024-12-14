export function BigCardButton({ title, onClick }: { title: string, onClick: () => void }) {
  return (
    <div className="big-card-button" onClick={onClick}>
      <span>{title}</span>
    </div>
  );
}