import { Address, beginCell, Cell, Dictionary, storeStateInit, toNano } from "@ton/core";
import { encodeOffChainContent } from "../utils/nftContentUtils";

export type RoyaltyParams = {
  royaltyFactor: number
  royaltyBase: number
  royaltyAddress: Address
}

export type PriceLockNftCollectionData = {
  ownerAddress: Address,
  nextItemIndex: number | bigint
  collectionContent: string
  commonContent: string
  nftItemCode: Cell
  royaltyParams: RoyaltyParams
  minterAddress: Address
}

const nftMinStorage = 0.05;

// default#_ royalty_factor:uint16 royalty_base:uint16 royalty_address:MsgAddress = RoyaltyParams;
// storage#_ owner_address:MsgAddress next_item_index:uint64
//           ^[collection_content:^Cell common_content:^Cell]
//           nft_item_code:^Cell
//           royalty_params:^RoyaltyParams
//           minter_address:MsgAddress
//           = Storage;

export function buildNftCollectionDataCell(data: PriceLockNftCollectionData) {
  let dataCell = beginCell();
  
  dataCell.storeAddress(data.ownerAddress);
  dataCell.storeUint(data.nextItemIndex, 64);
  
  let collectionContent = encodeOffChainContent(data.collectionContent);
  
  let commonContent = beginCell()
    .storeBuffer(Buffer.from(data.commonContent))
    .endCell();
  
  let contentCell = beginCell()
    .storeRef(collectionContent)
    .storeRef(commonContent)
    .endCell();
  
  dataCell.storeRef(contentCell);
  dataCell.storeRef(data.nftItemCode);
  
  let royaltyCell = beginCell()
    .storeUint(data.royaltyParams.royaltyFactor, 16)
    .storeUint(data.royaltyParams.royaltyBase, 16)
    .storeAddress(data.royaltyParams.royaltyAddress)
    .endCell();
  
  dataCell.storeRef(royaltyCell)
  dataCell.storeAddress(data.minterAddress);
  
  return dataCell.endCell();
}

export function buildNftCollectionStateInit(conf: PriceLockNftCollectionData, codeCell: Cell) {
  let dataCell = buildNftCollectionDataCell(conf)
  
  let stateInit = {
    code: codeCell,
    data: dataCell
  };
  
  let stateInitCell = beginCell();
  storeStateInit(stateInit)(stateInitCell);
  
  return {
    stateInitCell: stateInitCell.endCell(),
    stateInit
  }
}

export const OperationCodes = {
  mint: 1,
  batchMint: 2,
  changeOwner: 3,
  editContent: 4,   // not implemented in contract
  getRoyaltyParams: 0x693d3950,
  getRoyaltyParamsResponse: 0xa8cb00ad,
  changeMinter: 0xb73b8ac5,
  mintNext: 0x50932698,
}

export const Errors = {
  batchLimit: 399,
  notAuthorized: 400,
  notOwner: 401,
  indexOutOfRange: 402,
  unknownOp: 0xffff,
}

export type PriceLockCollectionMintItemInput = {
  passAmount?: bigint
  index?: number
  ownerAddress: Address
  targetPrice: number
  lpConfig: {
    contractAddress: Address,
    isUsdtFirst: boolean
  }
  content: string
}

