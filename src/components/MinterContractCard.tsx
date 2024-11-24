import { Network } from '../utils/types';
import { useMinterContract } from '../hooks/useMinterContract';
import { useTonConnect } from '../hooks/useTonConnect';
import { CardHeader } from './card/CardHeader';
import { CardItem } from './card/CardItem';
import { CardItemWithButton } from './card/CardItemWithButton';

export function MinterContractCard({ network }: { network: Network }) {
  const {
    contractAddress,
    contractAddressFull,
    contractBalance,
    isOwner,
    refresh: getMinterData,
    sendMint,
    sendCollectProfits
  } = useMinterContract(network);

  const { connected } = useTonConnect();
  
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
        text={contractBalance ?? "null" + " TON"}
        buttonText="Collect"
        buttonClick={sendCollectProfits}
        showButton={connected && isOwner}
      />
      <CardItemWithButton
        title=""
        text=""
        buttonText="Deposit"
        buttonClick={() => {
          const valueText = prompt("Enter amount to deposit", "0");
          if (valueText === null || valueText == "") return;
          const targetPriceText = prompt("Enter targer price", "0.00");
          if (targetPriceText === null || targetPriceText == "") return;

          const value = parseFloat(valueText);
          const targetPrice = parseFloat(targetPriceText);
          sendMint(targetPrice, value);
        }}
        showButton={connected}
      />
    </div>
  );
}