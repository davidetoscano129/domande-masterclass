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
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard {user.relatore.nome}</h1>
        <button onClick={onLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === "lezioni" ? "active" : ""}
          onClick={() => setActiveTab("lezioni")}
        >
          Lezioni
        </button>
        <button
          className={activeTab === "questionari" ? "active" : ""}
          onClick={() => setActiveTab("questionari")}
        >
          Questionari
        </button>
        <button
          className={activeTab === "utenti" ? "active" : ""}
          onClick={() => setActiveTab("utenti")}
        >
          Utenti
        </button>
      </nav>

      <main className="dashboard-content">
        {loading ? (
          <p>Caricamento...</p>
        ) : (
          <div>
            {activeTab === "lezioni" && (
              <LezioniTab lezioni={lezioni} user={user} onUpdate={fetchData} />
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
      </main>
    </div>
  );
}

export default RelatoreDashboard;
