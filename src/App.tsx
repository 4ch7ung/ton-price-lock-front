import { useEffect } from "react";
import "./reset.css";
import "./App.css";
import WebApp from "@twa-dev/sdk";
import { LpContractCard } from "./components/LpContractCard";
import { MinterContractCard } from "./components/MinterContractCard";
import { NftListSection } from "./components/NftListSection";
import { Header } from "./components/Header";
import { Wallet } from "./components/Wallet";
import { Accordion } from "./shared/Accordion";
import { Summary } from "./components/Summary";

function App() {
  const isInTWA = WebApp.platform != "unknown";

  useEffect(() => {
    if (isInTWA && !WebApp.isExpanded) {
      WebApp.expand();
    }
  }, [isInTWA]);

  return (
    <div id="content">
      <Header isInTWA={isInTWA} />
      <main className="main">
        <div style={{ marginBottom: 20 }}>
          <Summary />
        </div>
        <Accordion title="Wallets">
          <Wallet />
        </Accordion>
        <Accordion title="NFT Locked Amounts">
          {/* <NFTEmptySection /> */}
          <NftListSection />
        </Accordion>
      </main>
      <footer className="footer" style={{ display: "none" }}>
        <MinterContractCard />
        <LpContractCard />
      </footer>
    </div>
  );
}

export default App;
