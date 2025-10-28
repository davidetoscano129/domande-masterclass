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
    <div className="tab-section-modern">
      <div className="section-header-modern">
        <div className="header-content">
          <h2>Le mie Lezioni</h2>
          <p className="section-subtitle">
            Gestisci le tue lezioni e i contenuti formativi
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`btn-action-modern ${
            showForm ? "btn-cancel" : "btn-create"
          }`}
        >
          {showForm ? "Annulla" : "Nuova Lezione"}
        </button>
      </div>

      {showForm && (
        <div className="form-card-modern">
          <div className="form-header">
            <h3>Crea Nuova Lezione</h3>
            <p>Compila tutti i campi per creare una nuova lezione</p>
          </div>
          <form onSubmit={handleSubmit} className="form-modern">
            <div className="form-row-modern">
              <div className="input-group">
                <label>Numero Lezione</label>
                <input
                  type="number"
                  placeholder="es. 1, 2, 3..."
                  value={formData.numero}
                  onChange={(e) =>
                    setFormData({ ...formData, numero: e.target.value })
                  }
                  min="1"
                  required
                  className="input-modern numero-input"
                />
              </div>
              <div className="input-group flex-2">
                <label>Titolo Lezione</label>
                <input
                  type="text"
                  placeholder="Inserisci il titolo della lezione"
                  value={formData.titolo}
                  onChange={(e) =>
                    setFormData({ ...formData, titolo: e.target.value })
                  }
                  required
                  className="input-modern titolo-input"
                />
              </div>
            </div>
            <div className="input-group">
              <label>Descrizione</label>
              <textarea
                placeholder="Descrivi gli obiettivi e i contenuti della lezione"
                value={formData.descrizione}
                onChange={(e) =>
                  setFormData({ ...formData, descrizione: e.target.value })
                }
                rows={3}
                className="textarea-modern"
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary-modern">
                Crea Lezione
              </button>
            </div>
          </form>
        </div>
      )}

      {!selectedLezione ? (
        <div className="content-section-modern">
          {lezioni.length === 0 ? (
            <div className="empty-state-modern">
              <h3>Nessuna lezione creata</h3>
              <p>
                Inizia creando la tua prima lezione usando il pulsante "Nuova
                Lezione"
              </p>
            </div>
          ) : (
            <div className="items-grid-modern">
              {lezioni.map((lezione, index) => (
                <div
                  key={lezione.id}
                  className="item-card-modern lezione-card-modern"
                  onClick={() => handleLezioneClick(lezione)}
                >
                  <div className="card-header-modern">
                    <div className="lesson-number">
                      #{lezione.numero || index + 1}
                    </div>
                    <button
                      onClick={(e) => handleDeleteLezione(lezione.id, e)}
                      className="btn-delete-modern"
                      title="Elimina lezione"
                    >
                      Elimina
                    </button>
                  </div>
                  <div className="card-content-modern">
                    <h3 className="lesson-title">{lezione.titolo}</h3>
                    <p className="lesson-description">{lezione.descrizione}</p>
                    <div className="lesson-meta">
                      <span className="creation-date">
                        {new Date(lezione.created_at).toLocaleDateString(
                          "it-IT"
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="card-footer-modern">
                    <div className="click-hint-modern">
                      Clicca per vedere i questionari
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
