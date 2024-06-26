import { useEffect, useState } from "react";
import { LockContract } from "../contracts/LockContract";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { ADDRESSES } from "../addresses";

export type LockContractData = {
  owner_address: Address,
  target_price: number,
  lp_address: Address,
  is_usdt_first: boolean
};

export function useLockContract() {
  const tonClient = useTonClient();
  const { sender } = useTonConnect();

  const [contractData, setContractData] = useState<null | LockContractData>();

  const [balance, setBalance] = useState<null | number>(null);

  const lockContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const address = Address.parse(ADDRESSES.testnet.lock_contract);
    const contract = new LockContract(address);
    return tonClient.open(contract) as OpenedContract<LockContract>;
  }, [tonClient]);

  useEffect(() => {
    async function getValue() {
      if (!lockContract) {
        return;
      }

      setContractData(null);
      const data = await lockContract.getData();
      const { value: balance } = await lockContract.getBalance();
      setContractData(data);
      setBalance(Number(balance));
    }
    getValue();
  }, [lockContract, tonClient]);

  return {
    contractAddress: lockContract?.address.toString(),
    contractBalance: balance,
    contractData: contractData,
    sendDeposit: async(value: number) => {
      return lockContract?.sendDepositMessage(sender, toNano(value));
    },
    sendWithdraw: async() => {
      return lockContract?.sendWithdrawMessage(sender);
    },
    sendDestroy: async() => {
      return lockContract?.sendDestroyMessage(sender);
    },
    refresh: async() => {
      if (lockContract == null) {
        return;
      }

      setContractData(null);
      const data = await lockContract.getData();
      const { value: balance } = await lockContract.getBalance();
      setContractData(data);
      setBalance(Number(balance));
    }
  }
}
