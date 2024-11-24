export function CardItemWithButton({ title, text, buttonClick, buttonText, showButton }: { 
  title: string, 
  text: string, 
  buttonClick: () => void, 
  buttonText: string,
  showButton: boolean
}) {
  return (
    <div className="card-item">
        <div className="card-item-container">
          <div>
            <div className="card-item-title">
              {title}
            </div>
            <div className="card-item-value">
              {text}
            </div>
          </div>
          {showButton && (
            <button className="card-item-button" onClick={buttonClick}>
              {buttonText}
            </button>
          )}
        </div>
      </div>
  );
}