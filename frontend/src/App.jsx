import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";

// Configurazione API
const API_BASE = "http://localhost:3000/api";

// Componente per il login iniziale
function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loginType === "relatore") {
      fetchRelatori();
    } else if (loginType === "utente") {
      fetchUtenti();
    }
  }, [loginType]);

  const fetchRelatori = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/relatori`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Errore nel caricamento relatori:", error);
    }
    setLoading(false);
  };

  const fetchUtenti = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/utenti`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Errore nel caricamento utenti:", error);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    if (!selectedId) return;

    try {
      const response = await fetch(`${API_BASE}/auth/${loginType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedId }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data);
      }
    } catch (error) {
      console.error("Errore login:", error);
    }
  };

  return (
    <div className="login-container">
      <h1>🎓 App Questionari</h1>

      {!loginType && (
        <div className="login-selection">
          <h2>Seleziona il tipo di accesso:</h2>
          <button
            onClick={() => setLoginType("relatore")}
            className="btn-primary"
          >
            👨‍🏫 Area Relatore
          </button>
          <button
            onClick={() => setLoginType("utente")}
            className="btn-secondary"
          >
            👨‍🎓 Area Utente
          </button>
        </div>
      )}

      {loginType && (
        <div className="user-selection">
          <h2>Seleziona {loginType}:</h2>
          {loading ? (
            <p>Caricamento...</p>
          ) : (
            <div className="users-grid">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`user-card ${
                    selectedId == user.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedId(user.id)}
                >
                  <strong>
                    {loginType === "relatore" ? user.nome : user.nome}
                  </strong>
                  {loginType === "relatore" && <small>{user.email}</small>}
                </div>
              ))}
            </div>
          )}

          <div className="login-actions">
            <button onClick={() => setLoginType("")} className="btn-secondary">
              ← Indietro
            </button>
            <button
              onClick={handleLogin}
              disabled={!selectedId}
              className="btn-primary"
            >
              Accedi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard Relatore
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
        <h1>👨‍🏫 Dashboard {user.relatore.nome}</h1>
        <button onClick={onLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      <nav className="dashboard-nav">
        <button
          className={activeTab === "lezioni" ? "active" : ""}
          onClick={() => setActiveTab("lezioni")}
        >
          📚 Lezioni
        </button>
        <button
          className={activeTab === "questionari" ? "active" : ""}
          onClick={() => setActiveTab("questionari")}
        >
          📝 Questionari
        </button>
        <button
          className={activeTab === "utenti" ? "active" : ""}
          onClick={() => setActiveTab("utenti")}
        >
          👥 Utenti
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

// Tab Lezioni
function LezioniTab({ lezioni, user, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ titolo: "", descrizione: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/lezioni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, relatore_id: user.relatore.id }),
      });

      if (response.ok) {
        setFormData({ titolo: "", descrizione: "" });
        setShowForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Errore creazione lezione:", error);
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>📚 Le mie Lezioni</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? "Annulla" : "+ Nuova Lezione"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card">
          <input
            type="text"
            placeholder="Titolo lezione"
            value={formData.titolo}
            onChange={(e) =>
              setFormData({ ...formData, titolo: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Descrizione"
            value={formData.descrizione}
            onChange={(e) =>
              setFormData({ ...formData, descrizione: e.target.value })
            }
            rows={3}
          />
          <button type="submit" className="btn-primary">
            Crea Lezione
          </button>
        </form>
      )}

      <div className="items-grid">
        {lezioni.map((lezione) => (
          <div key={lezione.id} className="item-card">
            <h3>{lezione.titolo}</h3>
            <p>{lezione.descrizione}</p>
            <small>
              Creata: {new Date(lezione.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </div>
    </div>
  );
}

// Tab Questionari con creazione e gestione
function QuestionariTab({ questionari, user, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestionario, setEditingQuestionario] = useState(null);
  const [lezioni, setLezioni] = useState([]);

  useEffect(() => {
    fetchLezioni();
  }, []);

  const fetchLezioni = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/lezioni/relatore/${user.relatore.id}`
      );
      const data = await response.json();
      setLezioni(data);
    } catch (error) {
      console.error("Errore nel caricamento lezioni:", error);
    }
  };

  const handleEdit = (questionario) => {
    setEditingQuestionario(questionario);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Sei sicuro di voler eliminare questo questionario?")) {
      try {
        await fetch(`${API_BASE}/questionari/${id}`, { method: "DELETE" });
        onUpdate();
      } catch (error) {
        console.error("Errore eliminazione questionario:", error);
      }
    }
  };

  return (
    <div>
      <div className="section-header">
        <h2>📝 I miei Questionari</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingQuestionario(null);
          }}
          className="btn-primary"
        >
          {showForm ? "Annulla" : "+ Nuovo Questionario"}
        </button>
      </div>

      {showForm && (
        <QuestionarioEditor
          questionario={editingQuestionario}
          lezioni={lezioni}
          user={user}
          onSave={() => {
            setShowForm(false);
            setEditingQuestionario(null);
            onUpdate();
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingQuestionario(null);
          }}
        />
      )}

      <div className="items-grid">
        {questionari.map((questionario) => (
          <div key={questionario.id} className="item-card questionario-item">
            <h3>{questionario.titolo}</h3>
            <p>{questionario.descrizione}</p>
            <small>Lezione: {questionario.lezione_titolo}</small>
            <small>
              Creato: {new Date(questionario.created_at).toLocaleDateString()}
            </small>

            <div className="item-actions">
              <button
                onClick={() => handleEdit(questionario)}
                className="btn-small btn-edit"
              >
                ✏️ Modifica
              </button>
              <button
                onClick={() => handleDelete(questionario.id)}
                className="btn-small btn-delete"
              >
                🗑️ Elimina
              </button>
              <button className="btn-small btn-responses">📊 Risposte</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Editor questionario tipo Google Forms
function QuestionarioEditor({ questionario, lezioni, user, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    titolo: "",
    descrizione: "",
    lezione_id: "",
    config: {
      questions: [],
    },
  });

  useEffect(() => {
    if (questionario) {
      setFormData({
        titolo: questionario.titolo,
        descrizione: questionario.descrizione,
        lezione_id: questionario.lezione_id,
        config:
          typeof questionario.config === "string"
            ? JSON.parse(questionario.config)
            : questionario.config,
      });
    }
  }, [questionario]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      type: "text",
      question: "",
      required: false,
      options: [],
    };

    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        questions: [...prev.config.questions, newQuestion],
      },
    }));
  };

  const updateQuestion = (questionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        questions: prev.config.questions.map((q) =>
          q.id === questionId ? { ...q, [field]: value } : q
        ),
      },
    }));
  };

  const deleteQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        questions: prev.config.questions.filter((q) => q.id !== questionId),
      },
    }));
  };

  const addOption = (questionId) => {
    const newOption = { id: Date.now(), text: "" };
    updateQuestion(questionId, "options", [
      ...(formData.config.questions.find((q) => q.id === questionId)?.options ||
        []),
      newOption,
    ]);
  };

  const updateOption = (questionId, optionId, text) => {
    const question = formData.config.questions.find((q) => q.id === questionId);
    const updatedOptions = question.options.map((opt) =>
      opt.id === optionId ? { ...opt, text } : opt
    );
    updateQuestion(questionId, "options", updatedOptions);
  };

  const deleteOption = (questionId, optionId) => {
    const question = formData.config.questions.find((q) => q.id === questionId);
    const updatedOptions = question.options.filter(
      (opt) => opt.id !== optionId
    );
    updateQuestion(questionId, "options", updatedOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = questionario ? "PUT" : "POST";
      const url = questionario
        ? `${API_BASE}/questionari/${questionario.id}`
        : `${API_BASE}/questionari`;

      const payload = {
        ...formData,
        relatore_id: user.relatore.id,
        attivo: true,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error("Errore salvataggio questionario:", error);
    }
  };

  return (
    <div className="questionario-editor">
      <h3>{questionario ? "Modifica Questionario" : "Nuovo Questionario"}</h3>

      <form onSubmit={handleSubmit} className="form-card">
        <input
          type="text"
          placeholder="Titolo questionario"
          value={formData.titolo}
          onChange={(e) => setFormData({ ...formData, titolo: e.target.value })}
          required
        />

        <textarea
          placeholder="Descrizione"
          value={formData.descrizione}
          onChange={(e) =>
            setFormData({ ...formData, descrizione: e.target.value })
          }
          rows={3}
        />

        <select
          value={formData.lezione_id}
          onChange={(e) =>
            setFormData({ ...formData, lezione_id: e.target.value })
          }
          required
        >
          <option value="">Seleziona lezione</option>
          {lezioni.map((lezione) => (
            <option key={lezione.id} value={lezione.id}>
              {lezione.titolo}
            </option>
          ))}
        </select>

        <div className="questions-section">
          <div className="section-header">
            <h4>Domande</h4>
            <button type="button" onClick={addQuestion} className="btn-small">
              + Aggiungi Domanda
            </button>
          </div>

          {formData.config.questions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onUpdate={(field, value) =>
                updateQuestion(question.id, field, value)
              }
              onDelete={() => deleteQuestion(question.id)}
              onAddOption={() => addOption(question.id)}
              onUpdateOption={(optionId, text) =>
                updateOption(question.id, optionId, text)
              }
              onDeleteOption={(optionId) => deleteOption(question.id, optionId)}
            />
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-secondary">
            Annulla
          </button>
          <button type="submit" className="btn-primary">
            {questionario ? "Aggiorna" : "Crea"} Questionario
          </button>
        </div>
      </form>
    </div>
  );
}

// Editor singola domanda
function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onAddOption,
  onUpdateOption,
  onDeleteOption,
}) {
  const questionTypes = [
    { value: "text", label: "Testo libero" },
    { value: "textarea", label: "Testo lungo" },
    { value: "multiple_choice", label: "Scelta multipla" },
    { value: "checkbox", label: "Caselle di controllo" },
    { value: "number", label: "Numero" },
    { value: "date", label: "Data" },
    { value: "rating", label: "Valutazione (1-5)" },
    { value: "email", label: "Email" },
  ];

  const needsOptions = ["multiple_choice", "checkbox"].includes(question.type);

  return (
    <div className="question-editor">
      <div className="question-header">
        <span className="question-number">Domanda {index + 1}</span>
        <button
          type="button"
          onClick={onDelete}
          className="btn-small btn-delete"
        >
          🗑️
        </button>
      </div>

      <input
        type="text"
        placeholder="Scrivi la domanda..."
        value={question.question}
        onChange={(e) => onUpdate("question", e.target.value)}
        required
      />

      <div className="question-controls">
        <select
          value={question.type}
          onChange={(e) => onUpdate("type", e.target.value)}
        >
          {questionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={question.required}
            onChange={(e) => onUpdate("required", e.target.checked)}
          />
          Obbligatoria
        </label>
      </div>

      {needsOptions && (
        <div className="options-section">
          <div className="section-header">
            <span>Opzioni:</span>
            <button type="button" onClick={onAddOption} className="btn-small">
              + Opzione
            </button>
          </div>

          {(question.options || []).map((option, optIndex) => (
            <div key={option.id} className="option-editor">
              <input
                type="text"
                placeholder={`Opzione ${optIndex + 1}`}
                value={option.text}
                onChange={(e) => onUpdateOption(option.id, e.target.value)}
              />
              <button
                type="button"
                onClick={() => onDeleteOption(option.id)}
                className="btn-small btn-delete"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Tab Utenti
function UtentiTab({ utenti }) {
  return (
    <div>
      <h2>👥 Lista Utenti</h2>
      <div className="users-grid">
        {utenti.map((utente) => (
          <div key={utente.id} className="user-card">
            <strong>{utente.nome}</strong>
            <button className="btn-small">Vedi Risposte</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard Utente con compilazione questionari
function UtenteDashboard({ user, onLogout }) {
  const [questionari, setQuestionari] = useState([]);
  const [activeQuestionario, setActiveQuestionario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestionari();
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
    setLoading(false);
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
        <h1>👨‍🎓 Area {user.utente.nome}</h1>
        <button onClick={onLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      <main className="dashboard-content">
        <h2>📝 Questionari Disponibili</h2>
        {loading ? (
          <p>Caricamento...</p>
        ) : (
          <div className="questionari-by-lesson">
            {questionari.map((questionario) => (
              <div key={questionario.id} className="questionario-card">
                <div className="questionario-status">
                  {questionario.hasAnswered ? (
                    <span className="status completed">✅ Completato</span>
                  ) : (
                    <span className="status pending">⏳ Da completare</span>
                  )}
                </div>

                <h3>{questionario.titolo}</h3>
                <p>{questionario.descrizione}</p>
                <small>
                  Lezione: {questionario.lezione_titolo} -{" "}
                  {questionario.relatore_nome}
                </small>

                <div className="questionario-actions">
                  {questionario.hasAnswered ? (
                    <button
                      onClick={() => setActiveQuestionario(questionario)}
                      className="btn-secondary"
                    >
                      👁️ Rivedi Risposte
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveQuestionario(questionario)}
                      className="btn-primary"
                    >
                      📝 Compila Questionario
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Visualizzatore/Compilatore questionario
function QuestionarioViewer({ questionario, user, onBack, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [startTime] = useState(Date.now());

  const config =
    typeof questionario.config === "string"
      ? JSON.parse(questionario.config)
      : questionario.config;

  useEffect(() => {
    // Se l'utente ha già risposto, carica le risposte esistenti
    if (questionario.hasAnswered && questionario.risposta) {
      const existingAnswers =
        typeof questionario.risposta.risposte === "string"
          ? JSON.parse(questionario.risposta.risposte)
          : questionario.risposta.risposte;
      setAnswers(existingAnswers);
      setIsReadOnly(true);
    }
  }, [questionario]);

  const handleAnswerChange = (questionId, value) => {
    if (isReadOnly) return;

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    setLoading(true);

    // Verifica che tutte le domande obbligatorie siano state risposte
    const missingRequired = config.questions.filter(
      (q) => q.required && (!answers[q.id] || answers[q.id] === "")
    );

    if (missingRequired.length > 0) {
      alert("Per favore completa tutte le domande obbligatorie");
      setLoading(false);
      return;
    }

    try {
      const completionTime = Math.round((Date.now() - startTime) / 1000);

      const response = await fetch(`${API_BASE}/risposte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionario_id: questionario.id,
          utente_id: user.utente.id,
          risposte: answers,
          completato: true,
          tempo_completamento: completionTime,
        }),
      });

      if (response.ok) {
        alert("Questionario completato con successo!");
        onComplete();
      }
    } catch (error) {
      console.error("Errore salvataggio risposte:", error);
      alert("Errore nel salvataggio. Riprova.");
    }

    setLoading(false);
  };

  return (
    <div className="questionario-viewer">
      <header className="viewer-header">
        <button onClick={onBack} className="btn-secondary">
          ← Indietro
        </button>
        <div className="questionario-info">
          <h1>{questionario.titolo}</h1>
          <p>{questionario.descrizione}</p>
          <small>
            Lezione: {questionario.lezione_titolo} -{" "}
            {questionario.relatore_nome}
          </small>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="questions-form">
        {config.questions.map((question, index) => (
          <QuestionRenderer
            key={question.id}
            question={question}
            index={index}
            value={answers[question.id] || ""}
            onChange={(value) => handleAnswerChange(question.id, value)}
            isReadOnly={isReadOnly}
          />
        ))}

        {!isReadOnly && (
          <div className="form-actions">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary btn-large"
            >
              {loading ? "Salvataggio..." : "Invia Questionario"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

// Renderer per singola domanda
function QuestionRenderer({ question, index, value, onChange, isReadOnly }) {
  const renderInput = () => {
    switch (question.type) {
      case "text":
      case "email":
        return (
          <input
            type={question.type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            className="question-input"
          />
        );

      case "textarea":
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            rows={4}
            className="question-input"
          />
        );

      case "number":
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            className="question-input"
          />
        );

      case "date":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={isReadOnly}
            className="question-input"
          />
        );

      case "multiple_choice":
        return (
          <div className="options-list">
            {question.options.map((option) => (
              <label key={option.id} className="option-label">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={option.text}
                  checked={value === option.text}
                  onChange={(e) => onChange(e.target.value)}
                  disabled={isReadOnly}
                />
                {option.text}
              </label>
            ))}
          </div>
        );

      case "checkbox":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="options-list">
            {question.options.map((option) => (
              <label key={option.id} className="option-label">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.text)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange([...selectedValues, option.text]);
                    } else {
                      onChange(selectedValues.filter((v) => v !== option.text));
                    }
                  }}
                  disabled={isReadOnly}
                />
                {option.text}
              </label>
            ))}
          </div>
        );

      case "rating":
        return (
          <div className="rating-input">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="rating-label">
                <input
                  type="radio"
                  name={`question_${question.id}`}
                  value={rating}
                  checked={value == rating}
                  onChange={(e) => onChange(parseInt(e.target.value))}
                  disabled={isReadOnly}
                />
                <span className="rating-star">⭐</span>
                {rating}
              </label>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="question-container">
      <div className="question-header">
        <span className="question-number">Domanda {index + 1}</span>
        {question.required && <span className="required-indicator">*</span>}
      </div>

      <h3 className="question-text">{question.question}</h3>

      <div className="question-input-container">{renderInput()}</div>
    </div>
  );
}

// Componente principale App
function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <Router>
      <div className="app">
        {!user ? (
          <LoginPage onLogin={handleLogin} />
        ) : user.type === "relatore" ? (
          <RelatoreDashboard user={user} onLogout={handleLogout} />
        ) : (
          <UtenteDashboard user={user} onLogout={handleLogout} />
        )}
      </div>
    </Router>
  );
}

export default App;
