import { useCallback, useContext, useEffect, useState } from "react";
import { PriceLockMinter } from "../contracts/PriceLockMinter";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, Cell, fromNano, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { shortenAddress } from "../utils/formattingUtils";
import { ADDRESSES } from "../utils/addresses";
import { sleep } from "../utils/controlUtils";
import { NetworkContext } from "../context/NetworkContext";

export type MinterData = {
  royaltyParam: bigint;
  lpAddress: Address;
  isUsdtFirst: boolean;
  content: string;
  contentRaw: Cell;
  owner: Address | null;
};

export function useMinterContract() {
  const network = useContext(NetworkContext);
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();

  const [contractData, setContractData] = useState<null | MinterData>();
  const [balance, setBalance] = useState<null | string>(null);

  const minterContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const address = Address.parse(ADDRESSES[network].minter_contract);
    const contract = new PriceLockMinter(address);
    return tonClient.open(contract) as OpenedContract<PriceLockMinter>;
  }, [tonClient]);

  const updateContractData = useCallback(async () => {
    if (!minterContract) {
      return;
    }

    setContractData(null);
    setBalance(null);
    const data = await minterContract.getContractData().catch(e => { 
      console.error('useMinterContract: getContractData error: ' + e);
      sleep(5000).then(updateContractData);
      throw e;
    });
    let ownerAddress = null;
    let balance = null;
    const ownerAndBalance = await minterContract.getOwnerAndBalance().catch(e => { 
      console.error('useMinterContract: getOwnerAndBalance error: ' + e);
      sleep(5000).then(updateContractData);
      throw e;
    });
    if (ownerAndBalance) {
      ownerAddress = ownerAndBalance.owner;
      balance = fromNano(ownerAndBalance.balance);
    }
    setContractData({
      ...data,
      owner: ownerAddress
    });
    setBalance(balance);
  }, [minterContract]);

  useEffect(() => {
    updateContractData();
  }, [minterContract, updateContractData]);

  return {
    contractAddress: shortenAddress(minterContract?.address.toString()),
    contractAddressFull: minterContract?.address.toString(),
    contractBalance: balance,
    contractData: contractData,
    isConnected: connected,
    isOwner: (sender?.address !== undefined) && (sender.address.toString() == contractData?.owner?.toString()),
    sendMint: async(targetPrice: number, value: number) => {
      if (minterContract == null) {
        return;
      }

      const realValue = toNano(value);
      const txValue = await minterContract.getTxValueForNftValue(realValue);
      return minterContract.sendMint(sender, txValue, targetPrice, realValue);
    },
    sendCollectProfits: async() => {
      if (minterContract == null || contractData?.owner == null) {
        return;
      }
      return minterContract.sendCollectProfits(sender);
    },
    refresh: async() => {
      updateContractData();
    }
  }
}
