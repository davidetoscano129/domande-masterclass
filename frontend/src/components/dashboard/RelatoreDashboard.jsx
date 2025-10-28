import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import LezioniTab from "./LezioniTab.jsx";
import QuestionariTab from "./QuestionariTab.jsx";
import UtentiTab from "./UtentiTab.jsx";

function RelatoreDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState("lezioni");
  const [lezioni, setLezioni] = useState([]);
  const [questionari, setQuestionari] = useState([]);
  const [utenti, setUtenti] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "lezioni") {
        const response = await fetch(
          `${API_BASE}/lezioni/relatore/${user.relatore.id}`
        );
        const data = await response.json();
        setLezioni(data);
      } else if (activeTab === "questionari") {
        const response = await fetch(
          `${API_BASE}/questionari/relatore/${user.relatore.id}`
        );
        const data = await response.json();
        setQuestionari(data);
      } else if (activeTab === "utenti") {
        const response = await fetch(`${API_BASE}/utenti`);
        const data = await response.json();
        setUtenti(data);
      }
    } catch (error) {
      console.error("Errore nel caricamento dati:", error);
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-modern relatore-dashboard">
      <header className="dashboard-header-modern relatore-header">
        <div className="dashboard-user-info">
          <h1>Dashboard Relatore</h1>
          <p className="user-subtitle">
            <span className="relatore-name">{user.relatore.nome}</span> - I
            TESORI dell'IMPRESA
          </p>
        </div>
        <button onClick={onLogout} className="btn-logout-modern">
          Logout
        </button>
      </header>

      <nav className="dashboard-nav-modern">
        <div className="nav-container">
          <button
            className={`nav-btn-modern ${
              activeTab === "lezioni" ? "active" : ""
            }`}
            onClick={() => setActiveTab("lezioni")}
          >
            <span className="nav-text">Lezioni</span>
          </button>
          <button
            className={`nav-btn-modern ${
              activeTab === "questionari" ? "active" : ""
            }`}
            onClick={() => setActiveTab("questionari")}
          >
            <span className="nav-text">Questionari</span>
          </button>
          <button
            className={`nav-btn-modern ${
              activeTab === "utenti" ? "active" : ""
            }`}
            onClick={() => setActiveTab("utenti")}
          >
            <span className="nav-text">Utenti</span>
          </button>
        </div>
      </nav>

      <main className="dashboard-content-modern relatore-content">
        <div className="content-wrapper-modern">
          {loading ? (
            <div className="loading-modern">
              <div className="loading-spinner"></div>
              <p>Caricamento...</p>
            </div>
          ) : (
            <div className="tab-content-modern">
              {activeTab === "lezioni" && (
                <LezioniTab
                  lezioni={lezioni}
                  user={user}
                  onUpdate={fetchData}
                />
              )}
              {activeTab === "questionari" && (
                <QuestionariTab
                  questionari={questionari}
                  user={user}
                  onUpdate={fetchData}
                />
              )}
              {activeTab === "utenti" && <UtentiTab utenti={utenti} />}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default RelatoreDashboard;
