import { useAsyncInitialize } from "./useAsyncInitialize";
import { getHttpEndpoint, Network as OrbsNetwork } from "@orbs-network/ton-access";
import { TonClient } from "@ton/ton";

export type Network = OrbsNetwork;

export function useTonClient(network: OrbsNetwork = "testnet") {
  return useAsyncInitialize(async () => {
    return new TonClient({
      endpoint: await getHttpEndpoint({ network: network }),
    });
  });
}