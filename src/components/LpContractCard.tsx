import { useLPContract } from '../hooks/useLPContract';
import { fromNano } from '@ton/core';
import { CardHeader } from './card/CardHeader';
import { CardItem } from './card/CardItem';
import { CardItemWithButton } from './card/CardItemWithButton';

export function LpContractCard() {
  const {
    contractAddress: lpContractAddress,
    contractAddressFull: lpContractAddressFull,
    contractData: lpContractData,
    contractPrice: lpContractPrice,
    isConnected,
    refresh: getPoolData,
    changeLPPrice
  } = useLPContract();
  
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
      buttonClick={() => {
        const newPrice = prompt("Enter new price", lpContractPrice.toFixed(2));
        if (newPrice === null || newPrice == "") return;
        else {
          const price = parseFloat(newPrice);
          changeLPPrice(price);
        }
      }}
      showButton={isConnected}
    />
  </div>
  );
}