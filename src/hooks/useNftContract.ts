import { useCallback, useEffect, useState } from "react";
import { PriceLockNftItem } from "../contracts/PriceLockNftItem";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, fromNano, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { shortenAddress } from "../utils/formattingUtils";
import { sleep } from "../utils/controlUtils";
import { useSharedState, LockValues } from "../context/SharedStateContext";

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
  const { value: sharedState, setValue: setSharedState } = useSharedState();
  
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
  
  const index = contractData?.index;
  const balanceNum = balance !== null ? Number(balance) : undefined;
  const currentUsdtValue = (balanceNum !== undefined && sharedState.lpPrice !== undefined) ? (balanceNum * sharedState.lpPrice) : undefined;
  const targetUsdtValue = (balanceNum !== undefined && contractData?.targetPrice !== undefined) ? (balanceNum * contractData.targetPrice) : undefined;

  useEffect(() => {
    if (index === undefined || balanceNum === undefined || currentUsdtValue === undefined || targetUsdtValue === undefined) {
      return;
    }

    const mapOfValues = sharedState.locks ?? new Map<number, LockValues>();
    mapOfValues.set(index, {
      tonBalance: balanceNum,
      usdtValue: currentUsdtValue,
      targetUsdtValue: targetUsdtValue
    });

    setSharedState({
      ...sharedState,
      locks: mapOfValues
    })
  // we change only locks and only one at a time, so we don't need to update on sharedState change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, balanceNum, currentUsdtValue, targetUsdtValue]);

  const isAvailableToWithdraw = (contractData?.targetPrice !== undefined) 
                              && (sharedState.lpPrice !== undefined) 
                              && (sharedState.lpPrice >= contractData.targetPrice);

  return {
    contractAddress: shortenAddress(lockContract?.address.toString()),
    contractAddressFull: lockContract?.address.toString(),
    contractBalance: balance,
    index: index,
    isInitialized: contractData?.initialized,
    targetPrice: contractData?.targetPrice,
    targetUsdtValue: targetUsdtValue,
    isConnected: connected,
    isActive: isActive,
    isAvailableToWithdraw: isAvailableToWithdraw,
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
