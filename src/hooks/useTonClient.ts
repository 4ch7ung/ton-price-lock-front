import { useContext, useState, useEffect } from "react";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { NetworkContext } from "../context/NetworkContext";
import { Network } from "../utils/types";
import { singletonHook } from 'react-singleton-hook';

// Глобальный объект для хранения клиентов
const tonClientCache: Record<string, TonClient> = {};

// Асинхронная функция для получения TonClient
async function getTonClient(network: Network): Promise<TonClient> {
  if (!tonClientCache[network]) {
    const endpoint = await getHttpEndpoint({ network });
    tonClientCache[network] = new TonClient({ endpoint });
  }
  return tonClientCache[network];
}

export function useTonClientHook() {
  const network = useContext(NetworkContext);
  const [client, setClient] = useState<TonClient | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeClient = async () => {
      const tonClient = await getTonClient(network);
      if (isMounted) {
        setClient(tonClient);
      }
    };

    initializeClient();

    return () => {
      isMounted = false;
    };
  }, [network]);

  return client;
}

export const useTonClient = singletonHook(null, useTonClientHook);
// export const useTonClient = _useTonClient;