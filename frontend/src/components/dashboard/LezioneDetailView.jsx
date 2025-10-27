import React, { useState } from "react";
import { API_BASE } from "../../constants/api.js";
import ResponsesViewer from "../shared/ResponsesViewer.jsx";
import ShareModal from "../shared/ShareModal.jsx";

function LezioneDetailView({ lezione, questionari, loading, user, onBack }) {
  const [showResponses, setShowResponses] = useState(false);
  const [selectedQuestionario, setSelectedQuestionario] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);

  const handleViewResponses = (questionario) => {
    setSelectedQuestionario(questionario);
    setShowResponses(true);
  };

  const handleCloseResponses = () => {
    setShowResponses(false);
    setSelectedQuestionario(null);
  };

  const handleShare = async (questionario) => {
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionario.id}/condividi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relatore_id: user.relatore.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShareData({
          ...data,
          questionario: questionario,
        });
        setShowShareModal(true);
      } else {
        alert("Errore nella generazione del link di condivisione");
      }
    } catch (error) {
      console.error("Errore condivisione:", error);
      alert("Errore nella generazione del link di condivisione");
    }
  };

  const handleCloseShare = () => {
    setShowShareModal(false);
    setShareData(null);
  };

  return (
    <div className="lezione-detail">
      <div className="back-button-container">
        <button onClick={onBack} className="btn-back-prominent">
          ← Torna alle lezioni
        </button>
      </div>

      <div className="lezione-header">
        <div className="lezione-info">
          <h2>{lezione.titolo}</h2>
          <p>{lezione.descrizione}</p>
          <small>
            Creata: {new Date(lezione.created_at).toLocaleDateString()}
          </small>
        </div>
      </div>

      <div className="questionari-section">
        <h3>Questionari associati ({questionari.length})</h3>

        {loading ? (
          <div className="loading-message">
            <p>Caricamento questionari...</p>
          </div>
        ) : questionari.length === 0 ? (
          <div className="empty-state">
            <p>Nessun questionario associato a questa lezione.</p>
            <p>Vai nella sezione "Questionari" per crearne uno nuovo.</p>
          </div>
        ) : (
          <div className="questionari-grid">
            {questionari.map((questionario) => (
              <div key={questionario.id} className="questionario-card">
                <h4>{questionario.titolo}</h4>
                <p>{questionario.descrizione}</p>
                <small>
                  Creato:{" "}
                  {new Date(questionario.created_at).toLocaleDateString()}
                </small>

                <div className="questionario-actions">
                  <button
                    onClick={() => handleViewResponses(questionario)}
                    className="btn-small btn-responses"
                  >
                    Risposte
                  </button>
                  <button
                    onClick={() => handleShare(questionario)}
                    className="btn-small btn-share"
                  >
                    Condividi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showResponses && selectedQuestionario && (
        <ResponsesViewer
          questionario={selectedQuestionario}
          onClose={handleCloseResponses}
        />
      )}

      {showShareModal && shareData && (
        <ShareModal shareData={shareData} onClose={handleCloseShare} />
      )}
    </div>
  );
}

export default LezioneDetailView;
