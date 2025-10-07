import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shared } from "../services/api";

function UserArea() {
  const [user, setUser] = useState(null);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadUserQuestionnaires();
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem("external_user_token");
    if (!token) {
      navigate("/");
      return;
    }

    // Decodifica token per ottenere info utente (basic)
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUser({
        email: payload.email,
        userId: payload.userId,
      });
    } catch (error) {
      console.error("Token non valido:", error);
      localStorage.removeItem("external_user_token");
      navigate("/");
    }
  };

  const loadUserQuestionnaires = async () => {
    try {
      setLoading(true);
      const response = await shared.getUserQuestionnaires();
      setQuestionnaires(response.questionnaires || []);
      console.log("📋 Questionari caricati:", response.questionnaires);
    } catch (error) {
      console.error("Errore caricamento questionari:", error);
      setError("Errore nel caricamento dei questionari");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("external_user_token");
    navigate("/");
  };

  const handleQuestionnaireClick = (questionnaire) => {
    // Reindirizza al questionario condiviso
    navigate(`/share/${questionnaire.share_token}`);
  };

  const getStatusBadge = (status, completedAt) => {
    if (status === "completed" || completedAt) {
      return (
        <span
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          ✅ Completato
        </span>
      );
    } else {
      return (
        <span
          style={{
            backgroundColor: "#ffc107",
            color: "#000",
            padding: "4px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        >
          ⏰ Da Completare
        </span>
      );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #007bff",
              borderRadius: "50%",
              margin: "0 auto 15px",
            }}
          ></div>
          <p>Caricamento...</p>
        </div>
      </div>
    );
  }

  // Statistiche
  const totalQuestionnaires = questionnaires.length;
  const completedQuestionnaires = questionnaires.filter(
    (q) => q.status === "completed" || q.completed_at
  ).length;
  const pendingQuestionnaires = totalQuestionnaires - completedQuestionnaires;

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#333" }}>👤 Area Personale</h1>
          <p style={{ margin: "5px 0 0 0", color: "#666" }}>
            Benvenuto, {user?.email}
          </p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      {/* Statistiche */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "2em" }}>{totalQuestionnaires}</h2>
          <p style={{ margin: "5px 0 0 0" }}>Questionari Totali</p>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#28a745",
            color: "white",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "2em" }}>
            {completedQuestionnaires}
          </h2>
          <p style={{ margin: "5px 0 0 0" }}>Completati</p>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: "#ffc107",
            color: "#000",
            borderRadius: "8px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "2em" }}>
            {pendingQuestionnaires}
          </h2>
          <p style={{ margin: "5px 0 0 0" }}>Da Completare</p>
        </div>
      </div>

      {/* Messaggio di errore */}
      {error && (
        <div
          style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "15px",
            borderRadius: "5px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {/* Lista Questionari */}
      <div>
        <h2 style={{ marginBottom: "20px", color: "#333" }}>
          📋 I Tuoi Questionari
        </h2>

        {questionnaires.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              color: "#666",
            }}
          >
            <h3>Nessun questionario assegnato</h3>
            <p>Non hai ancora ricevuto questionari da completare.</p>
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {questionnaires.map((questionnaire) => (
              <div
                key={questionnaire.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "20px",
                  backgroundColor: "white",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                  transition: "box-shadow 0.2s",
                }}
                onClick={() => handleQuestionnaireClick(questionnaire)}
                onMouseEnter={(e) => {
                  e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "10px",
                  }}
                >
                  <h3 style={{ margin: 0, color: "#333" }}>
                    {questionnaire.title}
                  </h3>
                  {getStatusBadge(
                    questionnaire.status,
                    questionnaire.completed_at
                  )}
                </div>

                <p
                  style={{
                    color: "#666",
                    margin: "10px 0",
                    lineHeight: "1.5",
                  }}
                >
                  {questionnaire.description}
                </p>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "14px",
                    color: "#888",
                  }}
                >
                  <span>📊 Domande: {questionnaire.total_questions || 0}</span>
                  <span>
                    🕒 Condiviso il: {formatDate(questionnaire.assigned_at)}
                  </span>
                  {questionnaire.completed_at && (
                    <span>
                      ✅ Completato il: {formatDate(questionnaire.completed_at)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserArea;
