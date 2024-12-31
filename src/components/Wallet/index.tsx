import cn from "classnames";

import styles from "./styles.module.css";
import { useSharedState } from "../../context/SharedStateContext";
import { useBalance } from "../../hooks/useBalance";

type WalletProps = {
  type?: string;
};

export const Wallet: React.FC<WalletProps> = ({ type = "ton" }) => {
  const { value } = useSharedState();
  const [balance] = useBalance();

  return (
    <div className={cn(styles.wallet, styles[type])}>
      <div className={styles.row}>
        <span className={styles.balance}>
          {(balance * (value?.lpPrice || 0)).toFixed(2)} USDT
        </span>
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
