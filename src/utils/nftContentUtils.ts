import { Cell, beginCell } from "@ton/core";

const OFF_CHAIN_CONTENT_PREFIX = 0x01;

export function flattenSnakeCell(cell: Cell) {
  let currentCell: Cell | null = cell
  
  let result = Buffer.alloc(0)
  
  while (currentCell) {
    const cs = currentCell.beginParse()
    if (cs.remainingBits % 8 !== 0) {
      throw Error('Number remaining of bits is not multiply of 8');
    }
    const data = cs.loadBuffer(cs.remainingBits / 8)
    result = Buffer.concat([result, data])
    currentCell = currentCell.refs[0]
  }
  
  return result
}

function bufferToChunks(buff: Buffer, chunkSize: number) {
  const chunks: Buffer[] = []
  while (buff.byteLength > 0) {
    chunks.push(buff.subarray(0, chunkSize))
    buff = buff.subarray(chunkSize)
  }
  return chunks
}

function _snakeCell(chunks: Buffer[]): Cell | null {
  const thisChunk = chunks.pop();
  if (!thisChunk) {
    return null;
  }
  
  const thisCell = beginCell()
  .storeBuffer(thisChunk);
  
  if (chunks.length > 0) {
    const innerCell = _snakeCell(chunks);
    if (innerCell) {
      thisCell.storeRef(innerCell);
    }
  }
  
  return thisCell.endCell();
}

export function makeSnakeCell(data: Buffer) {
  const chunks = bufferToChunks(data, 127).reverse();
  
  if (chunks.length === 0) {
    return beginCell().endCell(); // practically impossible
  }
  
  const rootCell = _snakeCell(chunks);
  if (!rootCell) {
    throw new Error('Failed to create snake cell');
  }
  return rootCell;
}

export function encodeOffChainContent(content: string, withPrefix: boolean = true) {
  let data = Buffer.from(content)
  if (withPrefix) {
    const offChainPrefix = Buffer.from([OFF_CHAIN_CONTENT_PREFIX])
    data = Buffer.concat([offChainPrefix, data])
  }
  return makeSnakeCell(data)
}

export function decodeOffChainContent(content: Cell, withPrefix: boolean = true) {
  const data = flattenSnakeCell(content)
  
  const prefix = data[0]
  if (withPrefix && prefix !== OFF_CHAIN_CONTENT_PREFIX) {
    throw new Error(`Unknown content prefix: ${prefix.toString(16)}`)
  }
  if (withPrefix) {
    return data.subarray(1).toString()
  } else {
    return data.toString()
  }
}