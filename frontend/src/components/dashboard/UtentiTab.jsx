import React, { useState } from "react";
import { API_BASE } from "../../constants/api.js";
import UtenteRisposteView from "./UtenteRisposteView.jsx";

function UtentiTab({ utenti }) {
  const [selectedUtente, setSelectedUtente] = useState(null);
  const [utenteRisposte, setUtenteRisposte] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVediRisposte = async (utente) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/utenti/${utente.id}/risposte`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Dati ricevuti per utente", utente.id, ":", data);
      setUtenteRisposte(data);
      setSelectedUtente(utente);
    } catch (error) {
      console.error("Errore nel caricamento risposte utente:", error);
      alert(`Errore nel caricamento delle risposte: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUtenti = () => {
    setSelectedUtente(null);
    setUtenteRisposte([]);
  };

  if (selectedUtente) {
    return (
      <UtenteRisposteView
        utente={selectedUtente}
        risposte={utenteRisposte}
        loading={loading}
        onBack={handleBackToUtenti}
      />
    );
  }

  return (
    <div className="tab-section-modern">
      <div className="section-header-modern">
        <div className="header-content">
          <h2>Lista Utenti</h2>
          <p className="section-subtitle">
            Visualizza e gestisci gli utenti registrati
          </p>
        </div>
      </div>

      <div className="content-section-modern">
        {utenti.length === 0 ? (
          <div className="empty-state-modern">
            <h3>Nessun utente registrato</h3>
            <p>Non ci sono ancora utenti nel sistema</p>
          </div>
        ) : (
          <div className="utenti-list-relatore">
            {utenti.map((utente) => (
              <div key={utente.id} className="utente-card-relatore">
                <div className="utente-info-relatore">
                  <h3 className="utente-name-relatore">{utente.nome}</h3>
                  <p className="utente-id-relatore">ID: {utente.id}</p>
                </div>
                <div className="utente-actions-relatore">
                  <button
                    onClick={() => handleVediRisposte(utente)}
                    disabled={loading}
                    className="btn-small-modern btn-view"
                  >
                    {loading ? "Caricamento..." : "Vedi Risposte"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UtentiTab;
