import { 
    Address, 
    Cell, 
    Contract, 
    ContractProvider, 
    SendMode, 
    Sender, 
    beginCell, 
    contractAddress, 
    toNano 
} from "@ton/core";
import { randomBytes } from "crypto";

export type MainContractConfig = {
    owner_address: Address;
    target_price: number;
    lp_address: Address;
    is_usdt_first: boolean;
};

export enum Opcode {
    OP_DEPOSIT = 0x95db9d39,
    OP_WITHDRAW = 0xb5de5f9e,
    OP_DESTROY = 0x7c4a867b,
    OP_SET_OWRNER = 0x5b911a1a,
    OP_SET_LP_ADDRESS = 0xbf3f63c3,
    OP_GETTER_POOL_DATA = 0x43c034e6
}

export enum MainContractError {
    NOT_OWNER = 103,
    NOT_ENOUGH_BALANCE = 104,
    OP_NOT_FOUND = 105,
    NOT_LP_ADDRESS = 106,
    PRICE_NOT_MET = 107,
}

export function mainContractConfigToCell(config: MainContractConfig): Cell {
    return beginCell()
    .storeAddress(config.owner_address)
    .storeUint(config.target_price*100, 32)
    .storeAddress(config.lp_address)
    .storeInt(config.is_usdt_first ? -1 : 0, 32)
    .endCell();
}

export class LockContract implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell, data: Cell }
    ) {}
    
    static createFromConfig(config: MainContractConfig, code: Cell, workchain = 0) {
        const data = mainContractConfigToCell(config);
        const init = { code, data };
        const address = contractAddress(workchain, init);
        
        return new LockContract(address, init);
    }
    
    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
            .storeUint(Opcode.OP_DEPOSIT, 32)
            .endCell()
        });
    }
    
    async sendNoOpMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell()
        })
    }
    
    async sendDepositMessage(
        provider: ContractProvider,
        sender: Sender,
        value: bigint
    ) {
        await provider.internal(sender, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
            .storeUint(Opcode.OP_DEPOSIT, 32)
            .endCell()
        })
    }
    
    async sendWithdrawMessage(
        provider: ContractProvider,
        sender: Sender
    ) {
        await provider.internal(sender, {
            value: toNano(0.01),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
            .storeUint(Opcode.OP_WITHDRAW, 32)
            .storeUint(randomBytes(8).readBigUInt64LE(), 64) // query_id
            .endCell()
        })
    }
    
    async sendDestroyMessage(
        provider: ContractProvider,
        sender: Sender
    ) {
        await provider.internal(sender, {
            value: toNano(0.01),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
            .storeUint(Opcode.OP_DESTROY, 32)
            .endCell()
        })
    }
    
    async sendSetOwnerMessage(
        provider: ContractProvider,
        sender: Sender,
        newOwner: Address
    ) {
        await provider.internal(sender, {
            value: toNano(0.01),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
            .storeUint(Opcode.OP_SET_OWRNER, 32)
            .storeAddress(newOwner)
            .endCell()
        })
    }
    
    async sendSetLPAddressMessage(
        provider: ContractProvider,
        sender: Sender,
        newLPAddress: Address,
        isUsdtFirst: boolean
    ) {
        await provider.internal(sender, {
            value: toNano(0.01),
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
            .storeUint(Opcode.OP_SET_LP_ADDRESS, 32)
            .storeAddress(newLPAddress)
            .storeInt(isUsdtFirst ? -1 : 0, 32)
            .endCell()
        })
    }
    
    async getData(
        provider: ContractProvider
    ) {
        const { stack } = await provider.get("get_contract_data", []);
        return {
            owner_address: stack.readAddress(),
            target_price: Number(stack.readBigNumber()) / 100,
            lp_address: stack.readAddress(),
            is_usdt_first: stack.readBigNumber() !== BigInt(0)
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
}