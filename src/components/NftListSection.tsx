import { useEffect, useState } from "react";
import { ADDRESSES } from "../addresses";
import { useTonConnect } from "../hooks/useTonConnect";
import { ToncenterApi, NftItem } from "../services/ToncenterApi";
import { Network } from "../utils/types";
import { NftItemContractCard } from "./NftItemContractCard";

export function NftListSection({ network }: { network: Network }) {
  const api = new ToncenterApi(network);
  const { sender, connected } = useTonConnect();
  
  const [nfts, setNfts] = useState<null | NftItem[]>(null);

  async function getNfts() {
    if (!connected || !sender.address) {
      return;
    }
    setNfts(await api.getNftItems(sender.address, ADDRESSES[network].collection_contract));
  }

  useEffect(() => {
    getNfts();
  }, [connected, sender.address]);

  return (
    <>
      {nfts && nfts.map((nft) => (
        <NftItemContractCard network={network} nftAddress={nft.address} />
      ))}
    </>
  );
};