import { useContext } from "react";

import { TonConnectButton } from "@tonconnect/ui-react";
import WebApp from "@twa-dev/sdk";
import { Logo } from "../../shared/logo";
import { NetworkContext } from "../../context/NetworkContext";

import styles from "./styles.module.css";

type Props = {
  isInTWA?: boolean;
};

export const Header = ({ isInTWA }: Props) => {
  const network = useContext(NetworkContext);
  const isTestnet = network === 'testnet';

  return (
    <header className={styles.header}>
      <Logo />
      {isTestnet && (
        <b style={{ marginLeft: "auto", color: "#f00" }}>
          TESTNET{isInTWA ? " - " + WebApp.platform : ""}
        </b>
      )}
      <TonConnectButton className={styles.tonConnectButton} />
    </header>
  );
};
