import { useContext, useEffect, useState } from "react";
import { ADDRESSES } from "../utils/addresses";
import { useTonConnect } from "../hooks/useTonConnect";
import { ToncenterApi, NftItem } from "../api/ToncenterApi";
import { NftItemContractCard } from "./NftItemContractCard";
import { NetworkContext } from "../context/NetworkContext";
import { sleep } from "../utils/controlUtils";

export function NftListSection() {
  const network = useContext(NetworkContext);
  const { sender, connected } = useTonConnect();
  const [isAutoUpdate, setIsAutoUpdate] = useState(true);
  
  const [nfts, setNfts] = useState<null | NftItem[]>(null);

  const senderAddress = sender.address?.toString();

  useEffect(() => {
    console.log('NftListSection useEffect: connected ' + connected + ', network ' + network + ', sender ' + senderAddress + ', isAutoUpdate ' + isAutoUpdate);
    const api = new ToncenterApi(network);
    async function fetchNfts() {
      if (!connected || !senderAddress) {
        console.log('NftListSection: not connected');
        setNfts(null);
        return;
      }
      if (!isAutoUpdate) {
        return;
      }
      const newNfts = await api.getNftItems(senderAddress, ADDRESSES[network].collection_contract).catch(e => {
        console.error('NftListSection: getNftItems error: ' + e);
        setIsAutoUpdate(false);
        throw e;
      });
      setNfts(newNfts);
      if (newNfts) {
        await sleep(5000);
        fetchNfts();
      }
    }
    fetchNfts();
  }, [connected, network, senderAddress, isAutoUpdate]);

  return (
    <div>
      {!isAutoUpdate && 
        <div>
          <span>Auto update is disabled due to fetch error.</span>
          <button onClick={() => setIsAutoUpdate(true)}>Refresh manually</button>
        </div>
      }
      {nfts && nfts.map((nft) => (
        <NftItemContractCard nftAddress={nft.address} key={nft.index}/>
      ))}
    </div>
  );
}
