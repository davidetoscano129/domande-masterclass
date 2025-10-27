import React, { useState } from "react";
import { API_BASE } from "../../constants/api.js";
import LezioneDetailView from "./LezioneDetailView.jsx";

function LezioniTab({ lezioni, user, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titolo: "",
    descrizione: "",
    numero: "",
  });
  const [selectedLezione, setSelectedLezione] = useState(null);
  const [lezioneQuestionari, setLezioneQuestionari] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/lezioni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, relatore_id: user.relatore.id }),
      });

      if (response.ok) {
        setFormData({ titolo: "", descrizione: "", numero: "" });
        setShowForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Errore creazione lezione:", error);
    }
  };

  const handleLezioneClick = async (lezione) => {
    setSelectedLezione(lezione);
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/questionari/lezione/${lezione.id}`
      );
      const data = await response.json();
      setLezioneQuestionari(data);
    } catch (error) {
      console.error("Errore nel caricamento questionari:", error);
      setLezioneQuestionari([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLezioni = () => {
    setSelectedLezione(null);
    setLezioneQuestionari([]);
  };

  const handleDeleteLezione = async (id, event) => {
    // Previeni il click sulla card
    event.stopPropagation();

    if (
      confirm(
        "Sei sicuro di voler eliminare questa lezione? Questa azione è irreversibile."
      )
    ) {
      try {
        const response = await fetch(`${API_BASE}/lezioni/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          onUpdate(); // Ricarica la lista delle lezioni
        } else {
          alert("Errore durante l'eliminazione della lezione");
        }
      } catch (error) {
        console.error("Errore eliminazione lezione:", error);
        alert("Errore durante l'eliminazione della lezione");
      }
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>Le mie Lezioni</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Annulla" : "+ Nuova Lezione"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <div className="form-row">
            <input
              type="number"
              placeholder="Numero lezione (es. 1, 2, 3...)"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
              min="1"
              required
              className="numero-input"
            />
            <input
              type="text"
              placeholder="Titolo lezione"
              value={formData.titolo}
              onChange={(e) =>
                setFormData({ ...formData, titolo: e.target.value })
              }
              required
              className="titolo-input"
            />
          </div>
          <textarea
            placeholder="Descrizione"
            value={formData.descrizione}
            onChange={(e) =>
              setFormData({ ...formData, descrizione: e.target.value })
            }
            rows={3}
          />
          <button type="submit" className="btn-primary">
            Crea Lezione
          </button>
        </form>
      )}

      {!selectedLezione ? (
        <div className="items-grid">
          {lezioni.map((lezione) => (
            <div
              key={lezione.id}
              className="item-card lezione-card clickable"
              onClick={() => handleLezioneClick(lezione)}
            >
              <div className="card-header">
                <h3>{lezione.titolo}</h3>
                <button
                  onClick={(e) => handleDeleteLezione(lezione.id, e)}
                  className="btn-small btn-delete"
                  title="Elimina lezione"
                >
                  Elimina
                </button>
              </div>
              <p>{lezione.descrizione}</p>
              <small>
                Creata: {new Date(lezione.created_at).toLocaleDateString()}
              </small>
              <div className="click-hint">Clicca per vedere i questionari</div>
            </div>
          ))}
        </div>
      ) : (
        <LezioneDetailView
          lezione={selectedLezione}
          questionari={lezioneQuestionari}
          loading={loading}
          user={user}
          onBack={handleBackToLezioni}
        />
      )}
    </div>
  );
}

export default LezioniTab;
