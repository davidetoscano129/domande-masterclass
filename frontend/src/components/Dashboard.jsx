import { useState, useEffect } from "react";
import { questionnaires } from "../services/api";
import QuestionnaireEditor from "./QuestionnaireEditor";

function Dashboard({ onLogout }) {
  const [view, setView] = useState("list"); // 'list' o 'editor'
  const [questionnairesList, setQuestionnairesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    setView("editor");
  };

  // Torna alla lista
  const goToList = () => {
    setView("list");
    loadQuestionnaires(); // Ricarica la lista
  };

  // Gestisci salvataggio
  const handleSave = () => {
    goToList();
  };

  // Se siamo nell'editor, mostra solo quello
  if (view === "editor") {
    return <QuestionnaireEditor onBack={goToList} onSave={handleSave} />;
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
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        marginRight: "8px",
                      }}
                    >
                      Modifica
                    </button>
                    <button
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                      }}
                    >
                      Visualizza
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
