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
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Area {user.utente.nome}</h1>
        <button onClick={onLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        {!selectedRelatore ? (
          // Vista iniziale: lista dei relatori con materie
          <>
            <div className="tesori-header">
              <h1>I TESORI DELL'IMPRESA</h1>
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
                      {relatoriConMaterie.map((relatore) => (
                        <div
                          key={relatore.relatore_id}
                          className={`tesoro-card tesoro-${relatore.materiaInfo.color}`}
                          onClick={() => setSelectedRelatore(relatore)}
                        >
                          <div className="tesoro-content">
                            <h2 className="tesoro-materia">
                              {relatore.materiaInfo.materia}
                            </h2>
                            <p className="tesoro-relatore">
                              {relatore.materiaInfo.relatore ||
                                relatore.relatore_nome}
                            </p>
                            <div className="tesoro-stats">
                              <span>
                                {relatore.completedQuestionari}/
                                {relatore.totalQuestionari} completati
                              </span>
                              <span>{relatore.progressPercentage}%</span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Card speciale per "L'ora dell'imprenditore" */}
                      <div
                        className={`tesoro-card tesoro-${oraImprenditore.color}`}
                      >
                        <div className="tesoro-content">
                          <h2 className="tesoro-materia">
                            {oraImprenditore.materia}
                          </h2>
                          <div className="tesoro-coming-soon">In arrivo</div>
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
          <>
            <div className="back-button-container">
              <button
                onClick={() => setSelectedRelatore(null)}
                className="btn-back-prominent"
              >
                ← Torna ai Relatori
              </button>
            </div>

            <h2>Questionari di {selectedRelatore.relatore_nome}</h2>

            <div className="questionari-by-lesson">
              {getQuestionariPerLezioneDelRelatore(
                selectedRelatore.relatore_id
              ).map((lezione) => (
                <div key={lezione.lezione_id} className="lesson-section">
                  <div className="lesson-header">
                    <h3>
                      {lezione.lezione_titolo}
                      {lezione.lezione_numero > 0 && (
                        <span className="lesson-number">
                          #{lezione.lezione_numero}
                        </span>
                      )}
                    </h3>
                    <p className="lesson-instructor">
                      Relatore: {lezione.relatore_nome}
                    </p>
                    <div className="lesson-stats">
                      {lezione.questionari.length} questionari •{" "}
                      {lezione.questionari.filter((q) => q.hasAnswered).length}{" "}
                      completati
                    </div>
                  </div>

                  <div className="lesson-questionari">
                    {lezione.questionari.map((questionario) => (
                      <div key={questionario.id} className="questionario-card">
                        <div className="questionario-status">
                          {questionario.hasAnswered ? (
                            <span className="status completed">Completato</span>
                          ) : (
                            <span className="status pending">Da fare</span>
                          )}
                        </div>

                        <h4>{questionario.titolo}</h4>
                        <p>{questionario.descrizione}</p>

                        <div className="questionario-actions">
                          {questionario.hasAnswered ? (
                            <button
                              onClick={() =>
                                setActiveQuestionario(questionario)
                              }
                              className="btn-secondary"
                            >
                              Rivedi Risposte
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setActiveQuestionario(questionario)
                              }
                              className="btn-primary"
                            >
                              Inizia
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default UtenteDashboard;
