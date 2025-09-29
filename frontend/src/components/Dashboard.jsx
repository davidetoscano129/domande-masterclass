import { useState, useEffect } from "react";
import { questionnaires } from "../services/api";

function Dashboard({ onLogout }) {
  const [questionnairesList, setQuestionnairesList] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newQuestionnaire, setNewQuestionnaire] = useState({
    title: "",
    description: "",
  });

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

  const handleCreateQuestionnaire = async (e) => {
    e.preventDefault();

    try {
      await questionnaires.create(newQuestionnaire);
      setNewQuestionnaire({ title: "", description: "" });
      setShowCreateForm(false);
      loadQuestionnaires(); // Ricarica la lista
    } catch (err) {
      setError("Errore nella creazione del questionario");
    }
  };

  const handleInputChange = (e) => {
    setNewQuestionnaire({
      ...newQuestionnaire,
      [e.target.name]: e.target.value,
    });
  };

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

      {/* Bottone Nuovo Questionario */}
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
          }}
        >
          {showCreateForm ? "Annulla" : "+ Nuovo Questionario"}
        </button>
      </div>

      {/* Form Creazione Questionario */}
      {showCreateForm && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #ddd",
          }}
        >
          <h3>Crea Nuovo Questionario</h3>
          <form onSubmit={handleCreateQuestionnaire}>
            <div style={{ marginBottom: "15px" }}>
              <input
                type="text"
                name="title"
                placeholder="Titolo del questionario"
                value={newQuestionnaire.title}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "10px" }}
              />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <textarea
                name="description"
                placeholder="Descrizione (opzionale)"
                value={newQuestionnaire.description}
                onChange={handleInputChange}
                rows="3"
                style={{ width: "100%", padding: "10px" }}
              />
            </div>
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
              }}
            >
              Crea Questionario
            </button>
          </form>
        </div>
      )}

      {/* Errori */}
      {error && (
        <div style={{ color: "red", marginBottom: "20px" }}>{error}</div>
      )}

      {/* Lista Questionari */}
      <div>
        <h2>Lista Questionari ({questionnairesList.length})</h2>

        {loading ? (
          <p>Caricamento...</p>
        ) : questionnairesList.length === 0 ? (
          <p>Nessun questionario presente. Creane uno nuovo!</p>
        ) : (
          <div>
            {questionnairesList.map((questionnaire) => (
              <div
                key={questionnaire.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "10px",
                  backgroundColor: "white",
                }}
              >
                <h4>{questionnaire.title}</h4>
                <p style={{ color: "#666", margin: "5px 0" }}>
                  {questionnaire.description || "Nessuna descrizione"}
                </p>
                <small style={{ color: "#888" }}>
                  Creato il:{" "}
                  {new Date(questionnaire.created_at).toLocaleDateString(
                    "it-IT"
                  )}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
