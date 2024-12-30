import { useState, useEffect } from "react";
import cn from "classnames";

import styles from "./styles.module.css";
import { useSharedState } from "../../context/SharedStateContext";
import { useTonClient } from "../../hooks/useTonClient";
import { useTonConnect } from "../../hooks/useTonConnect";
import { Address, fromNano } from "@ton/core";

type WalletProps = {
  type?: string;
};

export const Wallet: React.FC<WalletProps> = ({
  type = "ton",
}) => {
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();
  const { value } = useSharedState();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
      if (!tonClient || !connected || (sender.address === undefined)) {
        return;
      }
  
      const getBalance = async (address: Address) => {
        const balance = await tonClient.getBalance(address);
        const value = Number(fromNano(balance));
        setBalance(value);
      };
  
      getBalance(sender.address);
  }, [connected, tonClient, sender.address]);

  return (
    <div className={cn(styles.wallet, styles[type])}>
      <div className={styles.row}>
        <span className={styles.balance}>{(balance * (value?.lpPrice || 0)).toFixed(2)} USDT</span>
        <span className={styles.opacity}>
          {(value.lpPrice || 0).toFixed(2)}$
        </span>
      </div>
      <div className={styles.opacity}>
        {balance.toFixed(3)} {type.toUpperCase()}
      </div>
    </div>
  );
};
