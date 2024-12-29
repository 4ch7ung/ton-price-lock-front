import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { SharedStateProvider } from "./context/SharedStateContext";
import { InputPopupProvider } from "./context/InputPopupContext";

const manifestUrl = "https://4ch7ung.github.io/ton-price-lock-front/tonconnect-manifest.json";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <SharedStateProvider>
      <InputPopupProvider>
          <App />
      </InputPopupProvider>
    </SharedStateProvider>
  </TonConnectUIProvider>
);
