import { useCallback, useEffect, useState } from "react";
import { PriceLockNftItem } from "../contracts/PriceLockNftItem";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, fromNano, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { shortenAddress } from "../utils/formattingUtils";
import { sleep } from "../utils/controlUtils";

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
  content?: string,
  contentRawBase64?: string
};

export function useNftContract(address: string) {
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();
  
  const [contractData, setContractData] = useState<null | LockContractData>();
  const [balance, setBalance] = useState<null | string>(null);
  const [isActive, setIsActive] = useState<boolean>(true);

  const lockContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const contractAddress = Address.parse(address);
    const contract = new PriceLockNftItem(contractAddress);
    return tonClient.open(contract) as OpenedContract<PriceLockNftItem>;
  }, [tonClient]);

  const getValue = useCallback(async () => {
    console.log('useNftContract: getValue');
    if (!lockContract || !isActive) {
      return;
    }

    setContractData(null);
    setBalance(null);
    const isActiveGet = await lockContract.getIsActive();
    if (!isActiveGet) {
      setIsActive(false);
      return;
    }
    const data = await lockContract.getContractData().catch(e => {
      console.error('useNftContract: getContractData error: ' + e);
      sleep(5000).then(getValue);
      throw e;
    });
    const { value: balance } = await lockContract.getBalance().catch(e => {
      console.error('useNftContract: getBalance error: ' + e);
      sleep(5000).then(getValue);
      throw e;
    });
    setContractData({
      ...data,
      contentRawBase64: data.contentRaw?.toBoc().toString("base64")
    });
    setBalance(fromNano(balance));
  }, [lockContract, isActive]);

  useEffect(() => {
    getValue();
  }, [lockContract, getValue, isActive]);

  return {
    contractAddress: shortenAddress(lockContract?.address.toString()),
    contractAddressFull: lockContract?.address.toString(),
    contractBalance: balance,
    contractData: contractData,
    isConnected: connected,
    isActive: isActive,
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
