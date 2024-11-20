import { useEffect, useState } from "react";
import { PriceLockNftCollection } from "../contracts/PriceLockNftCollection";
import { useTonClient, Network } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { Address, OpenedContract } from "@ton/core";
import { useTonConnect } from "./useTonConnect";
import { ADDRESSES } from "../addresses";
import { shortenAddress } from "../utils/formattingUtils";

export type CollectionData = {
  nextItemId: number;
  collectionContent: string;
  ownerAddress: string;
  minterAddress: string;
};

export function useCollectionContract(network: Network = "testnet") {
  const tonClient = useTonClient(network);
  const { sender } = useTonConnect();

  const [contractData, setContractData] = useState<null | CollectionData>();

  const collectionContract = useAsyncInitialize(async () => {
    if (!tonClient) {
      return;
    }

    const address = Address.parse(ADDRESSES.testnet.collection_contract);
    const contract = new PriceLockNftCollection(address);
    return tonClient.open(contract) as OpenedContract<PriceLockNftCollection>;
  }, [tonClient]);

  async function updateContractData() {
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
  }

  useEffect(() => { 
    updateContractData();
  }, [collectionContract]);

  return {
    contractAddress: shortenAddress(collectionContract?.address.toString()),
    contractAddressFull: collectionContract?.address.toString(),
    contractData: contractData,
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
