import { useState, useEffect } from "react";
import { Address, fromNano } from "@ton/ton";
import { singletonHook } from 'react-singleton-hook';
import { useTonConnect } from "./useTonConnect";
import { useTonClient } from "./useTonClient";

export function useBalance() {
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();
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

  return [balance];
}

export const useBalance2 = singletonHook(null, useBalance);
// export const useTonClient = _useTonClient;