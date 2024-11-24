import { CopyButton } from "../CopyButton";

export function CardItem({ title, text, copyButtonClick }: { title: string, text: string, copyButtonClick?: () => void }) {
  return (
    <div className="card-item">
        <div className="card-item-title">{title}</div>
        <div className={copyButtonClick ? "card-item-value card-item-container" : "card-item-value"}>
          <span>{text}</span>
          {copyButtonClick && <CopyButton onClick={copyButtonClick} />}
        </div>
      </div>
  );
}