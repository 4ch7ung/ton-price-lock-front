import { useMinterContract } from '../hooks/useMinterContract';
import { CardHeader } from './card/CardHeader';
import { CardItem } from './card/CardItem';
import { CardItemWithButton } from './card/CardItemWithButton';

export function MinterContractCard() {

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
        buttonText="Deposit"
        buttonClick={() => {
          const valueText = prompt("Enter amount to deposit", "0");
          if (valueText === null || valueText == "") return;
          const targetPriceText = prompt("Enter target price", "0.00");
          if (targetPriceText === null || targetPriceText == "") return;

          const value = parseFloat(valueText);
          const targetPrice = parseFloat(targetPriceText);
          sendMint(targetPrice, value);
        }}
        showButton={isConnected}
      />
    </div>
  );
}