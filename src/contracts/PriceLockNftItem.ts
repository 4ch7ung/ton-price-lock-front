import { Address, Cell, Contract, ContractProvider, SendMode, Sender, toNano } from "@ton/core";
import { decodeOffChainContent } from "../utils/nftContentUtils";
import { Queries } from "./PriceLockNftItem.data";

export class PriceLockNftItem implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell, data: Cell }
  ) {}
  
  //
  // Get methods
  //

  async getIsActive(provider: ContractProvider) {
    const state = await provider.getState();
    return state.state.type == 'active';
  }
  
  async getContractData(provider: ContractProvider) { 
    const { stack } = await provider.get('get_contract_data', []);
    const isInitialized = stack.readNumber() == -1;
    const index = stack.readNumber();
    const collectionAddress = stack.readAddress();
    if(!isInitialized) {
      return {
        initialized: isInitialized,
        index: index,
        collectionAddress: collectionAddress
      };        
    }
    const ownerAddress = stack.readAddress();
    const targetPrice = Number(stack.readBigNumber()) / 100;
    const lpConfig = stack.readCell().beginParse();
    const lpContractAddress = lpConfig.loadAddress();
    const lpIsUsdtFirst = lpConfig.loadInt(32) == -1;
    const content = stack.readCell();
    
    return {
      initialized: isInitialized,
      index: index,
      collectionAddress: collectionAddress,
      ownerAddress: ownerAddress,
      targetPrice: targetPrice,
      lpConfig: {
        contractAddress: lpContractAddress,
        isUsdtFirst: lpIsUsdtFirst
      },
      content: decodeOffChainContent(content, false),
      contentRaw: content
    };
  }
  
  async getNftData(provider: ContractProvider) {
    const { stack } = await provider.get('get_nft_data', []);
    
    const isInitialized = stack.readNumber() == -1;
    const index = stack.readNumber();
    const collectionAddress = stack.readAddress();
    if(!isInitialized) {
      return {
        initialized: isInitialized,
        index: index,
        collectionAddress: collectionAddress
      };
    }
    const ownerAddress = stack.readAddress();
    const content = stack.readCell();
    
    return {
      initialized: isInitialized,
      index: index,
      collectionAddress: collectionAddress,
      ownerAddress: ownerAddress,
      content: decodeOffChainContent(content, false),
      contentRaw: content
    };
  }
  
  async getBalance(
    provider: ContractProvider
  ) {
    const { stack } = await provider.get("balance", []);
    return {
      value: stack.readBigNumber()
    };
  }
  
  //
  // Internal messages
  //

  async sendDepositMessage(
    provider: ContractProvider,
    sender: Sender,
    value: bigint,
    queryId?: number
  ) {
    const msgBody = Queries.deposit({ queryId });

    await provider.internal(sender, {
      value,
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody
    })
  }

  async sendWithdrawMessage(
    provider: ContractProvider,
    sender: Sender,
    queryId?: number
  ) {
    const msgBody = Queries.withdraw({ queryId });

    await provider.internal(sender, {
      value: toNano(0.01),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody
    })
  }
  
  async sendTransferMessage(
    provider: ContractProvider,
    sender: Sender,
    newOwner: Address,
    queryId?: number,
    responseTo?: Address,
    forwardAmount?: bigint,
    forwardPayload?: Cell
  ) {
    const msgBody = Queries.transfer({ queryId, newOwner, responseTo, forwardAmount, forwardPayload });
    
    return await provider.internal(sender, {
      value: toNano('0.05'),
      body: msgBody
    });
  }
  
  async sendGetStaticDataMessage(
    provider: ContractProvider, 
    sender: Sender,
    queryId?: number
  ) {
    const msgBody = Queries.getStaticData({ queryId });
    
    return await provider.internal(sender, {
      value: toNano('0.1'),
      body: msgBody
    });
  }
  
  async sendSetLPAddressMessage(
    provider: ContractProvider,
    sender: Sender,
    lpAddress: Address,
    isUsdtFirst: boolean,
    queryId?: number
  ) {
    const msgBody = Queries.setLpAddress({ queryId, lpAddress, isUsdtFirst });

    await provider.internal(sender, {
      value: toNano(0.01),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: msgBody
    })
  }
  
}