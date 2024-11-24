import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, toNano } from '@ton/core';
import { decodeOffChainContent, encodeOffChainContent } from '../utils/nftContentUtils';

export const Constants = {
  nftMinStorage: toNano(0.05),
  gasPerItem: toNano(0.015)
}

const OperationCodes = {
  mint: 0x318f361,
  changeLpConfig: 0x7c6d56c,
  collectProfits: 0xb726fb4d,
  changeContent: 0xec29200,
  changeRoyaltyParam: 0x5c0af121,
}

export class PriceLockMinter implements Contract {
  constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}
  
  //
  // Get methods
  //
  
  async getTxValueForNftValue(
    provider: ContractProvider,
    nftValue: number | bigint
  ) {
    const { stack } = await provider.get('get_txvalue_for_nftvalue', [
      { type: 'int', value: BigInt(nftValue) }
    ]);
    
    const txValue = stack.readBigNumber();
    
    return txValue;
  }

  async getContractData(
    provider: ContractProvider
  ) {
    const { stack } = await provider.get('get_contract_data', []);

    const royaltyParam = stack.readBigNumber();
    const lpAddress = stack.readAddress();
    const isUsdtFirst = stack.readBoolean();
    const contentRaw = stack.readCell();
    const content = decodeOffChainContent(contentRaw, false);
    
    return {
      royaltyParam: royaltyParam,
      lpAddress: lpAddress,
      isUsdtFirst: isUsdtFirst,
      content: content,
      contentRaw: contentRaw,
    }
  }

  async getOwnerAndBalance(provider: ContractProvider) {
    const { state, balance } = await provider.getState();
    if (state.type !== 'active') {
      return null;
    }
    
    const data = state.data!;
    const reader = Cell.fromBoc(data)[0].beginParse();
    
    return { owner: reader.loadAddress(), balance: balance };
  }

  //
  // Internal messages
  //
  
  async sendMint(
    provider: ContractProvider,
    sender: Sender,
    value: number | bigint,
    tagetPrice: number,
    desiredDeposit: number | bigint,
    queryId?: number
  ) {
    const msgBody = beginCell()
      .storeUint(OperationCodes.mint, 32)
      .storeUint(BigInt(queryId || 0), 64)
      .storeUint(BigInt(Math.floor(tagetPrice * 100)), 32)
      .storeCoins(desiredDeposit)
      .endCell();
    
    return await provider.internal(sender, {
      value: BigInt(value),
      body: msgBody,
      sendMode: SendMode.PAY_GAS_SEPARATELY
    });
  }
  
  async sendCollectProfits(
    provider: ContractProvider,
    sender: Sender
  ) {
    const msgBody = beginCell()
      .storeUint(OperationCodes.collectProfits, 32)
      .storeUint(0, 64)
      .endCell();
    
    return await provider.internal(sender, {
      value: toNano(0.015),
      body: msgBody,
      sendMode: SendMode.PAY_GAS_SEPARATELY
    });
  }

  async sendChangeLpConfig(
    provider: ContractProvider,
    sender: Sender,
    lpAddress: Address,
    isUsdtFirst: boolean
  ) {
    const msgBody = beginCell()
      .storeUint(OperationCodes.changeLpConfig, 32)
      .storeUint(0, 64)
      .storeRef(beginCell()
        .storeAddress(lpAddress)
        .storeInt(isUsdtFirst ? -1 : 0, 32)
        .endCell())
      .endCell();
    
    return await provider.internal(sender, {
      value: toNano(0.015),
      body: msgBody,
      sendMode: SendMode.PAY_GAS_SEPARATELY
    });
  }

  async sendChangeContent(
    provider: ContractProvider,
    sender: Sender,
    content: string
  ) {
    const msgBody = beginCell()
      .storeUint(OperationCodes.changeContent, 32)
      .storeUint(0, 64)
      .storeRef(encodeOffChainContent(content, false))
      .endCell();
    
    return await provider.internal(sender, {
      value: toNano(0.015),
      body: msgBody,
      sendMode: SendMode.PAY_GAS_SEPARATELY
    });
  }

  async sendChangeRoyaltyParam(
    provider: ContractProvider,
    sender: Sender,
    royaltyParam: bigint
  ) {
    const msgBody = beginCell()
      .storeUint(OperationCodes.changeRoyaltyParam, 32)
      .storeUint(0, 64)
      .storeCoins(royaltyParam)
      .endCell();
    
    return await provider.internal(sender, {
      value: toNano(0.015),
      body: msgBody,
      sendMode: SendMode.PAY_GAS_SEPARATELY
    });
  }
}
