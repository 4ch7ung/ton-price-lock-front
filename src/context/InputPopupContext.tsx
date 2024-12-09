import React, { createContext, useContext, useState, ReactNode } from 'react';
import { InputPopup, InputPopupParams } from '../components/popup/InputPopup';

type InputPopupContextType = {
  isOpen: boolean;
  openPopup: (params: InputPopupParams) => void;
  closePopup: () => void;
};

const defaultParams: InputPopupParams = {
  title: '',
  placeholder: '',
  initialValue: '',
  confirmButtonText: '',
  onConfirm: () => {},
  onCancel: () => {},
};

const InputPopupContext = createContext<InputPopupContextType | undefined>(undefined);

export const InputPopupProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [params, setParams] = useState<InputPopupParams | undefined>(undefined);

  const openPopup = (params: InputPopupParams) => { setParams(params); setIsOpen(true); };
  const closePopup = () => setIsOpen(false);

  return (
    <InputPopupContext.Provider value={{ isOpen, openPopup, closePopup }}>
      {children}
      <InputPopup 
        isVisible={isOpen} 
        params={params ?? defaultParams}
      />
    </InputPopupContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useInputPopup = (): InputPopupContextType => {
  const context = useContext(InputPopupContext);
  if (!context) {
    throw new Error('useInputPopup must be used within an InputPopupProvider');
  }
  return context;
};