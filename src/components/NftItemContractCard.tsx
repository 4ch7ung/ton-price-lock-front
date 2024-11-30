import { useEffect, useState } from "react";
import { useCollectionContract } from "../hooks/useCollectionContract";
import { useNftContract } from "../hooks/useNftContract";
import { CardHeader } from "./card/CardHeader";
import { CardItem } from "./card/CardItem";
import { CardItemWithButton } from "./card/CardItemWithButton";
import { useSharedState } from "../context/SharedStateContext";

export function NftItemContractCard({ nftAddress }: { nftAddress: string }) {

  const { value: sharedState } = useSharedState();

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

  const {
    getFullNftContent
  } = useCollectionContract();
  
  const [contentFull, setContentFull] = useState<string | undefined>(undefined);

  const nftIndex = contractData?.index;
  const contentRawBase64 = contractData?.contentRawBase64;

  useEffect(() => {
    console.log('NftItemContractCard: updateFullContent: isActive=' + isActive + ' nftIndex=' + nftIndex + ' contentRawBase64=' + contentRawBase64);
    async function updateFullContent() {
      if(!isActive || !nftIndex || !contentRawBase64) return;
      const newContentFull = await getFullNftContent(nftIndex, contentRawBase64);
      setContentFull(newContentFull);
    }
    updateFullContent();
  }, [isActive, nftIndex, contentRawBase64, getFullNftContent]);
  
  if (!isActive) {
    return (
      <></>
    );
  }

  if (!contractData) {
    return (
      <div className="card">
        <CardHeader title="NFT contract loading..." />
        <CardItem title="Address" text={contractAddress} />
      </div>
    );
  }

  if (!contractData.initialized) {
    return (
      <div className="card">
        <CardHeader title={"Uinitialized NFT " + contractData.index} />
        <CardItem title="Address" text={contractAddress} />
      </div>
    );
  }

  const isAvailableToWithdraw = (contractData.targetPrice !== undefined) 
                              && (sharedState.lpPrice !== undefined) 
                              && (sharedState.lpPrice >= contractData.targetPrice);

  return (
    <div className="card">
      <CardHeader title={"Unlocks on " + (contractData?.targetPrice?.toFixed(2) ?? "null")} />
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
      <CardItem title="Content" text={contentFull ?? "null"} />
      <CardItemWithButton 
        title="Target price" 
        text={"1 TON = " + (contractData?.targetPrice?.toFixed(2) ?? "null") + " USDT"} 
        buttonText="Withdraw" 
        buttonClick={sendWithdraw}
        showButton={isConnected && isAvailableToWithdraw}
      />
    </div>
  );
}