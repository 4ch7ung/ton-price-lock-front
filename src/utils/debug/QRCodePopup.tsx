import { QRCodeCanvas } from "qrcode.react";
import { CopyButton } from "../../components/CopyButton";

export const QRCodePopup = ({ visible, onClose, qrContent }: { visible: boolean, onClose: () => void, qrContent: string }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose} // Close the popup when clicking outside the QR container
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "20px",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          position: "relative",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 style={{ margin: "0 0 1rem" }}>Scan this QR Code</h2>
        <QRCodeCanvas
          value={qrContent}
          size={200}
          style={{ marginBottom: "1rem" }}
        />
        <button
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          Close
        </button>
        <span style={{color: "black"}}>{qrContent}</span>
        <CopyButton onClick={() => navigator.clipboard.writeText(qrContent)} />
      </div>
    </div>
  );
};