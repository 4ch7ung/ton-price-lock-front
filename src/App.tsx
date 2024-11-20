import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';
import { LpContractCard } from './components/LpContractCard';
import { Network } from './hooks/useTonClient';
import { MinterContractCard } from './components/MinterContractCard';

function App() {
  const isInTWA = WebApp.platform != "unknown";
  const isTestnet = true; // TODO: check query
  const network: Network = isTestnet ? "testnet" : "mainnet";
  console.log("render cycle");

  if (isInTWA) WebApp.expand();
  
  return <div id="content">
    <header className="header">
      <b style={{marginLeft: 'auto', color: '#f00'}}>TESTNET{isInTWA ? " - " + WebApp.platform : ""}</b>
      <TonConnectButton className="ton-connect-button" />
    </header>
    <div className="main">
      <MinterContractCard network={network} />
      <LpContractCard network={network} />
    </div>
  </div>;
}

export default App;
