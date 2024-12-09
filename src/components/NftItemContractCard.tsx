import { useEffect, useState } from "react";
import { useCollectionContract } from "../hooks/useCollectionContract";
import { useNftContract } from "../hooks/useNftContract";
import { CardHeader } from "./card/CardHeader";
import { CardItem } from "./card/CardItem";
import { CardItemWithButton } from "./card/CardItemWithButton";
import { useSharedState } from "../context/SharedStateContext";
import { useInputPopup } from "../context/InputPopupContext";

export function NftItemContractCard({ nftAddress }: { nftAddress: string }) {

  const popup = useInputPopup();
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
    async function updateFullContent() {
      if(!isActive || (nftIndex === undefined) || !contentRawBase64 || (contentFull !== undefined)) {
        return;
      }
      const newContentFull = await getFullNftContent(nftIndex, contentRawBase64);
      setContentFull(newContentFull);
    }
    updateFullContent();
  // disabled
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [/* isActive, nftIndex, contentRawBase64, getFullNftContent */]);

  const handleDepositConfirm = (inputValue: string) => {
    if (inputValue.trim() === "") return;
    const deposit = Number(inputValue);
    if (isNaN(deposit)) {
      alert("Please enter a valid number");
      return;
    }
    sendDeposit(deposit);
    popup.closePopup();
  };

  const handleDepositClick = () => {
    if (popup.isOpen) {
      popup.closePopup();
      return;
    }
    
    popup.openPopup({
      title: "Deposit",
      placeholder: "Enter amount to deposit",
      confirmButtonText: "Deposit",
      onConfirm: handleDepositConfirm,
      onCancel: popup.closePopup
    });
  };

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
        title="Value"
        text={contractBalance ?? "null"}
        buttonText="Deposit"
        buttonClick={handleDepositClick}
        showButton={isConnected}
      />
      <CardItem
        title="Target USDT value"
        text={(contractBalance !== null && contractData.targetPrice !== undefined) ? (Number(contractBalance) * contractData.targetPrice).toFixed(2) + " USDT" : "null"}
      />
      <CardItemWithButton 
        title="Target price" 
        text={"1 TON = " + (contractData?.targetPrice?.toFixed(2) ?? "null") + " USDT"} 
        buttonText="Claim" 
        buttonClick={sendWithdraw}
        showButton={isConnected && isAvailableToWithdraw}
      />
    </div>
  );
}