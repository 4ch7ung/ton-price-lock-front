import { useAsyncInitialize } from "./useAsyncInitialize";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";
import { useContext } from "react";
import { NetworkContext } from "../services/NetworkContext";

export function useTonClient() {
  const network = useContext(NetworkContext);
  return useAsyncInitialize(async () => {
    return new TonClient({
      endpoint: await getHttpEndpoint({ network: network }),
    });
  });
}