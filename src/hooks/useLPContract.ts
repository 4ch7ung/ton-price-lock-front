import { useCallback, useContext, useEffect, useState } from "react";
import { LPMockContract } from "../contracts/LPMockContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { ADDRESSES } from "../utils/addresses";
import { shortenAddress } from "../utils/formattingUtils";
import { sleep } from "../utils/controlUtils";
import { useSharedState } from "../context/SharedStateContext";
import { NetworkContext } from "../context/NetworkContext";

export type LPContractData = {
  reserve0: bigint,
  reserve1: bigint,
  token0_address: Address,
  token1_address: Address,
  lp_fee: bigint,
  protocol_fee: bigint,
  ref_fee: bigint,
  protocol_fee_address: Address,
  collected_token0_protocol_fee: bigint,
  collected_token1_protocol_fee: bigint
};

export function useLPContract() {
  const network = useContext(NetworkContext);
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();
  const { value: sharedState, setValue: setSharedState } = useSharedState();

  const [contractData, setContractData] = useState<null | LPContractData>();

  const lpContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const address = Address.parse(ADDRESSES[network].lp_contract);
    const contract = new LPMockContract(address);
    return tonClient.open(contract) as OpenedContract<LPMockContract>;
  }, [tonClient]);

  const getValue = useCallback(async () => {
    if (!lpContract) return;
    setContractData(null);
    const data = await lpContract.getPoolData().catch(e => { 
      console.error('useLPContract: getPoolData error: ' + e);
      sleep(5000).then(getValue);
      return null;
    });
    setContractData(data);
  }, [lpContract]);

  useEffect(() => {
    getValue();
  }, [lpContract, getValue]);

  const contractPrice = Number(contractData?.reserve0 ?? 0) / (Number(contractData?.reserve1 ?? 1) / 1000);

  useEffect(() => {
    setSharedState({ ...sharedState, lpPrice: contractPrice });
    // we change only lpPrice, so we don't need to update on sharedState change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contractPrice]);

  return {
    contractAddress: shortenAddress(lpContract?.address.toString()),
    contractAddressFull: lpContract?.address.toString(),
    contractData: contractData,
    contractPrice: contractPrice,
    refresh: async() => {
      getValue();
    },
    canChangeLPPrice: network === 'testnet' && connected,
    changeLPPrice: async(price: number) => {
      if (lpContract == null || contractData == null) return;
      const reserve0 = contractData.reserve0;
      const reserve1 = BigInt(Math.round(Number(reserve0) / price * 1000));
      console.log('changeLPPrice ' + price + ', reserve0 ' + reserve0 + ', reserve1 ' + reserve1);
      return lpContract?.sendSetReservesMessage(sender, reserve0, reserve1);
    }
  }
}
