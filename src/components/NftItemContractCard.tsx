import { useNftContract } from "../hooks/useNftContract";
import { CardHeader } from "./card/CardHeader";
import { CardItem } from "./card/CardItem";
import { CardItemWithButton } from "./card/CardItemWithButton";
import { useInputPopup } from "../context/InputPopupContext";

export function NftItemContractCard({ nftAddress }: { nftAddress: string }) {

  const popup = useInputPopup();

  const {
    contractAddress,
    contractAddressFull,
    contractBalance,
    index,
    isInitialized,
    targetPrice,
    targetUsdtValue,
    isConnected,
    isActive,
    isAvailableToWithdraw,
    sendDeposit,
    sendWithdraw,
  } = useNftContract(nftAddress);

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

  if (index === undefined) {
    return (
      <div className="card">
        <CardHeader title="NFT contract loading..." />
        <CardItem title="Address" text={contractAddress} />
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="card">
        <CardHeader title={"Uinitialized NFT " + index} />
        <CardItem title="Address" text={contractAddress} />
      </div>
    );
  }

  return (
    <div className="card">
      <CardHeader title={"#" + (index) + ": Unlocks on " + (targetPrice?.toFixed(2) ?? "null")} />
      <CardItem 
        title="Address" 
        text={contractAddress} 
        copyButtonClick={() => navigator.clipboard.writeText(contractAddressFull ?? "") } 
      />
      {contractBalance !== null && 
      <CardItemWithButton
        title="Value"
        text={contractBalance}
        buttonText="Deposit"
        buttonClick={handleDepositClick}
        showButton={isConnected}
      />
      }
      {targetUsdtValue !== undefined &&
      <CardItem
        title="Target USDT value"
        text={targetUsdtValue.toFixed(2) + " USDT"}
      />
      }
      {targetPrice !== undefined &&
      <CardItemWithButton 
        title="Target price" 
        text={"1 TON = " + targetPrice.toFixed(2) + " USDT"} 
        buttonText="Claim" 
        buttonClick={sendWithdraw}
        showButton={isConnected && isAvailableToWithdraw}
      />
      }
    </div>
  );
}