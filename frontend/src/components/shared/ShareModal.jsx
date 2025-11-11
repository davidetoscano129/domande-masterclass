import React, { useState, useEffect } from "react";
import "../../styles/design-system.css";
import "../../styles/dashboard/relatore.css";

function ShareModal({ shareData, onClose }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [shareData]);

  const generateQRCode = async () => {
    try {
      const QRCode = (await import("qrcode")).default;
      const qrCodeDataUrl = await QRCode.toDataURL(shareData.shareLink, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Errore generazione QR code:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Errore copia link:", error);
    }
  };

  const formatExpiryDate = (dateString) => {
    return new Date(dateString).toLocaleString("it-IT");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-large">
        <div className="modal-header">
          <h2>Condividi Questionario</h2>
          <button
            onClick={onClose}
            className="btn btn-text"
            style={{ fontSize: "24px", padding: "8px" }}
          >
            ×
          </button>
        </div>

        <div className="modal-body" style={{ padding: "24px" }}>
          <div>
            <div style={{ marginBottom: "24px", textAlign: "center" }}>
              <h3 style={{ color: "#1d1d1f", marginBottom: "8px" }}>
                {shareData.questionario}
              </h3>
              <p style={{ color: "#86868b", margin: 0 }}>
                Gli utenti potranno compilare questo questionario tramite il
                link o scansionando il QR code.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "24px",
                marginBottom: "24px",
              }}
            >
              <div>
                <h4 style={{ marginBottom: "12px", color: "#1d1d1f" }}>
                  Link di condivisione
                </h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={shareData.shareLink}
                    readOnly
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #d2d2d7",
                      borderRadius: "8px",
                      fontSize: "14px",
                    }}
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn btn-primary btn-sm"
                  >
                    {copied ? "Copiato!" : "Copia"}
                  </button>
                </div>
              </div>

              <div>
                <h4 style={{ marginBottom: "12px", color: "#1d1d1f" }}>
                  QR Code
                </h4>
                <div style={{ textAlign: "center" }}>
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      style={{
                        width: "160px",
                        height: "160px",
                        border: "1px solid #d2d2d7",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "160px",
                        height: "160px",
                        border: "1px solid #d2d2d7",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#86868b",
                      }}
                    >
                      Generazione QR code...
                    </div>
                  )}
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#86868b",
                    textAlign: "center",
                    marginTop: "8px",
                  }}
                >
                  Scansiona per accedere al questionario
                </p>
              </div>
            </div>

            <div
              style={{
                background: "#f5f5f7",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "24px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <span style={{ fontSize: "14px", color: "#86868b" }}>
                  🕒 Scadenza:
                </span>
                <span style={{ marginLeft: "8px", fontWeight: "500" }}>
                  {formatExpiryDate(shareData.expiresAt)}
                </span>
              </div>
              <div>
                <span style={{ fontSize: "14px", color: "#86868b" }}>
                  Token:
                </span>
                <span
                  style={{
                    marginLeft: "8px",
                    fontFamily: "monospace",
                    fontSize: "13px",
                  }}
                >
                  {shareData.shareToken.substring(0, 8)}...
                </span>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: "12px", color: "#1d1d1f" }}>
                Istruzioni per gli utenti
              </h4>
              <ol style={{ paddingLeft: "20px", color: "#1d1d1f" }}>
                <li>Accedere al link o scansionare il QR code</li>
                <li>Selezionare il proprio nome dalla lista</li>
                <li>Compilare il questionario</li>
                <li>Sottomettere le risposte</li>
              </ol>
            </div>
          </div>
        </div>

        <div
          className="modal-footer"
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #d2d2d7",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onClose} className="btn btn-primary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
