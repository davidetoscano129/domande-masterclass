import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import QuestionarioViewer from "../questionari/QuestionarioViewer.jsx";
import "../../styles/design-system.css";
import "../../styles/dashboard.css";

function UtenteDashboard({ user, onLogout }) {
  const [questionari, setQuestionari] = useState([]);
  const [relatori, setRelatori] = useState([]);
  const [activeQuestionario, setActiveQuestionario] = useState(null);
  const [selectedRelatore, setSelectedRelatore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const questionariRes = await fetch(`${API_BASE}/questionari`);
      const relatoriRes = await fetch(`${API_BASE}/relatori`);

      const questionariData = await questionariRes.json();
      const relatoriData = await relatoriRes.json();

      const questionariWithStatus = await Promise.all(
        questionariData.map(async (questionario) => {
          const checkResponse = await fetch(
            `${API_BASE}/risposte/check/${questionario.id}/${user.utente.id}`
          );
          const checkData = await checkResponse.json();
          return {
            ...questionario,
            hasAnswered: checkData.hasAnswered,
            risposta: checkData.risposta,
          };
        })
      );

      setQuestionari(questionariWithStatus);
      setRelatori(relatoriData);
    } catch (error) {
      console.error("Errore:", error);
    }
    setLoading(false);
  };

  const getRelatoriWithStats = () => {
    const relatoriMap = {};
    relatori.forEach((relatore) => {
      relatoriMap[relatore.id] = {
        id: relatore.id,
        nome: relatore.nome,
        questionari: [],
        totalQuestionari: 0,
        completedQuestionari: 0,
      };
    });
    questionari.forEach((q) => {
      if (relatoriMap[q.relatore_id]) {
        relatoriMap[q.relatore_id].questionari.push(q);
        relatoriMap[q.relatore_id].totalQuestionari++;
        if (q.hasAnswered) relatoriMap[q.relatore_id].completedQuestionari++;
      }
    });
    return Object.values(relatoriMap).map((r) => ({
      ...r,
      progress:
        r.totalQuestionari > 0
          ? Math.round((r.completedQuestionari / r.totalQuestionari) * 100)
          : 0,
    }));
  };

  const getLezioniForRelatore = (relatoreId) => {
    const lezioniMap = {};
    questionari
      .filter((q) => q.relatore_id === relatoreId)
      .forEach((q) => {
        if (!lezioniMap[q.lezione_id]) {
          lezioniMap[q.lezione_id] = {
            id: q.lezione_id,
            numero: q.lezione_numero || 0,
            titolo: q.lezione_titolo,
            questionari: [],
          };
        }
        lezioniMap[q.lezione_id].questionari.push(q);
      });
    return Object.values(lezioniMap).sort((a, b) => a.numero - b.numero);
  };

  if (activeQuestionario) {
    return (
      <QuestionarioViewer
        questionario={activeQuestionario}
        user={user}
        onBack={() => setActiveQuestionario(null)}
        onComplete={() => {
          setActiveQuestionario(null);
          fetchData();
        }}
      />
    );
  }

  if (loading)
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <div>
            <div className="header-title">{user.utente.nome}</div>
            <div className="header-subtitle">Studente</div>
          </div>
          <div className="header-actions">
            <button onClick={onLogout} className="btn btn-text">
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="hero">
        <div className="hero-logo-container">
          <img
            src="/images/logo-tesoridellimpresa.png"
            alt="I Tesori dell'Impresa"
            className="hero-logo-image"
          />
        </div>
        <p className="hero-subtitle">
          Accedi ai questionari e completa il tuo percorso formativo
        </p>
      </div>
      {!selectedRelatore ? (
        <section className="section">
          <div className="section-header">
            <div>
              <h2 className="section-title">Relatori</h2>
              <p className="section-description">
                Seleziona un relatore per accedere ai questionari
              </p>
            </div>
          </div>
          {getRelatoriWithStats().length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-state-title">Nessun relatore disponibile</h3>
            </div>
          ) : (
            <div className="relatori-grid">
              {getRelatoriWithStats().map((relatore) => (
                <div
                  key={relatore.id}
                  className="relatore-card"
                  onClick={() => setSelectedRelatore(relatore)}
                >
                  <div className="relatore-card-header">
                    <div className="relatore-avatar">
                      {relatore.nome
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <h3 className="relatore-name">{relatore.nome}</h3>
                  </div>
                  <div className="relatore-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {relatore.totalQuestionari}
                      </span>
                      <span className="stat-label">Questionari</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">
                        {relatore.completedQuestionari}
                      </span>
                      <span className="stat-label">Completati</span>
                    </div>
                  </div>
                  {relatore.totalQuestionari > 0 && (
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${relatore.progress}%` }}
                      ></div>
                    </div>
                  )}
                  <div className="relatore-card-footer">
                    <span className="progress-text">
                      {relatore.progress}% completato
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="section">
          <div className="section-header">
            <div>
              <button
                onClick={() => setSelectedRelatore(null)}
                className="btn btn-text"
                style={{ marginBottom: "var(--space-md)" }}
              >
                ← Torna ai relatori
              </button>
              <h2 className="section-title">{selectedRelatore.nome}</h2>
              <p className="section-description">
                {selectedRelatore.completedQuestionari} di{" "}
                {selectedRelatore.totalQuestionari} questionari completati
              </p>
            </div>
          </div>
          {getLezioniForRelatore(selectedRelatore.id).length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-state-title">
                Nessun questionario disponibile
              </h3>
              <p className="empty-state-description">
                Questo relatore non ha ancora pubblicato questionari
              </p>
            </div>
          ) : (
            getLezioniForRelatore(selectedRelatore.id).map((lezione) => (
              <div key={lezione.id} className="lezione-card">
                <div className="lezione-header">
                  <div className="lezione-info">
                    <span className="lezione-number">
                      Lezione {lezione.numero}
                    </span>
                    <h3 className="lezione-title">{lezione.titolo}</h3>
                  </div>
                  <div className="lezione-stats">
                    <div className="stat">
                      <span className="stat-value">
                        {lezione.questionari.length}
                      </span>
                      <span className="stat-label">Questionari</span>
                    </div>
                  </div>
                </div>
                <div className="questionari-section">
                  {lezione.questionari.map((q) => (
                    <div key={q.id} className="questionario-item">
                      <div className="questionario-info">
                        <h5 className="questionario-title">{q.titolo}</h5>
                        <div className="questionario-meta">
                          {q.hasAnswered ? (
                            <span className="badge badge-active">
                              Completato
                            </span>
                          ) : (
                            <span className="badge badge-inactive">
                              Da completare
                            </span>
                          )}
                          <span className="badge badge-neutral">
                            {q.domande?.length || 0} domande
                          </span>
                        </div>
                      </div>
                      <div className="questionario-actions">
                        {q.attivo ? (
                          <button
                            onClick={() => setActiveQuestionario(q)}
                            className="btn btn-primary"
                          >
                            {q.hasAnswered ? "Rivedi" : "Inizia"}
                          </button>
                        ) : (
                          <span className="badge badge-inactive">
                            Non disponibile
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}

export default UtenteDashboard;
