import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LockValues = {
  tonBalance: number;
  usdtValue: number;
  targetUsdtValue: number;
  isAvailableToWithdraw: boolean;
};

type ContextType = {
  lpPrice?: number;
  locks?: Map<number, LockValues>
};
const defaultValue: ContextType = {};

type SharedStateContextType = {
  value: ContextType;
  setValue: (newValue: ContextType) => void;
};

const SharedStateContext = createContext<SharedStateContextType | undefined>(undefined);

export const SharedStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ContextType>(defaultValue);

  return (
    <SharedStateContext.Provider value={{ value: state, setValue: setState }}>
      {children}
    </SharedStateContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSharedState = (): SharedStateContextType => {
  const context = useContext(SharedStateContext);
  if (!context) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return context;
};