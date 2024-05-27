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
      if (!lpContract) return;
      setContractData(null);
      const data = await lpContract.getPoolData();
      setContractData(data);
    }
    getValue();
  }, [lpContract]);

  const contractPrice = Number(contractData?.reserve0 ?? 0) / (Number(contractData?.reserve1 ?? 1) / 1000);

  return {
    contractAddress: lpContract?.address.toString(),
    contractData: contractData,
    contractPrice: contractPrice,
    refresh: async() => {
      if (lpContract == null) return;
      setContractData(null);
      const data = await lpContract.getPoolData();
      setContractData(data);
    },
    changeLPPrice: async(price: number) => {
      if (lpContract == null || contractData == null) return;
      var reserve0 = contractData.reserve0;
      const reserve1 = BigInt(Math.round(Number(reserve0) / price * 1000));
      return lpContract?.sendSetReservesMessage(sender, reserve0, reserve1);
    }
  }
}
