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
    <div>
      <div className="section-header">
        <h2>I miei Questionari</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingQuestionario(null);
          }}
          className="btn-primary"
        >
          {showForm ? "Annulla" : "+ Nuovo Questionario"}
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

      <div className="items-grid">
        {questionari.map((questionario) => (
          <div key={questionario.id} className="item-card questionario-item">
            <h3>{questionario.titolo}</h3>
            <p>{questionario.descrizione}</p>
            <small>Lezione: {questionario.lezione_titolo}</small>
            <small>
              Creato: {new Date(questionario.created_at).toLocaleDateString()}
            </small>

            <div className="item-actions">
              <button
                onClick={() => handleEdit(questionario)}
                className="btn-small btn-edit"
              >
                Modifica
              </button>
              <button
                onClick={() => handleDelete(questionario.id)}
                className="btn-small btn-delete"
              >
                Elimina
              </button>
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
