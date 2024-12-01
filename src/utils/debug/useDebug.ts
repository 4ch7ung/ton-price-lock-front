import { toNano } from "@ton/core";

export const useDebug = () => {
  return {
    debugSetReserves,
  };
}

function debugSetReserves() {
  // const msgBody = beginCell()
  //     .storeUint(Opcode.setReserves, 32)
  //     .storeUint(0, 64)
  //     .storeCoins(reserve0)
  //     .storeCoins(reserve1)
  //     .endCell();
  // console.log('msgBody: ', msgBody.toBoc().toString('base64'));

  const lpAddress = "kQCaMjQIcBvgzCE9o31ytKWTIFVOkB18YuJZ3W6g7OWsvrvc";
  const setReservesBocBase64 = "te6cckEBAQEAHAAANPCYtTgAAAAAAAAAAGPWtmN1nfcrEthnDC7WhndmSQ==";

  const query = new URLSearchParams({
    amount: toNano(0.1).toString(10),
    bin: setReservesBocBase64,
  });
  
  const url = new URL("https://test.tonhub.com/transfer/" + lpAddress);
  url.search = query.toString();
  
  return url.toString();
}