import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react';
import { useLockContract } from './hooks/useLockContract';
import { useLPContract } from './hooks/useLPContract';
import { fromNano } from '@ton/core';
import { useTonConnect } from './hooks/useTonConnect';

function App() {
  const {
    contract_address: lock_contract_address,
    contract_balance: lock_contract_balance,
    contract_data: lock_contract_data,
    sendDeposit,
    sendWithdraw
  } = useLockContract();
  
  const {
    contract_address: lp_contract_address,
    contract_data: lp_contract_data,
    getPoolData
  } = useLPContract();
  
  const { connected } = useTonConnect();
  
  return <div>
    <div>
      <TonConnectButton />
    </div>
    <div>
      <div className="Card">
        <b>Lock contract address:</b>
        <div className="Hint">
          {lock_contract_address?.slice(0, 30) + "..."}
        </div>

        {lock_contract_balance !== null &&
          <div>
            <b>Lock contract balance:</b>
            <div className="Hint">
              {fromNano(BigInt(lock_contract_balance ?? 0))} TON
            </div>
            <b>Unlock price:</b>
            <div className="Hint">
              {lock_contract_data?.target_price ?? 0} TON
            </div>
            
          </div>
        }
      
        <b>Lock contract owner:</b>
        <div className="Hint">
          {lock_contract_data?.owner_address?.toString() ?? "Loading..."}
        </div>
      
        <br />
        
        {/* make deposit */}
        {connected && (
          <div>
            <input type="text" name="deposit-value" id="deposit-value" value="0.01" />
            <a onClick={() => {
              const value = (document.getElementById("deposit-value") as HTMLInputElement).value;
              sendDeposit(Number(value));
            }}>
              Deposit
            </a>
          </div>
        )}
        
        <br />
        
        {/* make withdraw */}
        {connected && (
          <a onClick={() => {
            sendWithdraw();
          }}>
            Withdraw all TON and destroy contract
          </a>
        )}

        <br />
      </div>
      <div className="Card">
        <b>LP contract address:</b>
        <div className="Hint">
          {lp_contract_address?.slice(0, 30) + "..."}
        </div>

        <br />
        
        <b>LP contract reserves:</b>
        <p>USDT: {fromNano((lp_contract_data?.reserve0 ?? BigInt(0)) * BigInt(1000))} USDT</p>
        <p>TON: {fromNano(lp_contract_data?.reserve1 ?? BigInt(0))} TON</p>

        <b>LP Price:</b>
        <p>1 TON = {Number(lp_contract_data?.reserve0 ?? 0) / (Number(lp_contract_data?.reserve1 ?? 1) / 1000)}</p>

        {/* make get pool data */}
        {connected && (
          <a onClick={() => {
            getPoolData();
          }}>
            Refresh pool data
          </a>
        )}
      </div>
    </div>
  </div>;
}

export default App;
