import { useInputPopup } from '../context/InputPopupContext';
import { useMinterContract } from '../hooks/useMinterContract';
import { BigCardButton } from './card/BigCardButton';
import { CardHeader } from './card/CardHeader';
import { CardItem } from './card/CardItem';
import { CardItemWithButton } from './card/CardItemWithButton';

export function MinterContractCard() {

  const popup = useInputPopup();

  const {
    contractAddress,
    contractAddressFull,
    contractBalance,
    isConnected,
    isOwner,
    refresh: getMinterData,
    sendMint,
    sendCollectProfits
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
      placeholder: 'Enter target price',
      secondPlaceholder: 'Enter deposit amount',
      confirmButtonText: 'Create',
      onConfirm: handleMintConfirm,
      onCancel: popup.closePopup
    });
  }

  if (!isConnected) {
    return (
      <></>
    );
  }

  if (isConnected && isOwner) {
    return (
      <BigCardButton
          title="Create Lock"
          onClick={handleMintClick}
      />
    );
  }
  
  // isConnected && isOwner
  return (
    <div className="card"> 
      <CardHeader title="Minter contract" onRefresh={getMinterData} />
      <CardItem 
        title="Address" 
        text={contractAddress} 
        copyButtonClick={() => navigator.clipboard.writeText(contractAddressFull ?? "") } 
      />
      <CardItemWithButton
        title="Balance"
        text={(contractBalance ?? "null") + " TON"}
        buttonText="Collect"
        buttonClick={sendCollectProfits}
        showButton={isConnected && isOwner}
      />
      <CardItemWithButton
        title=""
        text=""
        buttonText="Create Lock"
        buttonClick={handleMintClick}
        showButton={isConnected}
      />
    </div>
  );
}