import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';
import { LpContractCard } from './components/LpContractCard';
import { Network } from './utils/types';
import { MinterContractCard } from './components/MinterContractCard';
import { NftListSection } from './components/NftListSection';
import { NetworkContext } from './services/NetworkContext';

function App() {
  const isInTWA = WebApp.platform != "unknown";
  const urlParams = new URLSearchParams(window.location.search);
  const networkParam = urlParams.get('network');
  const isTestnet = networkParam === 'testnet' || !networkParam;
  const network: Network = isTestnet ? "testnet" : "mainnet";

  if (isInTWA && !WebApp.isExpanded) WebApp.expand();
  
  return <div id="content">
    <header className="header">
      {isTestnet &&
        <b style={{marginLeft: 'auto', color: '#f00'}}>TESTNET{isInTWA ? " - " + WebApp.platform : ""}</b>
      }
      <TonConnectButton className="ton-connect-button" />
    </header>
    <div className="main">
      <NetworkContext.Provider value={network}>
        <div className="main-section">
          <MinterContractCard/>
          <LpContractCard/>
        </div>
        <div className="main-section">
          <NftListSection/>
        </div>
      </NetworkContext.Provider>
    </div>
  </div>;
}

export default App;
