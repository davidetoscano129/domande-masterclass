import { useState, useEffect } from "react";
import { questionnaires } from "../services/api";
import QuestionnaireEditor from "./QuestionnaireEditor";
import QuestionnaireViewer from "./QuestionnaireViewer";
import ResponsesViewer from "./ResponsesViewer";

function Dashboard({ onLogout }) {
  const [view, setView] = useState("list"); // 'list', 'editor', 'viewer', 'responses'
  const [questionnairesList, setQuestionnairesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState(null);
  const [editQuestionnaireId, setEditQuestionnaireId] = useState(null);

  // Stati per la condivisione
  const [shareModal, setShareModal] = useState({
    open: false,
    questionnaire: null,
    shareUrl: null,
  });
  const [shareLoading, setShareLoading] = useState(false);

  // Carica questionari all'avvio
  useEffect(() => {
    loadQuestionnaires();
  }, []);

  const loadQuestionnaires = async () => {
    try {
      const response = await questionnaires.getAll();
      setQuestionnairesList(response.questionnaires);
    } catch (err) {
      setError("Errore nel caricamento dei questionari");
    } finally {
      setLoading(false);
    }
  };

  // Vai all'editor
  const goToEditor = () => {
    setEditQuestionnaireId(null);
    setView("editor");
  };

  // Vai al visualizzatore
  const goToViewer = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setView("viewer");
  };

  // Vai all'editor per modificare
  const goToEdit = (questionnaire) => {
    setEditQuestionnaireId(questionnaire.id);
    setSelectedQuestionnaire(questionnaire);
    setView("editor");
  };

  // Torna alla lista
  const goToList = () => {
    setView("list");
    setSelectedQuestionnaire(null);
    setEditQuestionnaireId(null);
    loadQuestionnaires(); // Ricarica la lista
  };

  // Vai al visualizzatore risposte
  const goToResponses = (questionnaire) => {
    setSelectedQuestionnaire(questionnaire);
    setView("responses");
  };

  // Gestisci salvataggio
  const handleSave = () => {
    goToList();
  };

  // Gestisci condivisione
  const handleShare = async (questionnaire) => {
    try {
      setShareLoading(true);
      setError("");

      // Genera URL corretto per il frontend
      const getFrontendUrl = () => {
        // In sviluppo, usa l'URL completo con http://
        if (
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1"
        ) {
          return `http://${window.location.host}`;
        }
        // In produzione, usa l'origin normale
        return window.location.origin;
      };

      // Se il questionario ha già un token, usa quello
      if (questionnaire.share_token) {
        const shareUrl = `${getFrontendUrl()}/share/${
          questionnaire.share_token
        }`;
        setShareModal({
          open: true,
          questionnaire,
          shareUrl,
        });
      } else {
        // Genera nuovo link di condivisione
        const response = await questionnaires.generateShareLink(
          questionnaire.id
        );
        const shareUrl = `${getFrontendUrl()}/share/${response.share_token}`;

        setShareModal({
          open: true,
          questionnaire: {
            ...questionnaire,
            share_token: response.share_token,
          },
          shareUrl,
        });

        // Aggiorna la lista per riflettere il nuovo stato
        loadQuestionnaires();
      }
    } catch (err) {
      setError(
        "Errore nella generazione del link di condivisione: " + err.message
      );
    } finally {
      setShareLoading(false);
    }
  };

  // Copia link negli appunti
  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareModal.shareUrl);
      alert("Link copiato negli appunti!");
    } catch (err) {
      // Fallback per browser che non supportano clipboard API
      const textArea = document.createElement("textarea");
      textArea.value = shareModal.shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Link copiato negli appunti!");
    }
  };

  // Rimuovi condivisione
  const removeShare = async (questionnaire) => {
    if (
      !confirm("Vuoi davvero rimuovere la condivisione di questo questionario?")
    ) {
      return;
    }

    try {
      setShareLoading(true);
      await questionnaires.removeShare(questionnaire.id);
      setShareModal({ open: false, questionnaire: null, shareUrl: null });
      loadQuestionnaires();
      alert("Condivisione rimossa con successo");
    } catch (err) {
      setError("Errore nella rimozione della condivisione: " + err.message);
    } finally {
      setShareLoading(false);
    }
  };

  // Elimina questionario
  const deleteQuestionnaire = async (questionnaire) => {
    if (
      !confirm(
        `Vuoi davvero eliminare il questionario "${questionnaire.title}"?\n\nQuesta azione è irreversibile e cancellerà anche tutte le risposte raccolte.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await questionnaires.delete(questionnaire.id);
      loadQuestionnaires();
      alert("Questionario eliminato con successo");
    } catch (err) {
      setError("Errore nell'eliminazione del questionario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Se siamo nell'editor, mostra solo quello
  if (view === "editor") {
    return (
      <QuestionnaireEditor
        onBack={goToList}
        onSave={handleSave}
        editQuestionnaireId={editQuestionnaireId}
      />
    );
  }

  // Se siamo nel visualizzatore, mostra solo quello
  if (view === "viewer" && selectedQuestionnaire) {
    return (
      <QuestionnaireViewer
        questionnaireId={selectedQuestionnaire.id}
        onBack={goToList}
        onEdit={() => goToEdit(selectedQuestionnaire)}
      />
    );
  }

  // Se siamo nel visualizzatore risposte, mostra solo quello
  if (view === "responses" && selectedQuestionnaire) {
    return (
      <ResponsesViewer
        questionnaireId={selectedQuestionnaire.id}
        questionnaireName={selectedQuestionnaire.title}
        onBack={goToList}
      />
    );
  }

  // Vista principale semplificata
  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1>I Miei Questionari</h1>
        <button
          onClick={onLogout}
          style={{
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
          }}
        >
          Logout
        </button>
      </div>

      {/* Bottone Principale */}
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <button
          onClick={goToEditor}
          style={{
            padding: "15px 30px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          + Crea Nuovo Questionario
        </button>
      </div>

      {/* Errori */}
      {error && (
        <div
          style={{ color: "red", marginBottom: "20px", textAlign: "center" }}
        >
          {error}
        </div>
      )}

      {/* Lista Questionari Esistenti */}
      <div>
        <h3>Questionari Esistenti ({questionnairesList.length})</h3>

        {loading ? (
          <p style={{ textAlign: "center" }}>Caricamento...</p>
        ) : questionnairesList.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f8f9fa",
              border: "1px solid #ddd",
            }}
          >
            <p style={{ fontSize: "16px", color: "#666" }}>
              Nessun questionario creato ancora.
            </p>
            <p style={{ color: "#888" }}>
              Clicca su "Crea Nuovo Questionario" per iniziare!
            </p>
          </div>
        ) : (
          <div>
            {questionnairesList.map((questionnaire) => (
              <div
                key={questionnaire.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "20px",
                  marginBottom: "15px",
                  backgroundColor: "white",
                  borderRadius: "5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: "0 0 8px 0" }}>
                      {questionnaire.title}
                      {questionnaire.is_public && (
                        <span
                          style={{
                            marginLeft: "10px",
                            padding: "2px 8px",
                            backgroundColor: "#28a745",
                            color: "white",
                            fontSize: "12px",
                            borderRadius: "3px",
                          }}
                        >
                          CONDIVISO
                        </span>
                      )}
                    </h4>
                    <p style={{ color: "#666", margin: "0 0 8px 0" }}>
                      {questionnaire.description || "Nessuna descrizione"}
                    </p>
                    <small style={{ color: "#888" }}>
                      Creato il:{" "}
                      {new Date(questionnaire.created_at).toLocaleDateString(
                        "it-IT"
                      )}
                    </small>
                  </div>
                  <div style={{ marginLeft: "20px" }}>
                    <button
                      onClick={() => goToEdit(questionnaire)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        marginRight: "8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Modifica
                    </button>
                    <button
                      onClick={() => goToViewer(questionnaire)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        marginRight: "8px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Visualizza
                    </button>
                    <button
                      onClick={() => handleShare(questionnaire)}
                      disabled={shareLoading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: questionnaire.is_public
                          ? "#28a745"
                          : "#ffc107",
                        color: questionnaire.is_public ? "white" : "#000",
                        border: "none",
                        borderRadius: "4px",
                        cursor: shareLoading ? "not-allowed" : "pointer",
                        marginRight: "8px",
                      }}
                      title={
                        questionnaire.is_public
                          ? "Gestisci condivisione"
                          : "Condividi questionario"
                      }
                    >
                      {questionnaire.is_public
                        ? "🔗 Condiviso"
                        : "📤 Condividi"}
                    </button>
                    <button
                      onClick={() => goToResponses(questionnaire)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6f42c1",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        marginRight: "8px",
                      }}
                      title="Visualizza risposte raccolte"
                    >
                      📊 Risposte
                    </button>
                    <button
                      onClick={() => deleteQuestionnaire(questionnaire)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      title="Elimina questionario definitivamente"
                    >
                      🗑️ Elimina
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal per la condivisione */}
      {shareModal.open && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80%",
              overflow: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>🔗 Condividi Questionario</h3>

            <div style={{ marginBottom: "20px" }}>
              <strong>{shareModal.questionnaire?.title}</strong>
            </div>

            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "4px",
                marginBottom: "20px",
              }}
            >
              <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                <strong>Link di condivisione:</strong>
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <input
                  type="text"
                  value={shareModal.shareUrl || ""}
                  readOnly
                  style={{
                    flex: 1,
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    backgroundColor: "#fff",
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={copyShareLink}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  📋 Copia
                </button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: "#e7f3ff",
                padding: "15px",
                borderRadius: "4px",
                marginBottom: "20px",
                border: "1px solid #b8daff",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", color: "#004085" }}>
                ℹ️ Come funziona
              </h4>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "20px",
                  fontSize: "14px",
                  color: "#004085",
                }}
              >
                <li>
                  Chiunque abbia questo link può visualizzare e compilare il
                  questionario
                </li>
                <li>Non è richiesta registrazione o login</li>
                <li>
                  Le risposte verranno salvate e associate al tuo questionario
                </li>
                <li>Puoi rimuovere la condivisione in qualsiasi momento</li>
              </ul>
            </div>

            <div
              style={{
                backgroundColor: "#fff3cd",
                padding: "15px",
                borderRadius: "4px",
                marginBottom: "20px",
                border: "1px solid #ffeaa7",
              }}
            >
              <h4 style={{ margin: "0 0 10px 0", color: "#856404" }}>
                📱 Importante per WhatsApp
              </h4>
              <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
                <strong>Su WhatsApp:</strong> Se il link non si apre
                correttamente quando ci clicchi sopra,
                <strong> copialo e incollalo direttamente nel browser</strong>.
                WhatsApp a volte modifica i link localhost causando errori.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button
                onClick={() => removeShare(shareModal.questionnaire)}
                disabled={shareLoading}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: shareLoading ? "not-allowed" : "pointer",
                }}
              >
                🗑️ Rimuovi Condivisione
              </button>

              <button
                onClick={() =>
                  setShareModal({
                    open: false,
                    questionnaire: null,
                    shareUrl: null,
                  })
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
