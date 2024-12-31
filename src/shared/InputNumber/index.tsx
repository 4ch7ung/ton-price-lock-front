import React, { useState, ChangeEvent } from 'react';
import styles from './styles.module.css';

type InputProps = {
  placeholder?: string;
  currency?: string; // Валюта, которая будет отображаться
  value?: string;
  onChange?: (value: string) => void;
  maxValue?: number;
};

export const InputNumber: React.FC<InputProps> = ({
  placeholder,
  currency = 'USD',
  value = '',
  onChange,
  maxValue,
}) => {
  const [inputValue, setInputValue] = useState<string>(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value.replace(',', '.').replace(/[^\d,.]/g, '');
    

    if (newValue === '' || (!isNaN(+newValue) && !isNaN(parseFloat(newValue)))) {
      if (maxValue !== undefined && Number(newValue) > maxValue) {
        newValue = maxValue.toString();
      }
      setInputValue(newValue);
      onChange?.(newValue);
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          className={styles.input}
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
        />
        <span className={styles.currency}>{currency}</span>
      </div>
    </div>
  );
};
