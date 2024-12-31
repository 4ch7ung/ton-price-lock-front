// import { useContext } from "react";

import { useInputPopup } from '../../context/InputPopupContext';
import { useMinterContract } from '../../hooks/useMinterContract';

import { Button } from '../../shared/Button';

// import styles from "./styles.module.css";

export const NFTCreateButton = ({children, className}: {children: React.ReactNode, className?: string}) => {
  const popup = useInputPopup();

  const {
      isConnected,
      sendMint,
    } = useMinterContract();
  
    const handleMintConfirm = (targetPrice: string, value?: string) => {
      if (targetPrice.trim() === "" || value?.trim() === "") return;
      const targetPriceNumber = Number(targetPrice);
      const valueNumber = Number(value);
      if (isNaN(targetPriceNumber) || isNaN(valueNumber)) {
        alert("Please enter a valid number");
        return;
      }
      sendMint(targetPriceNumber, valueNumber);
      popup.closePopup();
    }
  
    const handleMintClick = () => {
      if (popup.isOpen) {
        popup.closePopup();
        return;
      }
      
      popup.openPopup({
        title: 'Create Lock',
        placeholder: 'Target rate',
        secondPlaceholder: 'Deposit amount',
        confirmButtonText: 'Top Up NFT',
        importantText: 'This NFT is created autonomously on a smart-contract and only it’s owner has access to these funds. This NFT you can garantued exchange when TON’s rate will reach 100 USDT. You can send this NFT to anyone else using TON wallet',
        onConfirm: handleMintConfirm,
        onCancel: popup.closePopup
      });
    }
  
    if (!isConnected) {
      return (
        <></>
      );
    }

  return (
    <Button onClick={handleMintClick} className={className}>{children}</Button>
  );
};
