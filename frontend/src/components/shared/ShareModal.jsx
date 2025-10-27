import React, { useState, useEffect } from "react";

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
      <div className="modal-content share-modal">
        <div className="modal-header">
          <h2>Condividi Questionario</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="share-content">
            <div className="questionario-info">
              <h3>{shareData.questionario.titolo}</h3>
              <p>
                Gli utenti potranno compilare questo questionario tramite il
                link o scansionando il QR code.
              </p>
            </div>

            <div className="share-methods">
              <div className="share-link-section">
                <h4>Link di condivisione</h4>
                <div className="link-container">
                  <input
                    type="text"
                    value={shareData.shareLink}
                    readOnly
                    className="share-link-input"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`btn-copy ${copied ? "copied" : ""}`}
                  >
                    {copied ? "Copiato!" : "Copia"}
                  </button>
                </div>
              </div>

              <div className="qr-code-section">
                <h4>QR Code</h4>
                <div className="qr-container">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="qr-code"
                    />
                  ) : (
                    <div className="qr-loading">Generazione QR code...</div>
                  )}
                </div>
                <p className="qr-instruction">
                  Gli utenti possono scansionare questo QR code per accedere
                  direttamente al questionario
                </p>
              </div>
            </div>

            <div className="share-info">
              <div className="info-item">
                <span className="info-label">🕒 Scadenza:</span>
                <span className="info-value">
                  {formatExpiryDate(shareData.expiresAt)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Token:</span>
                <span className="info-value">
                  {shareData.shareToken.substring(0, 8)}...
                </span>
              </div>
            </div>

            <div className="usage-instructions">
              <h4>Istruzioni per gli utenti</h4>
              <ol>
                <li>Accedere al link o scansionare il QR code</li>
                <li>Selezionare il proprio nome dalla lista</li>
                <li>Compilare il questionario</li>
                <li>Sottomettere le risposte</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
