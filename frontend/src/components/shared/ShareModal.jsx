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
    <div>
      <div>
        <div>
          <h2>Condividi Questionario</h2>
          <button onClick={onClose}>×</button>
        </div>

        <div>
          <div>
            <div>
              <h3>{shareData.questionario.titolo}</h3>
              <p>
                Gli utenti potranno compilare questo questionario tramite il
                link o scansionando il QR code.
              </p>
            </div>

            <div>
              <div>
                <h4>Link di condivisione</h4>
                <div>
                  <input type="text" value={shareData.shareLink} readOnly />
                  <button onClick={copyToClipboard}>
                    {copied ? "Copiato!" : "Copia"}
                  </button>
                </div>
              </div>

              <div>
                <h4>QR Code</h4>
                <div>
                  {qrCodeDataUrl ? (
                    <img src={qrCodeDataUrl} alt="QR Code" />
                  ) : (
                    <div>Generazione QR code...</div>
                  )}
                </div>
                <p>
                  Gli utenti possono scansionare questo QR code per accedere
                  direttamente al questionario
                </p>
              </div>
            </div>

            <div>
              <div>
                <span>🕒 Scadenza:</span>
                <span>{formatExpiryDate(shareData.expiresAt)}</span>
              </div>
              <div>
                <span>Token:</span>
                <span>{shareData.shareToken.substring(0, 8)}...</span>
              </div>
            </div>

            <div>
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

        <div>
          <button onClick={onClose}>Chiudi</button>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
