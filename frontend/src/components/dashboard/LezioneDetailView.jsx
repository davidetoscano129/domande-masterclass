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
    <div className="tab-section-modern">
      <div className="section-header-modern">
        <button
          onClick={onBack}
          className="btn-small-modern btn-view"
          style={{ marginBottom: "var(--space-md)" }}
        >
          ← Torna alle lezioni
        </button>
      </div>

      <div
        className="relatore-card-modern"
        style={{ marginBottom: "var(--space-lg)" }}
      >
        <div className="relatore-card-content">
          <h2 className="relatore-card-title" style={{ fontSize: "1.5rem" }}>
            {lezione.titolo}
          </h2>
          <p className="relatore-card-description">{lezione.descrizione}</p>
          <div className="relatore-card-meta">
            <span>
              Creata: {new Date(lezione.created_at).toLocaleDateString("it-IT")}
            </span>
          </div>
        </div>
      </div>

      <div className="content-section-modern">
        <div
          className="section-header-modern"
          style={{ marginBottom: "var(--space-md)" }}
        >
          <h3>Questionari associati ({questionari.length})</h3>
        </div>

        {loading ? (
          <div className="empty-state-modern">
            <p>Caricamento questionari...</p>
          </div>
        ) : questionari.length === 0 ? (
          <div className="empty-state-modern">
            <h3>Nessun questionario associato</h3>
            <p>Vai nella sezione "Questionari" per crearne uno nuovo.</p>
          </div>
        ) : (
          <div className="items-grid-relatore">
            {questionari.map((questionario) => (
              <div key={questionario.id} className="relatore-card-modern">
                <div className="relatore-card-content">
                  <h4 className="relatore-card-title">{questionario.titolo}</h4>
                  <p className="relatore-card-description">
                    {questionario.descrizione}
                  </p>
                  <div className="relatore-card-meta">
                    <span>
                      Creato:{" "}
                      {new Date(questionario.created_at).toLocaleDateString(
                        "it-IT"
                      )}
                    </span>
                  </div>
                </div>

                <div className="relatore-card-footer">
                  <button
                    onClick={() => handleViewResponses(questionario)}
                    className="btn-small-modern btn-view"
                  >
                    Risposte
                  </button>
                  <button
                    onClick={() => handleShare(questionario)}
                    className="btn-small-modern btn-share"
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
