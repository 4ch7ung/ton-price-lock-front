import { useContext, useEffect, useState } from "react";
import { ADDRESSES } from "../utils/addresses";
import { useTonConnect } from "../hooks/useTonConnect";
import { ToncenterApi, NftItem } from "../services/ToncenterApi";
import { NftItemContractCard } from "./NftItemContractCard";
import { NetworkContext } from "../services/NetworkContext";

export function NftListSection() {
  const network = useContext(NetworkContext);
  const { sender, connected } = useTonConnect();
  
  const [nfts, setNfts] = useState<null | NftItem[]>(null);

  useEffect(() => {
    console.log('NftListSection: connected changed to ' + connected);
    const api = new ToncenterApi(network);
    async function fetchNfts() {
      if (!connected || !sender.address) {
        console.log('NftListSection: not connected');
        setNfts(null);
        return;
      }
      const newNfts = await api.getNftItems(sender.address, ADDRESSES[network].collection_contract).catch(e => {
        console.error('NftListSection: getNftItems error: ' + e);
        return null;
      });
      setNfts(newNfts);
      if (newNfts) {
        await sleep(5000);
        fetchNfts();
      }
    }
    fetchNfts();
  }, [connected, network]);

  return (
    <div>
      {nfts && nfts.map((nft) => (
        <NftItemContractCard nftAddress={nft.address} key={nft.index}/>
      ))}
    </div>
  );
}

// Sleep function to pause execution for a given number of milliseconds
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}