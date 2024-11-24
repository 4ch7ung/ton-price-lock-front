import { useEffect, useState } from "react";
import { PriceLockMinter } from "../contracts/PriceLockMinter";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, Cell, fromNano, OpenedContract, toNano } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { shortenAddress } from "../utils/formattingUtils";
import { ADDRESSES } from "../addresses";
import { Network } from "../utils/types";

export type MinterData = {
  royaltyParam: bigint;
  lpAddress: Address;
  isUsdtFirst: boolean;
  content: string;
  contentRaw: Cell;
  owner: Address | null;
};

export function useMinterContract(network: Network = "testnet") {
  const tonClient = useTonClient(network);
  const { sender } = useTonConnect();

  const [contractData, setContractData] = useState<null | MinterData>();

  const [balance, setBalance] = useState<null | string>(null);

  const minterContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const address = Address.parse(ADDRESSES.testnet.minter_contract);
    const contract = new PriceLockMinter(address);
    return tonClient.open(contract) as OpenedContract<PriceLockMinter>;
  }, [tonClient]);

  async function updateContractData() {
    if (!minterContract) {
      return;
    }

    setContractData(null);
    setBalance(null);
    const data = await minterContract.getContractData();
    let ownerAddress = null;
    let balance = null;
    const ownerAndBalance = await minterContract.getOwnerAndBalance();
    if (ownerAndBalance) {
      ownerAddress = ownerAndBalance.owner;
      balance = fromNano(ownerAndBalance.balance);
    }
    setContractData({
      ...data,
      owner: ownerAddress
    });
    setBalance(balance);
  }

  useEffect(() => { 
    updateContractData();
  }, [minterContract]);

  return {
    contractAddress: shortenAddress(minterContract?.address.toString()),
    contractAddressFull: minterContract?.address.toString(),
    contractBalance: balance,
    contractData: contractData,
    isOwner: sender?.address?.toString() == contractData?.owner?.toString(),
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
