import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import QuestionarioEditor from "../questionari/QuestionarioEditor.jsx";
import ResponsesViewer from "../shared/ResponsesViewer.jsx";
import ShareModal from "../shared/ShareModal.jsx";

function QuestionariTab({ questionari, user, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestionario, setEditingQuestionario] = useState(null);
  const [lezioni, setLezioni] = useState([]);
  const [showResponses, setShowResponses] = useState(false);
  const [selectedQuestionario, setSelectedQuestionario] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);

  useEffect(() => {
    fetchLezioni();
  }, []);

  const fetchLezioni = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/lezioni/relatore/${user.relatore.id}`
      );
      const data = await response.json();
      setLezioni(data);
    } catch (error) {
      console.error("Errore nel caricamento lezioni:", error);
    }
  };

  const handleEdit = (questionario) => {
    setEditingQuestionario(questionario);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Sei sicuro di voler eliminare questo questionario?")) {
      try {
        await fetch(`${API_BASE}/questionari/${id}`, { method: "DELETE" });
        onUpdate();
      } catch (error) {
        console.error("Errore eliminazione questionario:", error);
      }
    }
  };

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
        <div className="header-content">
          <h2>I miei Questionari</h2>
          <p className="section-subtitle">
            Crea e gestisci i questionari per le tue lezioni
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingQuestionario(null);
          }}
          className={`btn-action-modern ${
            showForm ? "btn-cancel" : "btn-create"
          }`}
        >
          {showForm ? "Annulla" : "Nuovo Questionario"}
        </button>
      </div>

      {showForm && (
        <QuestionarioEditor
          questionario={editingQuestionario}
          lezioni={lezioni}
          user={user}
          onSave={() => {
            setShowForm(false);
            setEditingQuestionario(null);
            onUpdate();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingQuestionario(null);
          }}
        />
      )}

      <div className="content-section-modern">
        {questionari.length === 0 ? (
          <div className="empty-state-modern">
            <h3>Nessun questionario creato</h3>
            <p>
              Inizia creando il tuo primo questionario usando il pulsante "Nuovo
              Questionario"
            </p>
          </div>
        ) : (
          <div className="items-grid-modern">
            {questionari.map((questionario) => (
              <div
                key={questionario.id}
                className="item-card-modern questionario-card-modern"
              >
                <div className="card-content-modern">
                  <h3 className="questionario-title">{questionario.titolo}</h3>
                  <p className="questionario-description">
                    {questionario.descrizione}
                  </p>
                  <div className="questionario-meta">
                    <span className="lesson-badge">
                      Lezione: {questionario.lezione_titolo}
                    </span>
                    <span className="creation-date">
                      {new Date(questionario.created_at).toLocaleDateString(
                        "it-IT"
                      )}
                    </span>
                  </div>
                </div>

                <div className="questionario-actions">
                  <button
                    onClick={() => handleEdit(questionario)}
                    className="btn-secondary-modern btn-small-modern"
                  >
                    Modifica
                  </button>
                  <button
                    onClick={() => handleDelete(questionario.id)}
                    className="btn-delete-modern btn-small-modern"
                  >
                    Elimina
                  </button>
                  <button
                    onClick={() => handleViewResponses(questionario)}
                    className="btn-primary-modern btn-small-modern"
                  >
                    Risposte
                  </button>
                  <button
                    onClick={() => handleShare(questionario)}
                    className="btn-action-modern btn-small-modern"
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

export default QuestionariTab;
