import { useTonConnectModal } from "@tonconnect/ui-react";

import { useMinterContract } from "../../hooks/useMinterContract";
import { Modal } from "../Modal";

import { Button } from "../../shared/Button";
import { useState } from "react";

import styles from "./styles.module.css";
import { InputNumber } from "../../shared/InputNumber";
import { useBalance } from "../../hooks/useBalance";

export const NFTCreateButton = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open } = useTonConnectModal();
  const [modalVisible, setModalVisible] = useState(false);
  const [target, setTarget] = useState("");
  const [amount, setAmount] = useState("");

  const { isConnected, sendMint } = useMinterContract();
  const [balance] = useBalance();

  const handleMintClick = () => {
    if (!isConnected) {
      open();
      return;
    }

    setModalVisible(true);
  };

  const handleConfirm = () => {
    if (target.trim() === "" || amount.trim() === "") return;
    const targetPriceNumber = Number(target);
    const valueNumber = Number(amount);
    if (isNaN(targetPriceNumber) || isNaN(valueNumber)) {
      alert("Please enter a valid number");
      return;
    }
    sendMint(targetPriceNumber, valueNumber).finally(() => {
      setModalVisible(false);
    });
  };

  const price = Number(target) * Number(amount);

  const Title = (
    <>
      <div className={styles.sum}>{price.toFixed(2)} USDT</div>
      {/* <div>{Number(target) * Number(amount)} USDT</div> */}
    </>
  )

  return (
    <>
      <Modal
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible((state) => !state);
        }}
        title={Title}
        footer={
          <div className={styles.buttonRow}>
          <Button className={styles.button} onClick={handleConfirm} disabled={price === 0}>
            Create NFT {price > 0 && `(value ${price.toFixed(2)} USDT)`}
          </Button>
          <div className={styles.imp}>
            <div className={styles.impHeader}>IMPORTANT: </div>
            <div className={styles.impText}>This NFT is created autonomously on a smart-contract and only it’s owner has access to these funds. This NFT you can garantued exchange when TON’s rate will reach {Number(target) > 0 ? `${target} USDT` : 'your target rate'}. You can send this NFT to anyone else using TON wallet</div>
          </div>
        </div>
        }
      >
        <div>
          <InputNumber
            placeholder="Target rate"
            currency="USDT"
            value={target}
            onChange={(value) => setTarget(value)}
          />
          <InputNumber
            placeholder="Deposit amount"
            currency="TON"
            maxValue={balance}
            value={amount}
            onChange={(value) => setAmount(value)}
          />

          <div className={styles.remaining}>Remaining: {balance.toFixed(3)} TON</div>
        </div>
      </Modal>
      <Button onClick={handleMintClick} className={className}>
        {children}
      </Button>
    </>
  );
};
