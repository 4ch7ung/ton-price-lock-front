import { useEffect, useState } from "react";
import { Address, fromNano } from "@ton/core";
import { useTonClient } from "../../hooks/useTonClient";
import { useTonConnect } from "../../hooks/useTonConnect";
import { useSharedState } from "../../context/SharedStateContext";
import { Lock } from "@gravity-ui/icons";

import styles from "./styles.module.css";

export function Summary() {
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();
  const { value: sharedState } = useSharedState();

  const [balance, setBalance] = useState<number>(0);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [totalValueLocked, setTotalValueLocked] = useState<number>(0);
  const [totalValueUnlocked, setTotalValueUnlocked] = useState<number>(0);

  // const locks = sharedState.locks;

  useEffect(() => {
    if (!tonClient || !connected || sender.address === undefined) {
      return;
    }

    const getBalance = async (address: Address) => {
      const balance = await tonClient.getBalance(address);
      const value = Number(fromNano(balance));
      setBalance(value);
    };

    getBalance(sender.address);
  }, [connected, tonClient, sender.address]);

  useEffect(() => {
    if (!sharedState.locks) {
      return;
    }

    let totalValue = 0;
    let totalValueUnlocked = 0;
    let totalValueLocked = 0;
    sharedState.locks.forEach((lock) => {
      totalValue += lock.isAvailableToWithdraw
        ? lock.targetUsdtValue
        : lock.usdtValue;
      totalValueLocked += !lock.isAvailableToWithdraw ? lock.usdtValue : 0;
      totalValueUnlocked += lock.isAvailableToWithdraw
        ? lock.targetUsdtValue
        : 0;
    });

    setTotalValue(totalValue);
    setTotalValueLocked(totalValueLocked);
    setTotalValueUnlocked(totalValueUnlocked);
  }, [sharedState]);

  if (!connected) {
    return <></>;
  }

  return (
    <div>
      <h2 className={styles.header}>Total</h2>
      <div className={styles.total}>
        {((balance || 0) * (sharedState.lpPrice || 0) + totalValue).toFixed(3)}{" "}
        USDT
      </div>
      <div className={styles.locked}>
        <Lock />
        <span>Locked: {totalValueLocked.toFixed(3)} USDT</span>
      </div>
      <div className={styles.available}>
        Available now:{" "}
        {(
          (balance || 0) * (sharedState.lpPrice || 0) +
          totalValueUnlocked
        ).toFixed(3)}{" "}
        USDT
      </div>
    </div>
  );
}
