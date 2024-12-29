import { useState } from 'react';
import styles from './InputPopup.module.css';

export type InputPopupParams = {
  title: string;
  placeholder: string;
  secondPlaceholder?: string;
  initialValue?: string;
  secondInitialValue?: string;
  confirmButtonText?: string;
  onConfirm: (value: string, secondValue?: string) => void;
  onCancel: () => void;
};

export const InputPopup = ({ isVisible, params }: { isVisible: boolean, params: InputPopupParams }) => {
  
  const [inputValue, setInputValue] = useState(params.initialValue ?? '');
  const [secondInputValue, setSecondInputValue] = useState(params.initialValue ?? '');

  if (!isVisible) return <></>;

  const hasSecondInput = params.onConfirm.length === 2;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSecondInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSecondInputValue(event.target.value);
  }

  const handleConfirm = () => {
    if (hasSecondInput) {
      params.onConfirm(inputValue, secondInputValue);
    } else {
      params.onConfirm(inputValue);
    }
  };
  
  return (
    <div
      className={styles.overlay}
      onClick={params.onCancel} // Close the popup when clicking outside the container
    >
      <div
        className={styles.container}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className={styles.title}>{params.title}</h2>
        <input
          className={styles.input}
          placeholder={params.placeholder}
          defaultValue={params.initialValue}
          onChange={handleInputChange}
        />
        {hasSecondInput && (
          <input
            className={styles.input}
            placeholder={params.secondPlaceholder}
            defaultValue={params.secondInitialValue}
            onChange={handleSecondInputChange}
          />
        )}
        <div className={styles.buttonRow}>
          <button
            className={styles.button}
            onClick={handleConfirm}
          >
            {params.confirmButtonText ?? "Confirm"}
          </button>
          <button
            className={styles.button}
            onClick={params.onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};