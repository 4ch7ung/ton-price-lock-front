import { Address, beginCell, Cell } from "@ton/core";

const OperationCodes = {
  deposit: 0x95db9d39,
  withdraw: 0xb5de5f9e,
  transfer: 0x5fcc3d14,
  getStaticData: 0x2fcb26a2,
  getStaticDataResponse: 0x8b771735,
  destroy: 0x7c4a867b,
  setLpAddress: 0xbf3f63c3,
  getterPoolData: 0x43c034e6,
};

export const Queries = {
  deposit: (params: { queryId?: number }) => {
    const msgBody = beginCell()
      .storeUint(OperationCodes.deposit, 32)
      .storeUint(params.queryId || 0, 64);
    
    return msgBody.endCell();
  },
  withdraw: (params: { queryId?: number }) => {
    const msgBody = beginCell()
      .storeUint(OperationCodes.withdraw, 32)
      .storeUint(params.queryId || 0, 64);
    
    return msgBody.endCell();
  },
  transfer: (params: { queryId?: number; newOwner: Address; responseTo?: Address; forwardAmount?: bigint, forwardPayload?: Cell }) => {
    const msgBody = beginCell()
      .storeUint(OperationCodes.transfer, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(params.newOwner)
      .storeAddress(params.responseTo || null)
      .storeBit(false) // no custom payload
      .storeCoins(params.forwardAmount || 0);
    
    if (params.forwardPayload) {
      msgBody.storeSlice(params.forwardPayload.asSlice());
    } else {
      msgBody.storeBit(0); // no forward_payload yet
    }
    
    return msgBody.endCell();
  },
  getStaticData: (params: { queryId?: number }) => {
    const msgBody = beginCell()
      .storeUint(OperationCodes.getStaticData, 32)
      .storeUint(params.queryId || 0, 64);
    
    return msgBody.endCell();
  },
  setLpAddress: (params: { queryId?: number; lpAddress: Address; isUsdtFirst: boolean }) => {
    const msgBody = beginCell()
      .storeUint(OperationCodes.setLpAddress, 32)
      .storeUint(params.queryId || 0, 64)
      .storeAddress(params.lpAddress)
      .storeInt(params.isUsdtFirst ? -1 : 0, 32);
    
    return msgBody.endCell();
  },
};
