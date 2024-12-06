import { useEffect, useState } from "react";
import { useTonClient } from "../hooks/useTonClient";
import { useTonConnect } from "../hooks/useTonConnect";
import { Address, fromNano } from "@ton/core";

export function ConnectedBalanceView() {
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();
  
  const [balance, setBalance] = useState<null | string>(null);

  useEffect(() => {
    if (!tonClient || !connected || (sender.address === undefined)) {
      return;
    }

    const getBalance = async (address: Address) => {
      const balance = await tonClient.getBalance(address);
      const value = Number(fromNano(balance)).toFixed(2) + " TON";
      setBalance(value);
    };

    getBalance(sender.address);
  }, [connected, tonClient, sender.address]);

  if (!connected) {
    return <></>;
  }

  return (
    <div style={{ marginLeft: 'auto', marginTop: '8px' }}>Your balance: {balance}</div>
  );
}