export const Queries = {
  mint: (params: { queryId?: number, itemInput: PriceLockCollectionMintItemInput }) => {
    const msgBody = beginCell()
      .storeUint(OperationCodes.mint, 32)
      .storeUint(params.queryId || 0, 64)
      .storeUint(params.itemInput.index!, 64)
      .storeCoins(params.itemInput.passAmount ?? toNano(nftMinStorage));

    const refinedTargetPrice = Math.floor(params.itemInput.targetPrice * 100);

    const lpConfig = beginCell()
      .storeAddress(params.itemInput.lpConfig.contractAddress)
      .storeInt(params.itemInput.lpConfig.isUsdtFirst ? -1 : 0, 32)
      .endCell();
    
    const itemContent = beginCell()
      .storeBuffer(Buffer.from(params.itemInput.content))
      .endCell();
    
    let nftItemMessage = beginCell()
      .storeAddress(params.itemInput.ownerAddress)
      .storeUint(refinedTargetPrice, 32)
      .storeRef(lpConfig)
      .storeRef(itemContent)
      .endCell();
    
    msgBody.storeRef(nftItemMessage);
    
    return msgBody.endCell();
  },
  mintNext: (params: { queryId?: number, itemInput: PriceLockCollectionMintItemInput }) => {
    const msgBody = beginCell()
      .storeUint(OperationCodes.mintNext, 32)
      .storeUint(params.queryId || 0, 64)
      .storeCoins(params.itemInput.passAmount ?? toNano(nftMinStorage));

    const refinedTargetPrice = Math.floor(params.itemInput.targetPrice * 100);

    const lpConfig = beginCell()
      .storeAddress(params.itemInput.lpConfig.contractAddress)
      .storeInt(params.itemInput.lpConfig.isUsdtFirst ? -1 : 0, 32)
      .endCell();
    
    const itemContent = beginCell()
      .storeBuffer(Buffer.from(params.itemInput.content))
      .endCell();
    
    let nftItemMessage = beginCell()
      .storeAddress(params.itemInput.ownerAddress)
      .storeUint(refinedTargetPrice, 32)
      .storeRef(lpConfig)
      .storeRef(itemContent)
      .endCell();
    
    msgBody.storeRef(nftItemMessage);
    
    return msgBody.endCell();
  },
  batchMint: (params: { queryId?: number, items: PriceLockCollectionMintItemInput[] }) => {
    if (params.items.length > 250) {
      throw new Error('Too long list');
    }
    
    let dict: Dictionary<number, Cell> = Dictionary.empty();
    
    const itemsFactory = (item: PriceLockCollectionMintItemInput): Cell => {
      const lpConfig = beginCell()
        .storeAddress(item.lpConfig.contractAddress)
        .storeInt(item.lpConfig.isUsdtFirst ? -1 : 0, 32)
        .endCell();

      const refinedTargetPrice = Math.floor(item.targetPrice * 100);

      const itemContent = beginCell()
        .storeBuffer(Buffer.from(item.content))
        .endCell();
      
      const nftItemMessage = beginCell()
        .storeAddress(item.ownerAddress)
        .storeUint(refinedTargetPrice, 32)
        .storeRef(lpConfig)
        .storeRef(itemContent)
        .endCell();
      
      return nftItemMessage;
    }
    
    for (let item of params.items) {
      dict.set(item.index!, itemsFactory(item));
    }
    
    let msgBody = beginCell()
      .storeUint(OperationCodes.batchMint, 32)
      .storeUint(params.queryId || 0, 64)
      .storeDict(dict, Dictionary.Keys.Uint(64), {
      serialize: (src, builder) => {
        builder.storeCoins(toNano(nftMinStorage));
        builder.storeRef(src);
      },
      parse: (src) => {
        return beginCell()
          .storeCoins(src.loadCoins())
          .storeRef(src.loadRef())
          .endCell();
      }
    });
    
    return msgBody.endCell();
  },
  changeOwner: (params: { queryId?: number, newOwner: Address}) => {
    let msgBody = beginCell()
      .storeUint(OperationCodes.changeOwner, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(params.newOwner);
    return msgBody.endCell();
  },
  changeMinter: (params: { queryId?: number, newMinter: Address }) => {
    let msgBody = beginCell()
      .storeUint(OperationCodes.changeMinter, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(params.newMinter);
    return msgBody.endCell();
  },
  getRoyaltyParams: (params: { queryId?: number }) => {
    let msgBody = beginCell()
      .storeUint(OperationCodes.getRoyaltyParams, 32)
      .storeUint(params.queryId || 0, 64);
    return msgBody.endCell();
  },
  // not implemented in contract
  editContent: (params: { queryId?: number,  collectionContent: string, commonContent: string,  royaltyParams: RoyaltyParams  }) => {
    let royaltyCell = beginCell()
      .storeUint(params.royaltyParams.royaltyFactor, 16)
      .storeUint(params.royaltyParams.royaltyBase, 16)
      .storeAddress(params.royaltyParams.royaltyAddress);
    
    let collectionContent = encodeOffChainContent(params.collectionContent);
    
    let commonContent = beginCell()
      .storeBuffer(Buffer.from(params.commonContent));
    
    let contentCell = beginCell()
      .storeRef(collectionContent)
      .storeRef(commonContent);
    
    let msgBody = beginCell()
      .storeUint(OperationCodes.editContent, 32)
      .storeUint(params.queryId || 0, 64)
      .storeRef(contentCell)
      .storeRef(royaltyCell);
    
    return msgBody.endCell();
  }
}
