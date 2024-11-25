import { useTonConnectUI } from "@tonconnect/ui-react";
import { Address, Sender, SenderArguments } from "@ton/core";
import { useEffect, useState } from "react";

export function useTonConnect(): { sender: Sender, connected: boolean } {
  const [tonConnectUI] = useTonConnectUI();

  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setConnected(tonConnectUI.connected);
    return tonConnectUI.onStatusChange((wallet) => {
      const isConnected = wallet !== null;
      setConnected(isConnected);
    });
  }, [tonConnectUI]);

  const addressRaw = tonConnectUI.account?.address;
  let address: Address | undefined = undefined;
  if (addressRaw != null) {
    address = Address.parse(addressRaw);
  }
  
  return {
    sender: {
      address: address,
      send: async (args: SenderArguments) => {
        tonConnectUI.sendTransaction({
          messages: [
            {
              address: args.to.toString(),
              amount: args.value.toString(),
              payload: args.body?.toBoc().toString("base64"),
            },
          ],
          validUntil: Date.now() + 5 * 60 * 1000, // 5 minutes
        })
      }
    },
    connected: connected
  };
}