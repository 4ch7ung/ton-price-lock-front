import { useNftContract } from "../hooks/useNftContract";
import { CardHeader } from "./card/CardHeader";
import { CardItem } from "./card/CardItem";
import { CardItemWithButton } from "./card/CardItemWithButton";

export function NftItemContractCard({ nftAddress }: { nftAddress: string }) {

  const {
    contractAddress,
    contractAddressFull,
    contractBalance,
    contractData,
    isConnected,
    isActive,
    sendDeposit,
    sendWithdraw,
  } = useNftContract(nftAddress);

  if (!isActive) {
    return (
      <></>
    );
  }
  
  return (
    <div className="card">
      <CardHeader title={"NFT " + contractAddress} />
      <CardItem 
        title="Address" 
        text={contractAddress} 
        copyButtonClick={() => navigator.clipboard.writeText(contractAddressFull ?? "") } 
      />
      <CardItemWithButton 
        title="Balance" 
        text={contractBalance ?? "null"} 
        buttonText="Deposit" 
        buttonClick={() => {
          const valueText = prompt("Enter amount to deposit", "0");
          if (valueText === null || valueText == "") return;
          const deposit = Number(valueText);
          sendDeposit(deposit);
        }} 
        showButton={isConnected} 
      />
      <CardItem title="Content" text={contractData?.content ?? "null"} />
      <CardItemWithButton 
        title="Target price" 
        text={"1 TON = " + (contractData?.targetPrice?.toFixed(2) ?? "null") + " USDT"} 
        buttonText="Withdraw" 
        buttonClick={sendWithdraw}
        showButton={isConnected}
      />
    </div>
  );
}