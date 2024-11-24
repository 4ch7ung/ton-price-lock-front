import { useEffect, useState } from "react";
import { PriceLockNftItem } from "../contracts/PriceLockNftItem";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, fromNano, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { shortenAddress } from "../utils/formattingUtils";
import { Network } from "../utils/types";

export type LockContractData = {
  initialized: boolean,
  index: number,
  collectionAddress: Address,
  ownerAddress?: Address,
  targetPrice?: number,
  lpConfig?: {
    contractAddress: Address,
    isUsdtFirst: boolean
  },
  content?: string
};

export function useNftContract(network: Network = "testnet", address: string) {
  const tonClient = useTonClient(network);
  const { sender } = useTonConnect();

  const [contractData, setContractData] = useState<null | LockContractData>();

  const [balance, setBalance] = useState<null | string>(null);

  const lockContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const contractAddress = Address.parse(address);
    const contract = new PriceLockNftItem(contractAddress);
    return tonClient.open(contract) as OpenedContract<PriceLockNftItem>;
  }, [tonClient]);

  async function getValue() {
    if (!lockContract) {
      return;
    }

    setContractData(null);
    setBalance(null);
    const data = await lockContract.getContractData();
    const { value: balance } = await lockContract.getBalance();
    setContractData(data);
    setBalance(fromNano(balance));
  }

  useEffect(() => {
    getValue();
  }, [lockContract]);

  return {
    contractAddress: shortenAddress(lockContract?.address.toString()),
    contractAddressFull: lockContract?.address.toString(),
    contractBalance: balance,
    contractData: contractData,
    sendDeposit: async(value: number) => {
      return lockContract?.sendDepositMessage(sender, toNano(value));
    },
    sendWithdraw: async() => {
      return lockContract?.sendWithdrawMessage(sender);
    },
    refresh: async() => {
      getValue();
    }
  }
}
