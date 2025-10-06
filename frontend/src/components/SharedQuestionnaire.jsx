import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { shared } from "../services/api";

function SharedQuestionnaire() {
  const { token } = useParams();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isHttpsRedirect, setIsHttpsRedirect] = useState(false);

  // Sistema identificazione utenti
  const [userIdentified, setUserIdentified] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true = login, false = registrazione
  const [userInfo, setUserInfo] = useState({
    email: "",
    password: "",
    azienda: "",
    nome: "",
    cognome: "",
  });

  // Risposte dell'utente
  const [answers, setAnswers] = useState({});
  const [respondentInfo, setRespondentInfo] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    // Controlla se siamo su HTTPS su localhost (possibile redirect da WhatsApp)
    if (
      window.location.protocol === "https:" &&
      window.location.hostname === "localhost"
    ) {
      setIsHttpsRedirect(true);
      return;
    }

    loadQuestionnaire();
  }, [token]);
  const loadQuestionnaire = async () => {
    try {
      setLoading(true);
      const response = await shared.getQuestionnaire(token);
      setQuestionnaire(response.questionnaire);

      // Inizializza le risposte vuote
      const initialAnswers = {};
      response.questionnaire.questions.forEach((question) => {
        initialAnswers[question.id] = "";
      });
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err.message || "Errore nel caricamento del questionario");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validazione risposte obbligatorie
    const requiredQuestions = questionnaire.questions.filter(
      (q) => q.is_required
    );
    const missingAnswers = requiredQuestions.filter(
      (q) => !answers[q.id] || answers[q.id].toString().trim() === ""
    );

    if (missingAnswers.length > 0) {
      setError(
        `Completa tutte le domande obbligatorie (${missingAnswers.length} mancanti)`
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      // Prepara i dati per l'invio
      const responseData = {
        respondent_name: respondentInfo.name || null,
        respondent_email: respondentInfo.email || null,
        answers: Object.entries(answers).map(([questionId, answerValue]) => ({
          question_id: parseInt(questionId),
          answer_value: answerValue,
        })),
      };

      await shared.submitResponse(token, responseData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Errore nell'invio delle risposte");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUserIdentification = async (e) => {
    e.preventDefault();

    // Validazione email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userInfo.email)) {
      setError("Inserisci un indirizzo email valido");
      return;
    }

    // Validazione password
    if (!userInfo.password || userInfo.password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    // Validazione campi registrazione (solo se non è login)
    if (!isLogin) {
      if (!userInfo.azienda || !userInfo.nome || !userInfo.cognome) {
        setError("Tutti i campi sono obbligatori per la registrazione");
        return;
      }
    }

    try {
      setError("");
      setSubmitting(true);

      let result;

      if (isLogin) {
        // Tentativo di login
        const loginData = {
          email: userInfo.email,
          password: userInfo.password,
          questionnaireToken: token,
        };

        result = await shared.loginUser(loginData);
        console.log("✅ Login effettuato:", result);

        // Se login ha successo, usa i dati dell'utente esistente
        setRespondentInfo({
          name: result.user.name,
          email: result.user.email,
        });
      } else {
        // Registrazione nuovo utente
        const registrationData = {
          email: userInfo.email,
          password: userInfo.password,
          azienda: userInfo.azienda,
          nome: userInfo.nome,
          cognome: userInfo.cognome,
          questionnaireToken: token,
        };

        result = await shared.registerUser(registrationData);
        console.log("✅ Utente registrato:", result);

        // Trasferisce i dati del nuovo utente
        setRespondentInfo({
          name: `${userInfo.nome} ${userInfo.cognome}`,
          email: userInfo.email,
        });
      }

      // Salva token JWT se fornito
      if (result.token) {
        localStorage.setItem("external_user_token", result.token);
      }

      setUserIdentified(true);
      setSubmitting(false);
    } catch (error) {
      console.error("❌ Errore autenticazione:", error);

      // Se il login fallisce, suggerisci la registrazione
      if (isLogin && error.message?.includes("non trovato")) {
        setError("Utente non trovato. Prova a registrarti!");
      } else {
        setError(error.message || "Errore durante l'autenticazione");
      }
      setError(error.message || "Errore durante l'identificazione");
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const answer = answers[question.id] || "";

    switch (question.question_type) {
      case "text":
        return (
          <textarea
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            placeholder="Inserisci la tua risposta..."
          />
        );

      case "multiple_choice":
        const options = question.question_options || [];
        return (
          <div>
            {options.map((option, index) => (
              <label key={index} style={{ display: "block", margin: "8px 0" }}>
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option}
                  checked={answer === option}
                  onChange={(e) =>
                    handleAnswerChange(question.id, e.target.value)
                  }
                  style={{ marginRight: "8px" }}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const checkboxOptions = question.question_options || [];
        const selectedOptions = Array.isArray(answer) ? answer : [];

        return (
          <div>
            {checkboxOptions.map((option, index) => (
              <label key={index} style={{ display: "block", margin: "8px 0" }}>
                <input
                  type="checkbox"
                  value={option}
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => {
                    const newSelected = e.target.checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((opt) => opt !== option);
                    handleAnswerChange(question.id, newSelected);
                  }}
                  style={{ marginRight: "8px" }}
                />
                {option}
              </label>
            ))}
          </div>
        );

      case "scale":
        const scale = question.question_options || { min: 1, max: 5 };
        return (
          <div>
            <input
              type="range"
              min={scale.min || 1}
              max={scale.max || 5}
              value={answer || scale.min || 1}
              onChange={(e) =>
                handleAnswerChange(question.id, parseInt(e.target.value))
              }
              style={{ width: "100%" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "12px",
                color: "#666",
              }}
            >
              <span>{scale.min || 1}</span>
              <span>Valore: {answer || scale.min || 1}</span>
              <span>{scale.max || 5}</span>
            </div>
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        );

      default:
        return (
          <input
            type="text"
            value={answer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
            placeholder="Inserisci la tua risposta..."
          />
        );
    }
  };

  // Gestione redirect HTTPS da WhatsApp
  if (isHttpsRedirect) {
    const httpUrl = `http://localhost:5173/share/${token}`;
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2>🔗 Questionario Condiviso</h2>
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ color: "#856404", marginTop: 0 }}>
            ⚠️ Redirect necessario
          </h3>
          <p style={{ color: "#856404", marginBottom: "15px" }}>
            WhatsApp ha tentato di aprire questo link con HTTPS, ma il server di
            sviluppo usa HTTP.
          </p>
          <p style={{ color: "#856404", marginBottom: "20px" }}>
            <strong>
              Clicca il pulsante qui sotto per accedere al questionario:
            </strong>
          </p>
          <a
            href={httpUrl}
            style={{
              display: "inline-block",
              padding: "12px 24px",
              backgroundColor: "#28a745",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
              fontWeight: "bold",
            }}
          >
            🔗 Apri Questionario
          </a>
        </div>
        <div
          style={{
            backgroundColor: "#e7f3ff",
            border: "1px solid #b8daff",
            borderRadius: "8px",
            padding: "15px",
            fontSize: "14px",
          }}
        >
          <p style={{ color: "#004085", margin: 0 }}>
            <strong>💡 Suggerimento:</strong> Per evitare questo problema in
            futuro, copia il link e incollalo direttamente nel browser invece di
            cliccare su WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Caricamento questionario...</p>
      </div>
    );
  }

  if (error && !questionnaire) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h2>Errore</h2>
        <p style={{ color: "red" }}>{error}</p>
        <p>Il questionario potrebbe non essere più disponibile.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "50px auto",
          padding: "20px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#28a745" }}>✓ Grazie!</h2>
        <p>Le tue risposte sono state inviate con successo.</p>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <p>
            <strong>Questionario:</strong> {questionnaire.title}
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            Risposte inviate il {new Date().toLocaleDateString("it-IT")}
          </p>
        </div>
      </div>
    );
  }

  // Form identificazione utenti
  if (!userIdentified) {
    return (
      <div style={{ maxWidth: "600px", margin: "50px auto", padding: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2>💼 {isLogin ? "Accedi" : "Registrati"}</h2>
          <p style={{ color: "#666", fontSize: "16px" }}>
            {isLogin
              ? "Accedi al tuo account per completare il questionario"
              : "Crea un account per accedere ai questionari condivisi"}
          </p>

          {/* Toggle Login/Registrazione */}
          <div style={{ marginTop: "15px" }}>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: "none",
                border: "none",
                color: "#007bff",
                textDecoration: "underline",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              {isLogin
                ? "Non hai un account? Registrati qui"
                : "Hai già un account? Accedi qui"}
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "10px",
              borderRadius: "4px",
              marginBottom: "20px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleUserIdentification}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Email Professionale *
            </label>
            <input
              type="email"
              value={userInfo.email}
              onChange={(e) =>
                setUserInfo({ ...userInfo, email: e.target.value })
              }
              placeholder="es: mario.rossi@azienda.com"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
              }}
              required
            />
          </div>

          {/* Campo Password - sempre visibile */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Password *
            </label>
            <input
              type="password"
              value={userInfo.password}
              onChange={(e) =>
                setUserInfo({ ...userInfo, password: e.target.value })
              }
              placeholder="Minimo 6 caratteri"
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontSize: "16px",
              }}
              required
            />
          </div>

          {/* Campi aggiuntivi solo per registrazione */}
          {!isLogin && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Azienda/Organizzazione *
                </label>
                <input
                  type="text"
                  value={userInfo.azienda}
                  onChange={(e) =>
                    setUserInfo({ ...userInfo, azienda: e.target.value })
                  }
                  placeholder="es: Acme Corp, Ministero XYZ, Studio Legale ABC"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                  required
                />
              </div>

              <div
                style={{ display: "flex", gap: "10px", marginBottom: "20px" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Nome *
                  </label>
                  <input
                    type="text"
                    value={userInfo.nome}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, nome: e.target.value })
                    }
                    placeholder="Mario"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "16px",
                    }}
                    required
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Cognome *
                  </label>
                  <input
                    type="text"
                    value={userInfo.cognome}
                    onChange={(e) =>
                      setUserInfo({ ...userInfo, cognome: e.target.value })
                    }
                    placeholder="Rossi"
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      fontSize: "16px",
                    }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: submitting ? "#6c757d" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Attendere..." : isLogin ? "Accedi" : "Registrati"}
          </button>
        </form>

        <div
          style={{
            backgroundColor: "#e7f3ff",
            border: "1px solid #b8daff",
            borderRadius: "8px",
            padding: "15px",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          <p style={{ color: "#004085", margin: 0 }}>
            <strong>🔒 Privacy:</strong> I tuoi dati saranno utilizzati
            esclusivamente per il tracciamento delle risposte e non saranno
            condivisi con terze parti.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", padding: "20px" }}>
      {/* Header del questionario */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <h1>{questionnaire.title}</h1>
        {questionnaire.description && (
          <p style={{ color: "#666", fontSize: "16px", marginTop: "10px" }}>
            {questionnaire.description}
          </p>
        )}
        <div
          style={{
            backgroundColor: "#e9ecef",
            padding: "10px",
            borderRadius: "4px",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          Questionario condiviso • {questionnaire.questions.length} domande
        </div>
      </div>

      {/* Form per le informazioni del rispondente (opzionale) */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Informazioni (opzionale)</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Nome
            </label>
            <input
              type="text"
              value={respondentInfo.name}
              onChange={(e) =>
                setRespondentInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              placeholder="Il tuo nome"
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={respondentInfo.email}
              onChange={(e) =>
                setRespondentInfo((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
              placeholder="La tua email"
            />
          </div>
        </div>
      </div>

      {/* Errori */}
      {error && (
        <div
          style={{
            color: "red",
            backgroundColor: "#f8d7da",
            padding: "10px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb",
          }}
        >
          {error}
        </div>
      )}

      {/* Form del questionario */}
      <form onSubmit={handleSubmit}>
        {questionnaire.questions.map((question, index) => (
          <div
            key={question.id}
            style={{
              marginBottom: "30px",
              padding: "20px",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              backgroundColor: "white",
            }}
          >
            <div style={{ marginBottom: "15px" }}>
              <h3 style={{ margin: 0, color: "#333" }}>
                {index + 1}. {question.question_text}
                {question.is_required && (
                  <span style={{ color: "red", marginLeft: "5px" }}>*</span>
                )}
              </h3>
              <small style={{ color: "#666" }}>
                Tipo:{" "}
                {question.question_type?.replace("_", " ") || "Sconosciuto"}
              </small>
            </div>
            {renderQuestion(question)}
          </div>
        ))}

        {/* Pulsante di invio */}
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "15px 40px",
              backgroundColor: submitting ? "#6c757d" : "#28a745",
              color: "white",
              border: "none",
              borderRadius: "5px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Invio in corso..." : "Invia Risposte"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SharedQuestionnaire;
