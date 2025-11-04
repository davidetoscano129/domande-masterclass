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
    <div>
      <div>
        <div>
          <h2>Lista Utenti</h2>
          <p>Visualizza e gestisci gli utenti registrati</p>
        </div>
      </div>

      <div>
        {utenti.length === 0 ? (
          <div>
            <h3>Nessun utente registrato</h3>
            <p>Non ci sono ancora utenti nel sistema</p>
          </div>
        ) : (
          <div>
            {utenti.map((utente) => (
              <div key={utente.id}>
                <div>
                  <h3>{utente.nome}</h3>
                  <p>ID: {utente.id}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleVediRisposte(utente)}
                    disabled={loading}
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
