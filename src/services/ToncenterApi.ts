import { Address } from "@ton/core";
import { Network } from "../utils/types";

export type NftItemDto = {
  address: string;
  init: boolean;
  index: string;
  collection_address: string;
  owner_address: string;
  content: {
    uri: string;
  };
  last_transaction_lt: string;
  code_hash: string;
  data_hash: string;
  collection: {
    address: string;
    owner_address: string;
    last_transaction_lt: string;
    next_item_index: string;
    collection_content: {
      uri: string;
    };
    data_hash: string;
    code_hash: string;
  };
}

export type NftItemsResponseDto = {
  nft_items: NftItemDto[];
  address_book: Record<string, { user_friendly: string, domain: null }>;
  metadata: Record<string, { is_indexed: boolean, token_info: { type: string }[] }>;
}

export type NftItem = {
  index: number;
  address: string;
  owner_address: string;
  collection_address: string;
  content: {
    uri: string;
  };
}

const Host = {
  testnet: "https://testnet.toncenter.com/",
  mainnet: "https://toncenter.com/"
}

export class ToncenterApi {
  host: string;

  constructor(network: Network = "testnet") {
    this.host = Host[network] ?? Host.testnet;
  }

  async getNftItems(ownerAddress: string | Address, collectionAddress: string | Address, limit: number = 20, offset: number = 0) {
    if (typeof ownerAddress !== "string") {
      ownerAddress = ownerAddress.toString();
    }
    if (typeof collectionAddress !== "string") {
      collectionAddress = collectionAddress.toString();
    }
    const params = new URLSearchParams({
      owner_address: ownerAddress,
      collection_address: collectionAddress,
      limit: String(limit),
      offset: String(offset)
    });

    const url: URL = new URL(this.host);
    url.pathname = "api/v3/nft/items";
    url.search = params.toString();

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 400) {
        const { code , error } = await response.json();
        throw new Error(`Failed to fetch NFT items: ${response.statusText}, code: ${code}, error: ${error}`);
      } else {
        throw new Error(`Failed to fetch NFT items: ${response.statusText}`);
      }
    }

    const data: NftItemsResponseDto = await response.json();
    const refinedItems = data.nft_items.map(item => {
      return {
        index: Number(item.index),
        address: data.address_book[item.address]?.user_friendly ?? item.address,
        owner_address: data.address_book[item.owner_address]?.user_friendly ?? item.owner_address,
        collection_address: data.address_book[item.collection_address]?.user_friendly ?? item.collection_address,
        content: item.content
      } as NftItem;
    });
    return refinedItems;
  }
}

/*
const nftRequestExample = "https://testnet.toncenter.com/api/v3/nft/items?owner_address=kQBnCQREbTWcRUp7ZA4Rb5D19aEkXhxoImZGBIqBNm-x7NbV&collection_address=kQC5IR-GtGgJXmhj7VtAs8VLCEFQzHP_ANl3YRbU0af6p_7k&limit=10&offset=0"
const nftResponseExample = {
  "nft_items": [
    {
      "address": "0:525F0332D506F059936B33E52DE8A3529E0DAFAF43E6C9C551671902469EF645",
      "init": true,
      "index": "1",
      "collection_address": "0:B9211F86B468095E6863ED5B40B3C54B084150CC73FF00D9776116D4D1A7FAA7",
      "owner_address": "0:670904446D359C454A7B640E116F90F5F5A1245E1C68226646048A81366FB1EC",
      "content": {
        "uri": "https://4ch7ung.github.io/fortune-cookie-nft/D.json"
      },
      "last_transaction_lt": "28186633000001",
      "code_hash": "CXTqS1YMSWvJgVZWYNximhn6Um6hh5XYJp52GceizBo=",
      "data_hash": "rQvJuLlYlP+ZJhD4aV0N+3tH6fBFG19AbpabOaFpXV8=",
      "collection": {
        "address": "0:B9211F86B468095E6863ED5B40B3C54B084150CC73FF00D9776116D4D1A7FAA7",
        "owner_address": "0:670904446D359C454A7B640E116F90F5F5A1245E1C68226646048A81366FB1EC",
        "last_transaction_lt": "28270402000001",
        "next_item_index": "4",
        "collection_content": {
          "uri": "https://4ch7ung.github.io/fortune-cookie-nft/collectionCover.json"
        },
        "data_hash": "/kF3H9CCvPxexOmyjV9fvf/y/hLKKarpfHpylI661Kc=",
        "code_hash": "kTaC5Ylut5J+k34t23hgNiEUVCul2kKszOJUjq26J6Y="
      }
    },
    {
      "address": "0:48BB0317BD90ADDC17B4711BC947BA9636AD2FCB85DE4AA97E4ECB49EE27A347",
      "init": true,
      "index": "2",
      "collection_address": "0:B9211F86B468095E6863ED5B40B3C54B084150CC73FF00D9776116D4D1A7FAA7",
      "owner_address": "0:670904446D359C454A7B640E116F90F5F5A1245E1C68226646048A81366FB1EC",
      "content": {
        "uri": "https://4ch7ung.github.io/fortune-cookie-nft/D.json"
      },
      "last_transaction_lt": "28219198000001",
      "code_hash": "CXTqS1YMSWvJgVZWYNximhn6Um6hh5XYJp52GceizBo=",
      "data_hash": "j71iQutnr31ygGAhtia7VaIHWBP8lFTI0K60nSlLWmo=",
      "collection": {
        "address": "0:B9211F86B468095E6863ED5B40B3C54B084150CC73FF00D9776116D4D1A7FAA7",
        "owner_address": "0:670904446D359C454A7B640E116F90F5F5A1245E1C68226646048A81366FB1EC",
        "last_transaction_lt": "28270402000001",
        "next_item_index": "4",
        "collection_content": {
          "uri": "https://4ch7ung.github.io/fortune-cookie-nft/collectionCover.json"
        },
        "data_hash": "/kF3H9CCvPxexOmyjV9fvf/y/hLKKarpfHpylI661Kc=",
        "code_hash": "kTaC5Ylut5J+k34t23hgNiEUVCul2kKszOJUjq26J6Y="
      }
    }
  ],
  "address_book": {
    "0:48BB0317BD90ADDC17B4711BC947BA9636AD2FCB85DE4AA97E4ECB49EE27A347": {
      "user_friendly": "kQBIuwMXvZCt3Be0cRvJR7qWNq0vy4XeSql-TstJ7iejR7U2",
      "domain": null
    },
    "0:525F0332D506F059936B33E52DE8A3529E0DAFAF43E6C9C551671902469EF645": {
      "user_friendly": "kQBSXwMy1QbwWZNrM-Ut6KNSng2vr0PmycVRZxkCRp72RWKu",
      "domain": null
    },
    "0:670904446D359C454A7B640E116F90F5F5A1245E1C68226646048A81366FB1EC": {
      "user_friendly": "0QBnCQREbTWcRUp7ZA4Rb5D19aEkXhxoImZGBIqBNm-x7IsQ",
      "domain": null
    }
  },
  "metadata": {
    "0:48BB0317BD90ADDC17B4711BC947BA9636AD2FCB85DE4AA97E4ECB49EE27A347": {
      "is_indexed": false,
      "token_info": [
        {
          "type": "nft_items"
        }
      ]
    },
    "0:525F0332D506F059936B33E52DE8A3529E0DAFAF43E6C9C551671902469EF645": {
      "is_indexed": false,
      "token_info": [
        {
          "type": "nft_items"
        }
      ]
    }
  }
}
*/