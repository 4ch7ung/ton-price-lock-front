import './InputPopup.css';

export type InputPopupParams = {
  title: string;
  placeholder: string;
  initialValue?: string;
  confirmButtonText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const InputPopup = ({ isVisible, params }: { isVisible: boolean, params: InputPopupParams }) => {
  if (!isVisible) return null;

  return (
    <div
      className="popup-overlay"
      onClick={params.onCancel} // Close the popup when clicking outside the QR container
    >
      <div
        className="popup-container"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="popup-title">{params.title}</h2>
        <input
          className="popup-input"
          placeholder={params.placeholder}
          defaultValue={params.initialValue}
        />
        <button
          className="popup-button"
          onClick={params.onConfirm}
        >
          {params.confirmButtonText ?? "Confirm"}
        </button>
      </div>
    </div>
  );
};