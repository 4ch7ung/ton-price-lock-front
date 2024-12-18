import { useEffect, useState } from "react";
import { useTonClient } from "../hooks/useTonClient";
import { useTonConnect } from "../hooks/useTonConnect";
import { Address, fromNano } from "@ton/core";
import { CardHeader } from "./card/CardHeader";
import { CardItem } from "./card/CardItem";
import { useSharedState } from "../context/SharedStateContext";

export function BalanceCard() {
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();
  const { value: sharedState } = useSharedState();
  
  const [balance, setBalance] = useState<null | string>(null);
  const [totalLocked, setTotalLocked] = useState<null | string>(null);
  const [totalValue, setTotalValue] = useState<null | string>(null);
  const [totalValueUnlocked, setTotalValueUnlocked] = useState<null | string>(null);

  const locks = sharedState.locks;

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

  useEffect(() => {
    if (!locks) {
      return;
    }

    let totalLocked = 0;
    let totalValue = 0;
    let totalValueUnlocked = 0;
    locks.forEach(lock => {
      totalLocked += lock.tonBalance;
      totalValue += lock.usdtValue;
      totalValueUnlocked += lock.targetUsdtValue;
    });
    setTotalLocked(totalLocked.toFixed(2) + " TON");
    setTotalValue(totalValue.toFixed(0) + " USDT");
    setTotalValueUnlocked(totalValueUnlocked.toFixed(0) + " USDT");
  }, [locks]);

  if (!connected) {
    return <></>;
  }

  return (
  <div className="card">
    <CardHeader title="Balance" />
    <CardItem
      title="TON balance"
      text={balance ?? "null"}
    />
    <CardItem
      title="Total Locked TON"
      text={totalLocked ?? "null"}
    />
    <CardItem
      title="Total current value"
      text={totalValue ?? "null"}
    />
    <CardItem
      title="Total value when unlocked"
      text={totalValueUnlocked ?? "null"}
    />
  </div>
  );
}