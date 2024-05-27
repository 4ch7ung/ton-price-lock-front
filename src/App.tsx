import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react';
import { useLockContract } from './hooks/useLockContract';
import { useLPContract } from './hooks/useLPContract';
import { fromNano } from '@ton/core';
import { useTonConnect } from './hooks/useTonConnect';
import { CopyButton } from './components/CopyButton';

function App() {
  const {
    contractAddress: lockContractAddress,
    contractBalance: lockContractBalance,
    contractData: lockContractData,
    refresh: getLockData,
    sendDeposit,
    sendWithdraw
  } = useLockContract();
  
  const {
    contractAddress: lpContractAddress,
    contractData: lpContractData,
    contractPrice: lpContractPrice,
    refresh: getPoolData,
    changeLPPrice
  } = useLPContract();
  
  const { connected } = useTonConnect();
  
  return <div id="content">
    <header className="header">
      <b style={{marginLeft: 'auto', color: '#f00'}}>TESTNET</b>
      <TonConnectButton className="ton-connect-button" />
    </header>
    <div className="main">
      <div className="card"> 
        <div className="card-header">
          <span>Lock contract</span>
          <button className="card-header-button" onClick={() => {
            getLockData();
          }}>
            Refresh
          </button>
        </div>
        <div className="card-item">
          <div className="card-item-title">
            Address
          </div>
          <div className="card-item-value card-item-container">
            <span>{lockContractAddress?.slice(0, 30) + "..."}</span>
            <CopyButton onClick={() => {
              navigator.clipboard.writeText(lockContractAddress ?? "");
            }} />
          </div>
        </div>

        {lockContractBalance !== null &&
          <div className="card-item">
            <div className="card-item-container">
              <div>
                <div className="card-item-title">
                  Balance
                </div>
                <div className="card-item-value">
                  {fromNano(BigInt(lockContractBalance ?? 0))} TON
                </div>
              </div>
              {connected && (
              <button className="card-item-button" onClick={() => {
                const value = prompt("Enter amount to deposit", "0");
                if (value === null || value == "") return;
                else {
                  const amount = parseFloat(value);
                  sendDeposit(amount);
                }
              }}>
                Deposit
              </button>
              )}
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
                {lockContractData?.target_price ?? 0} TON
              </div>
            </div>
            {connected && (
              <button className="card-item-button" onClick={() => {
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
          <span>LP contract</span>
          <button className="card-header-button" onClick={() => {
              getPoolData();
            } 
          }>
            Refresh
          </button>
        </div>
        <div className="card-item">
          <div className="card-item-title">
            Address
          </div>
          <div className="card-item-value card-item-container">
            <span>{lpContractAddress?.slice(0, 30) + "..."}</span>
            <CopyButton onClick={() => {
              navigator.clipboard.writeText(lpContractAddress ?? "");
            }} />
          </div>
        </div>

        <div className="card-item">
          <div className="card-item-title">
            USDT Reserve
          </div>
          <div className="card-item-value">
            {fromNano((lpContractData?.reserve0 ?? BigInt(0)) * BigInt(1000))} USDT
          </div>
        </div>

        <div className="card-item">
          <div className="card-item-title">
            TON Reserve
          </div>
          <div className="card-item-value">
            {fromNano(lpContractData?.reserve1 ?? BigInt(0))} TON
          </div>
        </div>

        <div className="card-item">
          <div className="card-item-container">
            <div>
              <div className="card-item-title">
                LP price
              </div>
              <div className="card-item-value">
                1 TON = {lpContractPrice.toFixed(2)} USDT
              </div>
            </div>
            {connected && (
              <button className="card-item-button" onClick={() => {
                const newPrice = prompt("Enter new price", lpContractPrice.toFixed(2));
                if (newPrice === null || newPrice == "") return;
                else {
                  const price = parseFloat(newPrice);
                  changeLPPrice(price);
                }
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
