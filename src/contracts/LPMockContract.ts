import { 
  Address, 
  Cell, 
  Contract, 
  ContractProvider, 
  SendMode, 
  Sender, 
  beginCell, 
  toNano 
} from "@ton/core";
import { randomBytes } from "crypto";

const Opcode = {
  setReserves: 0xf098b538,
  getterPoolData: 0x43c034e6
}

export class LPMockContract implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell, data: Cell }
  ) {}
  
  // works only for testnet
  async sendSetReservesMessage(
    provider: ContractProvider,
    sender: Sender,
    reserve0: bigint,
    reserve1: bigint
  ) {
    await provider.internal(sender, {
      value: toNano(0.01),
      sendMode: SendMode.PAY_GAS_SEPARATELY,
      body: beginCell()
        .storeUint(Opcode.setReserves, 32)
        .storeUint(randomBytes(8).readBigUInt64LE(), 64) // query_id
        .storeCoins(reserve0)
        .storeCoins(reserve1)
        .endCell()
    });
  }
  
  async getPoolData(
    provider: ContractProvider
  ) {
    const { stack } = await provider.get("get_pool_data", []);
    
    /* returned data structure 
    storage::reserve0,
    storage::reserve1,
    storage::token0_address,
    storage::token1_address,
    storage::lp_fee,
    storage::protocol_fee, 
    storage::ref_fee,
    storage::protocol_fee_address,
    storage::collected_token0_protocol_fee, 
    storage::collected_token1_protocol_fee
    */
    
    return {
      reserve0: stack.readBigNumber(),
      reserve1: stack.readBigNumber(),
      token0_address: stack.readAddress(),
      token1_address: stack.readAddress(),
      lp_fee: stack.readBigNumber(),
      protocol_fee: stack.readBigNumber(),
      ref_fee: stack.readBigNumber(),
      protocol_fee_address: stack.readAddress(),
      collected_token0_protocol_fee: stack.readBigNumber(),
      collected_token1_protocol_fee: stack.readBigNumber()
    };
  }
  
  async getBalance(
    provider: ContractProvider
  ) {
    const { stack } = await provider.get("balance", []);
    return stack.readBigNumber();
  }
}