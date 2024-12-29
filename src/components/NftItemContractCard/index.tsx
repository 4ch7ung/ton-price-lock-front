import { useNftContract } from "../../hooks/useNftContract";
import { CardHeader } from "./../card/CardHeader";
import { CardItem } from "./../card/CardItem";
import { CardItemWithButton } from "./../card/CardItemWithButton";
import { useInputPopup } from "../../context/InputPopupContext";
import { Lock } from "@gravity-ui/icons";

import styles from "./styles.module.css";
import { CopyButton } from "../CopyButton";
import { Button } from "../../shared/Button";

export function NftItemContractCard({ nftAddress }: { nftAddress: string }) {
  const popup = useInputPopup();

  const {
    contractAddress,
    contractAddressFull,
    contractBalance,
    currentUsdtValue,
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
      onCancel: popup.closePopup,
    });
  };

  if (!isActive) {
    return <></>;
  }

  if (index === undefined) {
    return (
      <div className={styles.wrapper}>
        NFT contract loading...
        <br />
        {contractAddress}
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className={styles.wrapper}>
        {"Uinitialized NFT " + index}
        <br />
        {contractAddress}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.info}>
        <div className={styles.leftColumn}>
          <div className={styles.price}>
            {(isAvailableToWithdraw
              ? targetUsdtValue
              : currentUsdtValue
            )?.toFixed(3)}{" "}
            USDT
          </div>
          <div className={styles.count}>{contractBalance} TON</div>

          <div className={styles.address}>
            {contractAddress}{" "}
            <CopyButton
              onClick={() => {
                navigator.clipboard.writeText(contractAddressFull ?? "");
              }}
            />
          </div>
        </div>
        <div className={styles.rightColumn}>
          <img
            src="https://4ch7ung.github.io/ton-price-lock-front/nft/item.jpg"
            alt="token"
            className={styles.image}
          />
        </div>
      </div>

      <hr className={styles.delimiter} />

      <div className={styles.buttons}>
        <Button className={styles.button} onClick={handleDepositClick}>
          Top Up
        </Button>
        <Button
          className={styles.button}
          onClick={sendWithdraw}
          active={isConnected && isAvailableToWithdraw}
          disabled={!(isConnected && isAvailableToWithdraw)}
        >
          <span className={styles.buttonText}>
            {!(isConnected && isAvailableToWithdraw) && <Lock />}
            Withdraw
            {isConnected && isAvailableToWithdraw && " 🎉"}
          </span>
        </Button>
      </div>

      {targetPrice && (
        <div className={styles.condition}>
          Withdrawal possible when TON rate reaches unlock price: 1 TON ={" "}
          {targetPrice.toFixed(3)} USDT
        </div>
      )}

      {/* <CardItem
        title="Address"
        text={contractAddress}
        copyButtonClick={() =>
          navigator.clipboard.writeText(contractAddressFull ?? "")
        }
      /> */}
      {/* {contractBalance !== null && (
        <CardItemWithButton
          title="Value"
          text={contractBalance}
          buttonText="Deposit"
          buttonClick={handleDepositClick}
          showButton={isConnected}
        />
      )} */}
      {/* {targetUsdtValue !== undefined && (
        <CardItem
          title="Target USDT value"
          text={targetUsdtValue.toFixed(2) + " USDT"}
        />
      )}
      {targetPrice !== undefined && (
        <CardItemWithButton
          title="Target price"
          text={"1 TON = " + targetPrice.toFixed(2) + " USDT"}
          buttonText="Claim"
          buttonClick={sendWithdraw}
          showButton={isConnected && isAvailableToWithdraw}
        /> */}
      {/* )} */}
    </div>
  );
}
