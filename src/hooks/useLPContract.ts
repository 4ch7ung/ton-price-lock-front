import { useEffect, useState } from "react";
import { LPContract } from "../contracts/LPContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { ADDRESSES } from "../addresses";

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
  const tonClient = useTonClient();
  const { sender } = useTonConnect();

  const [contractData, setContractData] = useState<null | LPContractData>();

  const lpContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const address = Address.parse(ADDRESSES.testnet.lp_contract);
    const contract = new LPContract(address);
    return tonClient.open(contract) as OpenedContract<LPContract>;
  }, [tonClient]);

  useEffect(() => {
    async function getValue() {
      if (!lpContract) {
        return;
      }

      setContractData(null);
      const data = await lpContract.getPoolData();
      setContractData(data);
    }
    getValue();
  }, [lpContract]);

  return {
    contract_address: lpContract?.address.toString(),
    contract_data: contractData,
    getPoolData: async() => {
      if (lpContract == null) return;
      setContractData(null);
      const data = await lpContract.getPoolData();
      setContractData(data);
    },
    sendSetReserves: async(reserve0: bigint, reserve1: bigint) => {
      return lpContract?.sendSetReservesMessage(sender, reserve0, reserve1);
    }
  }
}
