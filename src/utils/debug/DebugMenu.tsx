import "./DebugMenu.css";
import { useState } from "react";
import { QRCodePopup } from "./QRCodePopup";
import { useDebug } from "./useDebug";

export const DebugMenu = () => {
  const {
    debugSetReserves
  } = useDebug();

  const [visible, setVisible] = useState(false);
  const [qrCodeShown, setQrCodeShown] = useState(false);

  return (
    <div className="debug-button">
      <button
        onClick={() => setVisible(!visible)}
      >
        Debug
      </button>
      {visible && (
        <div className="debug-menu">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Clear&nbsp;Local&nbsp;Storage
          </button>
          <button
            onClick={() => {
              setQrCodeShown(true);
            }}
          >
            Show&nbsp;QR&nbsp;Code
          </button>
        </div>
      )}
      <QRCodePopup 
        visible={qrCodeShown} 
        onClose={() => { setQrCodeShown(false); }}
        qrContent={debugSetReserves()} 
      />
    </div>
  );
}