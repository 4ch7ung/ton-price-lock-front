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
    sendWithdraw
  } = useLockContract();
  
  const {
    contract_address: lp_contract_address,
    contract_data: lp_contract_data,
    getPoolData
  } = useLPContract();
  
  const { connected } = useTonConnect();
  
  return <div id="content">
    <header className="header">
      <TonConnectButton className="ton-connect-button" />
    </header>
    <div className="main">
      <div className="card"> 
        <div className="card-header">
          Lock contract
        </div>
        <div className="card-item">
          <div className="card-item-title">
            Address
          </div>
          <div className="card-item-value">
            {lock_contract_address?.slice(0, 30) + "..."}
          </div>  
        </div>

        {lock_contract_balance !== null &&
          <div className="card-item">
            <div className="card-item-title">
              Balance
            </div>
            <div className="card-item-value">
              {fromNano(BigInt(lock_contract_balance ?? 0))} TON
            </div>            
          </div>
        }
        <div className="card-item">
          <div className="card-item-container">
            <div>
              <div className="card-item-title">
                Unlock price
              </div>
              <div className="card-item-value">
                {lock_contract_data?.target_price ?? 0} TON
              </div>
            </div>
            {connected && (
              <button onClick={() => {
                sendWithdraw();
              }}>
                Withdraw
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          LP contract
        </div>
        <div className="card-item">
          <div className="card-item-title">
            Address
          </div>
          <div className="card-item-value">
            {lp_contract_address?.slice(0, 30) + "..."}
          </div>
        </div>

        <div className="card-item">
          <div className="card-item-title">
            USDT Reserve
          </div>
          <div className="card-item-value">
            {fromNano((lp_contract_data?.reserve0 ?? BigInt(0)) * BigInt(1000))} USDT
          </div>
        </div>

        <div className="card-item">
          <div className="card-item-title">
            TON Reserve
          </div>
          <div className="card-item-value">
            {fromNano(lp_contract_data?.reserve1 ?? BigInt(0))} TON
          </div>
        </div>

        <div className="card-item">
          <div className="card-item-container">
            <div>
              <div className="card-item-title">
                LP price
              </div>
              <div className="card-item-value">
                1 TON = {Number(lp_contract_data?.reserve0 ?? 0) / (Number(lp_contract_data?.reserve1 ?? 1) / 1000)}
              </div>
            </div>
            {connected && (
              <button onClick={() => {
                getPoolData();
              }}>
                Change
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>;
}

export default App;
