import { useAsyncInitialize } from "./useAsyncInitialize";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { Network } from "../utils/types";
import { TonClient } from "@ton/ton";

export function useTonClient(network: Network = "testnet") {
  return useAsyncInitialize(async () => {
    return new TonClient({
      endpoint: await getHttpEndpoint({ network: network }),
    });
  });
}