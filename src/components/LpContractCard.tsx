import { useLPContract } from '../hooks/useLPContract';
import { fromNano } from '@ton/core';
import { CardHeader } from './card/CardHeader';
import { CardItem } from './card/CardItem';
import { CardItemWithButton } from './card/CardItemWithButton';
import { useInputPopup } from '../context/InputPopupContext';

export function LpContractCard() {

  const popup = useInputPopup();

  const {
    contractAddress: lpContractAddress,
    contractAddressFull: lpContractAddressFull,
    contractData: lpContractData,
    contractPrice: lpContractPrice,
    refresh: getPoolData,
    canChangeLPPrice,
    changeLPPrice
  } = useLPContract();

  const handlePriceChangeConfirm = (newPrice: string) => {
    if (newPrice.trim() === "") return;
    const price = parseFloat(newPrice);
    if (isNaN(price)) {
      alert("Please enter a valid number");
      return;
    }
    changeLPPrice(price);
    popup.closePopup();
  }

  const handlePriceChangeClick = () => {
    if (popup.isOpen) {
      popup.closePopup();
      return;
    }
    
    popup.openPopup({
      title: 'Change LP price',
      placeholder: 'Enter new price',
      confirmButtonText: 'Change',
      onConfirm: handlePriceChangeConfirm,
      onCancel: popup.closePopup
    });
  }
  
  return (
    <div className="card">
    <CardHeader title="LP contract" onRefresh={getPoolData} />
    <CardItem
      title="Address"
      text={lpContractAddress}
      copyButtonClick={() => navigator.clipboard.writeText(lpContractAddressFull ?? "")}
    />
    <CardItem
      title="USDT Reserve"
      text={fromNano((lpContractData?.reserve0 ?? BigInt(0)) * BigInt(1000)) + " USDT"}
    />
    <CardItem
      title="TON Reserve"
      text={fromNano(lpContractData?.reserve1 ?? BigInt(0)) + " TON"}
    />
    <CardItemWithButton
      title="LP price"
      text={"1 TON = " + lpContractPrice.toFixed(2) + " USDT"}
      buttonText="Change"
      buttonClick={handlePriceChangeClick}
      showButton={canChangeLPPrice}
    />
  </div>
  );
}