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
    async function updateFullContent() {
      if(!isActive || (nftIndex === undefined) || !contentRawBase64) {
        return;
      }
      const newContentFull = await getFullNftContent(nftIndex, contentRawBase64);
      setContentFull(newContentFull);
    }
    updateFullContent();
  // disabled
  }, [/* isActive, nftIndex, contentRawBase64, getFullNftContent */]);

  const [isInputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleDepositClick = () => {
    if (inputValue.trim() === "") return;
    const deposit = Number(inputValue);
    if (isNaN(deposit)) {
      alert("Please enter a valid number");
      return;
    }
    sendDeposit(deposit);
    setInputValue("");
    setInputVisible(false);
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
        buttonClick={() => { if (isInputVisible) { setInputVisible(false) } else { setInputVisible(true) } }}
        showButton={isConnected}
      />
      {isInputVisible && (
        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter amount to deposit"
            style={{ marginRight: "10px" }}
          />
          <button onClick={handleDepositClick}>Submit</button>
          <button onClick={() => setInputVisible(false)}>Cancel</button>
        </div>
      )}
      <CardItem
        title="Target USDT value"
        text={(contractBalance !== null && sharedState.lpPrice !== undefined) ? (Number(contractBalance) * sharedState.lpPrice).toFixed(2) + " USDT" : "null"}
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