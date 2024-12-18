import './App.css'
import { TonConnectButton } from '@tonconnect/ui-react';
import WebApp from '@twa-dev/sdk';
import { LpContractCard } from './components/LpContractCard';
import { Network } from './utils/types';
import { MinterContractCard } from './components/MinterContractCard';
import { NftListSection } from './components/NftListSection';
import { NetworkContext } from './context/NetworkContext';
import { SharedStateProvider } from './context/SharedStateContext';
import { InputPopupProvider } from './context/InputPopupContext';
import { BalanceCard } from './components/BalanceCard';

function App() {
  const isInTWA = WebApp.platform != "unknown";
  const urlParams = new URLSearchParams(window.location.search);
  const networkParam = urlParams.get('network');
  const isTestnet = networkParam === 'testnet';
  const network: Network = isTestnet ? "testnet" : "mainnet";

  if (isInTWA && !WebApp.isExpanded) WebApp.expand();
  
  return <div id="content">
    <SharedStateProvider>
    <InputPopupProvider>
      <header className="header">
        {isTestnet &&
          <b style={{marginLeft: 'auto', color: '#f00'}}>TESTNET{isInTWA ? " - " + WebApp.platform : ""}</b>
        }
        <TonConnectButton className="ton-connect-button" />
      </header>
      <main className="main">
        <NetworkContext.Provider value={network}>
          <div className="main-section">
            <div className="section-column">
              <MinterContractCard/>
              <BalanceCard/>  
            </div>
            <div className="section-column">
              <NftListSection/>
            </div>
          </div>
        </NetworkContext.Provider>
      </main>
      <footer className="footer">
        <NetworkContext.Provider value={network}>
          <LpContractCard />
        </NetworkContext.Provider>
      </footer>
    </InputPopupProvider>
    </SharedStateProvider>
  </div>;
}

export default App;
