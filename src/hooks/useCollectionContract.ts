import { useCallback, useEffect, useState } from "react";
import { PriceLockNftCollection } from "../contracts/PriceLockNftCollection";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { ADDRESSES } from "../utils/addresses";
import { shortenAddress } from "../utils/formattingUtils";

export type CollectionData = {
  nextItemId: number;
  collectionContent: string;
  ownerAddress: string;
  minterAddress: string;
};

export function useCollectionContract() {
  const tonClient = useTonClient();
  const { sender, connected } = useTonConnect();

  const [contractData, setContractData] = useState<null | CollectionData>();

  const collectionContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const address = Address.parse(ADDRESSES.testnet.collection_contract);
    const contract = new PriceLockNftCollection(address);
    return tonClient.open(contract) as OpenedContract<PriceLockNftCollection>;
  }, [tonClient]);

  const updateContractData = useCallback(async () => {
    if (!collectionContract) {
      return;
    }

    setContractData(null);
    const data = await collectionContract.getCollectionData();
    const minterAddress = await collectionContract.getMinterAddress();
    setContractData({ 
      ...data,
      ownerAddress: data.ownerAddress.toString(),
      minterAddress: minterAddress.toString()
    });
  }, [collectionContract]);

  useEffect(() => {
    updateContractData();
  }, [collectionContract, updateContractData]);

  return {
    contractAddress: shortenAddress(collectionContract?.address.toString()),
    contractAddressFull: collectionContract?.address.toString(),
    contractData: contractData,
    isConnected: connected,
    sendChangeOwner: async(newOwner: string) => {
      const newOwnerAddress = Address.parse(newOwner);
      return collectionContract?.sendChangeOwner(sender, newOwnerAddress);
    },
    sendChangeMinter: async(newMinter: string) => {
      const newMinterAddress = Address.parse(newMinter);
      return collectionContract?.sendChangeMinter(sender, newMinterAddress);
    },
    refresh: async() => {
      updateContractData();
    }
  }
}
