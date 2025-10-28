import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";
import QuestionarioViewer from "../questionari/QuestionarioViewer.jsx";

function UtenteDashboard({ user, onLogout }) {
  const [questionari, setQuestionari] = useState([]);
  const [relatori, setRelatori] = useState([]);
  const [activeQuestionario, setActiveQuestionario] = useState(null);
  const [selectedRelatore, setSelectedRelatore] = useState(null);
  const [loadingQuestionari, setLoadingQuestionari] = useState(true);
  const [loadingRelatori, setLoadingRelatori] = useState(true);

  const loading = loadingQuestionari || loadingRelatori;

  useEffect(() => {
    fetchQuestionari();
    fetchRelatori();
  }, []);

  const fetchQuestionari = async () => {
    try {
      const response = await fetch(`${API_BASE}/questionari`);
      const data = await response.json();

      // Controlla quali questionari sono già stati compilati
      const questionariWithStatus = await Promise.all(
        data.map(async (questionario) => {
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
    } catch (error) {
      console.error("Errore nel caricamento questionari:", error);
    }
    setLoadingQuestionari(false);
  };

  const fetchRelatori = async () => {
    try {
      const response = await fetch(`${API_BASE}/relatori`);
      const data = await response.json();
      setRelatori(data);
    } catch (error) {
      console.error("Errore nel caricamento relatori:", error);
    }
    setLoadingRelatori(false);
  };

  // Raggruppa questionari per relatore - include tutti i relatori
  const getQuestionariPerRelatore = () => {
    // Prima raggruppa i questionari per relatore
    const questionariPerRelatore = questionari.reduce((acc, questionario) => {
      const relatoreKey = questionario.relatore_id;
      if (!acc[relatoreKey]) {
        acc[relatoreKey] = {
          relatore_id: questionario.relatore_id,
          relatore_nome: questionario.relatore_nome,
          questionari: [],
        };
      }
      acc[relatoreKey].questionari.push(questionario);
      return acc;
    }, {});

    // Poi aggiungi tutti i relatori che non hanno questionari
    relatori.forEach((relatore) => {
      if (!questionariPerRelatore[relatore.id]) {
        questionariPerRelatore[relatore.id] = {
          relatore_id: relatore.id,
          relatore_nome: relatore.nome,
          questionari: [],
        };
      }
    });

    return Object.values(questionariPerRelatore);
  };

  // Raggruppa questionari per lezione di un relatore specifico
  const getQuestionariPerLezioneDelRelatore = (relatoreId) => {
    const questionariDelRelatore = questionari.filter(
      (q) => q.relatore_id === relatoreId
    );

    const questionariPerLezione = questionariDelRelatore.reduce(
      (acc, questionario) => {
        const lezioneKey = questionario.lezione_id;
        if (!acc[lezioneKey]) {
          acc[lezioneKey] = {
            lezione_id: questionario.lezione_id,
            lezione_titolo: questionario.lezione_titolo,
            lezione_numero: questionario.lezione_numero || 0,
            relatore_nome: questionario.relatore_nome,
            questionari: [],
          };
        }
        acc[lezioneKey].questionari.push(questionario);
        return acc;
      },
      {}
    );

    // Ordina le lezioni per numero
    return Object.values(questionariPerLezione).sort(
      (a, b) => a.lezione_numero - b.lezione_numero
    );
  };

  if (activeQuestionario) {
    return (
      <QuestionarioViewer
        questionario={activeQuestionario}
        user={user}
        onBack={() => setActiveQuestionario(null)}
        onComplete={() => {
          setActiveQuestionario(null);
          fetchQuestionari();
        }}
      />
    );
  }

  return (
    <div className="dashboard-modern">
      <header className="dashboard-header-modern">
        <div className="dashboard-user-info">
          <h1>Benvenuto, {user.utente.nome}</h1>
          <p className="user-subtitle">
            Area Personale - I TESORI dell'IMPRESA
          </p>
        </div>
        <button onClick={onLogout} className="btn-logout-modern">
          Logout
        </button>
      </header>

      <main className="dashboard-content-modern">
        {!selectedRelatore ? (
          // Vista iniziale: lista dei relatori con materie
          <>
            <div className="tesori-header-modern">
              <div className="tesori-logo-container">
                <h1 className="tesori-logo">
                  <span className="tesori-i">I</span>
                  <span className="tesori-tesori">TESORI</span>
                  <span className="tesori-dell">dell'</span>
                  <span className="tesori-impresa">IMPRESA</span>
                </h1>
                <p className="tesori-subtitle">
                  Benvenuto nella tua{" "}
                  <span className="area-highlight">Area riservata</span> qui
                  potrai visionare tutti i contenuti degli incontri già avvenuti
                </p>
              </div>
            </div>
            {loading ? (
              <p>Caricamento...</p>
            ) : (
              <div className="tesori-grid">
                {(() => {
                  // Mappa dei relatori con le loro materie e colori
                  const relatoriMaterie = {
                    "Relatore 1": {
                      materia: "SVILUPPO DELL'IDEA PROGETTUALE",
                      relatore: "Alessandro Cacciato",
                      descrizione: "Dall'idea innovativa al progetto",
                      color: "blue",
                    },
                    "Relatore 2": {
                      materia: "PROGETTAZIONE E PIANIFICAZIONE FINANZIARIA",
                      relatore: "Raffaele Di Giacomo",
                      descrizione: "Progettazione e pianificazione finanziaria",
                      color: "yellow",
                    },
                    "Relatore 3": {
                      materia: "COMUNICAZIONE & MARKETING",
                      relatore: "Gianluca Lo Stimolo",
                      descrizione: "Comunicazione e marketing",
                      color: "blue",
                    },
                    "Relatore 4": {
                      materia: "GESTIONE DELLE EMOZIONI",
                      relatore: "Matteo Maserati",
                      descrizione: "La gestione delle emozioni",
                      color: "yellow",
                    },
                    "Relatore 5": {
                      materia: "INTELLIGENZA ARTIFICIALE",
                      relatore: "Yuri Beccaria",
                      descrizione: "Innovazione & AI",
                      color: "blue",
                    },
                  }; // Special case for "L'ora dell'imprenditore"
                  const oraImprenditore = {
                    materia: "L'ORA DELL'IMPRENDITORE",
                    descrizione: "L'ora dell'imprenditore",
                    color: "yellow",
                  };

                  const relatoriConMaterie = getQuestionariPerRelatore().map(
                    (relatore) => {
                      const materiaInfo =
                        relatoriMaterie[relatore.relatore_nome];
                      const totalQuestionari = relatore.questionari.length;
                      const completedQuestionari = relatore.questionari.filter(
                        (q) => q.hasAnswered
                      ).length;

                      return {
                        ...relatore,
                        materiaInfo: materiaInfo || {
                          materia: relatore.relatore_nome.toUpperCase(),
                          relatore: relatore.relatore_nome,
                          descrizione: relatore.relatore_nome,
                          color: "blue",
                        },
                        totalQuestionari,
                        completedQuestionari,
                        progressPercentage:
                          totalQuestionari > 0
                            ? Math.round(
                                (completedQuestionari / totalQuestionari) * 100
                              )
                            : 0,
                      };
                    }
                  );

                  return (
                    <>
                      {relatoriConMaterie.map((relatore, index) => (
                        <div
                          key={relatore.relatore_id}
                          className={`tesoro-card-modern tesoro-${relatore.materiaInfo.color}`}
                          onClick={() => setSelectedRelatore(relatore)}
                        >
                          <div className="tesoro-card-inner">
                            <div className="tesoro-instructor-image">
                              <div className="instructor-placeholder">
                                {relatore.materiaInfo.relatore
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("") || "R"}
                              </div>
                            </div>
                            <div className="tesoro-content-modern">
                              <h2 className="tesoro-title-modern">
                                {relatore.materiaInfo.materia}
                              </h2>
                              <h3 className="tesoro-instructor-name">
                                {relatore.materiaInfo.relatore ||
                                  relatore.relatore_nome}
                              </h3>
                              <div className="tesoro-progress-section">
                                <div className="progress-bar-container">
                                  <div
                                    className="progress-bar-fill"
                                    style={{
                                      width: `${relatore.progressPercentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <span className="progress-text">
                                  {relatore.completedQuestionari}/
                                  {relatore.totalQuestionari} completati (
                                  {relatore.progressPercentage}%)
                                </span>
                              </div>
                              <button className="tesoro-view-btn">
                                Vedi Contenuto
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Card speciale per "L'ora dell'imprenditore" */}
                      <div
                        className={`tesoro-card-modern tesoro-${oraImprenditore.color} tesoro-coming-soon-card`}
                      >
                        <div className="tesoro-card-inner">
                          <div className="tesoro-instructor-image">
                            <div className="instructor-placeholder">OI</div>
                          </div>
                          <div className="tesoro-content-modern">
                            <h2 className="tesoro-title-modern">
                              {oraImprenditore.materia}
                            </h2>
                            <h3 className="tesoro-instructor-name">
                              Prossimamente
                            </h3>
                            <div className="tesoro-coming-soon-modern">
                              <span className="coming-soon-badge">
                                In arrivo
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </>
        ) : (
          // Vista questionari del relatore selezionato
          <div className="relatore-section-modern">
            <div className="back-button-container-modern">
              <button
                onClick={() => setSelectedRelatore(null)}
                className="btn-back-modern"
              >
                Torna ai Relatori
              </button>
            </div>

            <div className="relatore-header-modern">
              <h2>Questionari di {selectedRelatore.relatore_nome}</h2>
              <div className="relatore-progress-overview">
                <span className="overview-text">
                  {selectedRelatore.completedQuestionari} su{" "}
                  {selectedRelatore.totalQuestionari} questionari completati
                </span>
                <div className="overview-progress-bar">
                  <div
                    className="overview-progress-fill"
                    style={{ width: `${selectedRelatore.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="questionari-by-lesson-modern">
              {getQuestionariPerLezioneDelRelatore(
                selectedRelatore.relatore_id
              ).map((lezione) => (
                <div key={lezione.lezione_id} className="lesson-section-modern">
                  <div className="lesson-header-modern">
                    <h3>
                      {lezione.lezione_titolo}
                      {lezione.lezione_numero > 0 && (
                        <span className="lesson-number-modern">
                          #{lezione.lezione_numero}
                        </span>
                      )}
                    </h3>
                    <p className="lesson-instructor-modern">
                      Relatore: {lezione.relatore_nome}
                    </p>
                    <div className="lesson-stats-modern">
                      <span className="stats-badge">
                        {lezione.questionari.length} questionari
                      </span>
                      <span className="stats-badge completed">
                        {
                          lezione.questionari.filter((q) => q.hasAnswered)
                            .length
                        }{" "}
                        completati
                      </span>
                    </div>
                  </div>

                  <div className="lesson-questionari-modern">
                    {lezione.questionari.map((questionario) => (
                      <div
                        key={questionario.id}
                        className="questionario-card-modern"
                      >
                        <div className="questionario-status-modern">
                          {questionario.hasAnswered ? (
                            <span className="status-modern completed">
                              <span className="status-icon">✓</span>
                              Completato
                            </span>
                          ) : (
                            <span className="status-modern pending">
                              <span className="status-icon">○</span>
                              Da fare
                            </span>
                          )}
                        </div>

                        <div className="questionario-content-modern">
                          <h4>{questionario.titolo}</h4>
                          <p>{questionario.descrizione}</p>

                          <div className="questionario-actions-modern">
                            {questionario.hasAnswered ? (
                              <button
                                onClick={() =>
                                  setActiveQuestionario(questionario)
                                }
                                className="btn-secondary-modern"
                              >
                                Rivedi Risposte
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  setActiveQuestionario(questionario)
                                }
                                className="btn-primary-modern"
                              >
                                Inizia
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default UtenteDashboard;
