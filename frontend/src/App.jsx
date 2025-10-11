import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import "./App.css";

// Configurazione API
const API_BASE = "http://localhost:3000/api";

// Funzione helper per normalizzare le opzioni
const normalizeConfig = (config) => {
  if (!config || !config.questions) return config;

  return {
    ...config,
    questions: config.questions.map((question) => {
      if (!question.options) return question;

      return {
        ...question,
        options: question.options.map((option, index) => {
          // Se è già un oggetto con id e text, lo mantiene
          if (typeof option === "object" && option.id && option.text) {
            return option;
          }
          // Se è una stringa, la converte in oggetto
          if (typeof option === "string") {
            return { id: index + 1, text: option };
          }
          // Altri casi
          return { id: index + 1, text: String(option) };
        }),
      };
    }),
  };
};

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
  const [formData, setFormData] = useState({
    titolo: "",
    descrizione: "",
    numero: "",
  });
  const [selectedLezione, setSelectedLezione] = useState(null);
  const [lezioneQuestionari, setLezioneQuestionari] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/lezioni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, relatore_id: user.relatore.id }),
      });

      if (response.ok) {
        setFormData({ titolo: "", descrizione: "", numero: "" });
        setShowForm(false);
        onUpdate();
      }
    } catch (error) {
      console.error("Errore creazione lezione:", error);
    }
  };

  const handleLezioneClick = async (lezione) => {
    setSelectedLezione(lezione);
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/questionari/lezione/${lezione.id}`
      );
      const data = await response.json();
      setLezioneQuestionari(data);
    } catch (error) {
      console.error("Errore nel caricamento questionari:", error);
      setLezioneQuestionari([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLezioni = () => {
    setSelectedLezione(null);
    setLezioneQuestionari([]);
  };

  const handleDeleteLezione = async (id, event) => {
    // Previeni il click sulla card
    event.stopPropagation();

    if (
      confirm(
        "Sei sicuro di voler eliminare questa lezione? Questa azione è irreversibile."
      )
    ) {
      try {
        const response = await fetch(`${API_BASE}/lezioni/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          onUpdate(); // Ricarica la lista delle lezioni
        } else {
          alert("Errore durante l'eliminazione della lezione");
        }
      } catch (error) {
        console.error("Errore eliminazione lezione:", error);
        alert("Errore durante l'eliminazione della lezione");
      }
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
          <div className="form-row">
            <input
              type="number"
              placeholder="Numero lezione (es. 1, 2, 3...)"
              value={formData.numero}
              onChange={(e) =>
                setFormData({ ...formData, numero: e.target.value })
              }
              min="1"
              required
              className="numero-input"
            />
            <input
              type="text"
              placeholder="Titolo lezione"
              value={formData.titolo}
              onChange={(e) =>
                setFormData({ ...formData, titolo: e.target.value })
              }
              required
              className="titolo-input"
            />
          </div>
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

      {!selectedLezione ? (
        <div className="items-grid">
          {lezioni.map((lezione) => (
            <div
              key={lezione.id}
              className="item-card lezione-card clickable"
              onClick={() => handleLezioneClick(lezione)}
            >
              <div className="card-header">
                <h3>{lezione.titolo}</h3>
                <button
                  onClick={(e) => handleDeleteLezione(lezione.id, e)}
                  className="btn-small btn-delete"
                  title="Elimina lezione"
                >
                  🗑️
                </button>
              </div>
              <p>{lezione.descrizione}</p>
              <small>
                Creata: {new Date(lezione.created_at).toLocaleDateString()}
              </small>
              <div className="click-hint">
                👆 Clicca per vedere i questionari
              </div>
            </div>
          ))}
        </div>
      ) : (
        <LezioneDetailView
          lezione={selectedLezione}
          questionari={lezioneQuestionari}
          loading={loading}
          user={user}
          onBack={handleBackToLezioni}
        />
      )}
    </div>
  );
}

// Componente per la vista dettaglio di una lezione
function LezioneDetailView({ lezione, questionari, loading, user, onBack }) {
  const [showResponses, setShowResponses] = useState(false);
  const [selectedQuestionario, setSelectedQuestionario] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);

  const handleViewResponses = (questionario) => {
    setSelectedQuestionario(questionario);
    setShowResponses(true);
  };

  const handleCloseResponses = () => {
    setShowResponses(false);
    setSelectedQuestionario(null);
  };

  const handleShare = async (questionario) => {
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionario.id}/condividi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relatore_id: user.relatore.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShareData({
          ...data,
          questionario: questionario,
        });
        setShowShareModal(true);
      } else {
        alert("Errore nella generazione del link di condivisione");
      }
    } catch (error) {
      console.error("Errore condivisione:", error);
      alert("Errore nella generazione del link di condivisione");
    }
  };

  const handleCloseShare = () => {
    setShowShareModal(false);
    setShareData(null);
  };

  return (
    <div className="lezione-detail">
      <div className="back-button-container">
        <button onClick={onBack} className="btn-back-prominent">
          ← Torna alle lezioni
        </button>
      </div>

      <div className="lezione-header">
        <div className="lezione-info">
          <h2>📚 {lezione.titolo}</h2>
          <p>{lezione.descrizione}</p>
          <small>
            Creata: {new Date(lezione.created_at).toLocaleDateString()}
          </small>
        </div>
      </div>

      <div className="questionari-section">
        <h3>📝 Questionari associati ({questionari.length})</h3>

        {loading ? (
          <div className="loading-message">
            <p>⏳ Caricamento questionari...</p>
          </div>
        ) : questionari.length === 0 ? (
          <div className="empty-state">
            <p>📭 Nessun questionario associato a questa lezione.</p>
            <p>Vai nella sezione "Questionari" per crearne uno nuovo.</p>
          </div>
        ) : (
          <div className="questionari-grid">
            {questionari.map((questionario) => (
              <div key={questionario.id} className="questionario-card">
                <h4>{questionario.titolo}</h4>
                <p>{questionario.descrizione}</p>
                <small>
                  Creato:{" "}
                  {new Date(questionario.created_at).toLocaleDateString()}
                </small>

                <div className="questionario-actions">
                  <button
                    onClick={() => handleViewResponses(questionario)}
                    className="btn-small btn-responses"
                  >
                    📊 Risposte
                  </button>
                  <button
                    onClick={() => handleShare(questionario)}
                    className="btn-small btn-share"
                  >
                    🔗 Condividi
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showResponses && selectedQuestionario && (
        <ResponsesViewer
          questionario={selectedQuestionario}
          onClose={handleCloseResponses}
        />
      )}

      {showShareModal && shareData && (
        <ShareModal shareData={shareData} onClose={handleCloseShare} />
      )}
    </div>
  );
}

// Tab Questionari con creazione e gestione
function QuestionariTab({ questionari, user, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestionario, setEditingQuestionario] = useState(null);
  const [lezioni, setLezioni] = useState([]);
  const [showResponses, setShowResponses] = useState(false);
  const [selectedQuestionario, setSelectedQuestionario] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareData, setShareData] = useState(null);

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

  const handleViewResponses = (questionario) => {
    setSelectedQuestionario(questionario);
    setShowResponses(true);
  };

  const handleCloseResponses = () => {
    setShowResponses(false);
    setSelectedQuestionario(null);
  };

  const handleShare = async (questionario) => {
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionario.id}/condividi`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ relatore_id: user.relatore.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setShareData({
          ...data,
          questionario: questionario,
        });
        setShowShareModal(true);
      } else {
        alert("Errore nella generazione del link di condivisione");
      }
    } catch (error) {
      console.error("Errore condivisione:", error);
      alert("Errore nella generazione del link di condivisione");
    }
  };

  const handleCloseShare = () => {
    setShowShareModal(false);
    setShareData(null);
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
              <button
                onClick={() => handleViewResponses(questionario)}
                className="btn-small btn-responses"
              >
                📊 Risposte
              </button>
              <button
                onClick={() => handleShare(questionario)}
                className="btn-small btn-share"
              >
                🔗 Condividi
              </button>
            </div>
          </div>
        ))}
      </div>

      {showResponses && selectedQuestionario && (
        <ResponsesViewer
          questionario={selectedQuestionario}
          onClose={handleCloseResponses}
        />
      )}

      {showShareModal && shareData && (
        <ShareModal shareData={shareData} onClose={handleCloseShare} />
      )}
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
        config: normalizeConfig(
          typeof questionario.domande === "string"
            ? JSON.parse(questionario.domande)
            : questionario.domande
        ),
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
            <div key={option.id || optIndex} className="option-editor">
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
  const [selectedUtente, setSelectedUtente] = useState(null);
  const [utenteRisposte, setUtenteRisposte] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleVediRisposte = async (utente) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/utenti/${utente.id}/risposte`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Dati ricevuti per utente", utente.id, ":", data);
      setUtenteRisposte(data);
      setSelectedUtente(utente);
    } catch (error) {
      console.error("Errore nel caricamento risposte utente:", error);
      alert(`Errore nel caricamento delle risposte: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUtenti = () => {
    setSelectedUtente(null);
    setUtenteRisposte([]);
  };

  if (selectedUtente) {
    return (
      <UtenteRisposteView
        utente={selectedUtente}
        risposte={utenteRisposte}
        loading={loading}
        onBack={handleBackToUtenti}
      />
    );
  }

  return (
    <div>
      <h2>👥 Lista Utenti</h2>
      <div className="users-grid">
        {utenti.map((utente) => (
          <div key={utente.id} className="user-card">
            <strong>{utente.nome}</strong>
            <button
              className="btn-small"
              onClick={() => handleVediRisposte(utente)}
              disabled={loading}
            >
              {loading ? "Caricamento..." : "Vedi Risposte"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente per visualizzare le risposte di un utente specifico
function UtenteRisposteView({ utente, risposte, loading, onBack }) {
  const [viewMode, setViewMode] = useState("categorized"); // 'categorized' o 'global'

  if (loading) {
    return (
      <div className="loading-container">
        <p>Caricamento risposte...</p>
      </div>
    );
  }

  // Funzione per creare la vista globale di tutte le risposte
  const getGlobalResponses = () => {
    const allResponses = [];

    risposte.forEach((risposta) => {
      try {
        let risposteData;
        let domandeData;

        if (typeof risposta.risposte === "string") {
          try {
            risposteData = JSON.parse(risposta.risposte);
          } catch (parseError) {
            console.error("Errore parsing JSON:", parseError);
            return;
          }
        } else if (
          typeof risposta.risposte === "object" &&
          risposta.risposte !== null
        ) {
          risposteData = risposta.risposte;
        } else {
          return;
        }

        // Parse delle domande
        if (typeof risposta.domande === "string") {
          try {
            domandeData = JSON.parse(risposta.domande);
          } catch (parseError) {
            console.error("Errore parsing domande JSON:", parseError);
            domandeData = null;
          }
        } else if (
          typeof risposta.domande === "object" &&
          risposta.domande !== null
        ) {
          domandeData = risposta.domande;
        }

        if (risposteData && typeof risposteData === "object") {
          Object.entries(risposteData).forEach(
            ([questionId, answer], index) => {
              // Trova la domanda corrispondente
              let questionText = `Domanda ${index + 1}`;
              let questionType = "text";

              if (domandeData && domandeData.questions) {
                const question = domandeData.questions.find(
                  (q) =>
                    (q.id && q.id === questionId) ||
                    domandeData.questions.indexOf(q) === index
                );
                if (question) {
                  questionText = question.question || questionText;
                  questionType = question.type || questionType;
                }
              }

              allResponses.push({
                questionario: risposta.questionario_titolo,
                lezione: risposta.lezione_titolo,
                relatore: risposta.relatore_nome,
                data: risposta.submitted_at,
                questionId: questionId,
                questionNumber: index + 1,
                questionText: questionText,
                questionType: questionType,
                answer: answer,
                completata: risposta.completata,
                tempo_impiegato: risposta.tempo_impiegato,
              });
            }
          );
        }
      } catch (error) {
        console.error("Errore nel processare risposta:", error);
      }
    });

    // Ordina per data decrescente
    return allResponses.sort((a, b) => new Date(b.data) - new Date(a.data));
  };

  const globalResponses = getGlobalResponses();

  return (
    <div className="utente-risposte">
      <div className="back-button-container">
        <button onClick={onBack} className="btn-back-prominent">
          ← Torna alla lista utenti
        </button>
      </div>

      <div className="utente-header">
        <h2>📊 Risposte di {utente.nome}</h2>
        <p className="total-risposte">
          Totale questionari compilati: <strong>{risposte.length}</strong>
        </p>

        {/* Toggle per modalità visualizzazione */}
        <div className="view-mode-toggle">
          <button
            className={`toggle-btn ${
              viewMode === "categorized" ? "active" : ""
            }`}
            onClick={() => setViewMode("categorized")}
          >
            📋 Per Questionario
          </button>
          <button
            className={`toggle-btn ${viewMode === "global" ? "active" : ""}`}
            onClick={() => setViewMode("global")}
          >
            🌐 Tutte le Risposte
          </button>
        </div>
      </div>

      {risposte.length === 0 ? (
        <div className="no-responses">
          <p>🤷‍♂️ Questo utente non ha ancora compilato nessun questionario.</p>
        </div>
      ) : viewMode === "categorized" ? (
        // Vista categorizzata per questionario (esistente)
        <div className="risposte-list">
          {risposte.map((risposta) => (
            <div key={risposta.id} className="risposta-card">
              <div className="risposta-header">
                <h3>{risposta.questionario_titolo}</h3>
                <div className="risposta-meta">
                  <span className="lezione">📚 {risposta.lezione_titolo}</span>
                  <span className="relatore">👨‍🏫 {risposta.relatore_nome}</span>
                  <span className="data">
                    📅 {new Date(risposta.submitted_at).toLocaleString("it-IT")}
                  </span>
                  {risposta.tempo_impiegato && (
                    <span className="tempo">
                      ⏱️ {Math.round(risposta.tempo_impiegato / 60)} minuti
                    </span>
                  )}
                </div>
              </div>

              <div className="risposta-content">
                {risposta.completata ? (
                  <div className="status completata">✅ Completato</div>
                ) : (
                  <div className="status incompleta">⏳ In corso</div>
                )}

                <div className="risposte-details">
                  <h4>📝 Risposte:</h4>
                  {(() => {
                    try {
                      let risposteData;

                      // Controlla se risposte è già un oggetto o una stringa JSON
                      if (typeof risposta.risposte === "string") {
                        try {
                          risposteData = JSON.parse(risposta.risposte);
                        } catch (parseError) {
                          console.error(
                            "Errore parsing JSON string:",
                            parseError
                          );
                          console.log("Contenuto stringa:", risposta.risposte);
                          return (
                            <div className="error">
                              <p>Errore nel formato JSON delle risposte</p>
                              <details>
                                <summary>Dettagli errore</summary>
                                <pre>{parseError.message}</pre>
                                <pre>
                                  {String(risposta.risposte).substring(0, 200)}
                                  ...
                                </pre>
                              </details>
                            </div>
                          );
                        }
                      } else if (
                        typeof risposta.risposte === "object" &&
                        risposta.risposte !== null
                      ) {
                        risposteData = risposta.risposte;
                      } else {
                        console.log(
                          "Tipo risposte sconosciuto:",
                          typeof risposta.risposte,
                          risposta.risposte
                        );
                        return (
                          <p className="error">
                            Formato risposte non riconosciuto
                          </p>
                        );
                      }

                      if (!risposteData || typeof risposteData !== "object") {
                        return (
                          <p className="error">Nessuna risposta disponibile</p>
                        );
                      }

                      // Parse delle domande del questionario
                      let domandeData;
                      if (typeof risposta.domande === "string") {
                        try {
                          domandeData = JSON.parse(risposta.domande);
                        } catch (parseError) {
                          console.error(
                            "Errore parsing domande JSON:",
                            parseError
                          );
                          domandeData = null;
                        }
                      } else if (
                        typeof risposta.domande === "object" &&
                        risposta.domande !== null
                      ) {
                        domandeData = risposta.domande;
                      }

                      const entries = Object.entries(risposteData);
                      if (entries.length === 0) {
                        return (
                          <p className="error">Nessuna risposta trovata</p>
                        );
                      }

                      return (
                        <div className="answers-grid">
                          {entries.map(([questionId, answer], index) => {
                            // Trova la domanda corrispondente
                            let questionText = `Domanda ${index + 1}`;
                            let questionType = "text";

                            if (domandeData && domandeData.questions) {
                              const question = domandeData.questions.find(
                                (q) =>
                                  (q.id && q.id === questionId) ||
                                  domandeData.questions.indexOf(q) === index
                              );
                              if (question) {
                                questionText =
                                  question.question || questionText;
                                questionType = question.type || questionType;
                              }
                            }

                            return (
                              <div key={questionId} className="answer-item">
                                <div className="question-section">
                                  <span className="question-number">
                                    {index + 1}.
                                  </span>
                                  <span className="question-text">
                                    {questionText}
                                  </span>
                                  <span className="question-type">
                                    ({questionType})
                                  </span>
                                </div>
                                <div className="answer-section">
                                  <span className="answer-label">
                                    Risposta:
                                  </span>
                                  <span className="answer-text">
                                    {(() => {
                                      try {
                                        if (Array.isArray(answer)) {
                                          return answer.length > 0
                                            ? answer.join(", ")
                                            : "Nessuna selezione";
                                        }
                                        if (
                                          answer === null ||
                                          answer === undefined ||
                                          answer === ""
                                        ) {
                                          return "Nessuna risposta";
                                        }
                                        // Converti sempre in stringa e gestisci caratteri speciali
                                        const cleanAnswer = String(answer)
                                          .replace(/\n/g, " ")
                                          .replace(/\r/g, "")
                                          .trim();

                                        return cleanAnswer || "Risposta vuota";
                                      } catch (e) {
                                        console.error(
                                          "Errore nel processare la risposta:",
                                          answer,
                                          e
                                        );
                                        return `Errore formato: ${typeof answer}`;
                                      }
                                    })()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    } catch (error) {
                      console.error("Errore generale parsing risposte:", error);
                      console.log("Dati risposte completi:", risposta.risposte);
                      console.log("Tipo dati:", typeof risposta.risposte);
                      return (
                        <div className="error">
                          <p>Errore nel parsing delle risposte</p>
                          <details>
                            <summary>
                              Dettagli errore (click per espandere)
                            </summary>
                            <pre>{String(error.message)}</pre>
                            <pre>Tipo: {typeof risposta.risposte}</pre>
                            <pre>
                              {String(risposta.risposte || "").substring(
                                0,
                                300
                              )}
                              ...
                            </pre>
                          </details>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Vista globale di tutte le risposte
        <div className="global-responses">
          <div className="global-responses-header">
            <h3>🌐 Tutte le risposte ({globalResponses.length} totali)</h3>
            <p className="global-description">
              Vista unificata di tutte le risposte fornite dall'utente, ordinate
              per data più recente.
            </p>
          </div>

          {globalResponses.length === 0 ? (
            <div className="no-responses">
              <p>Nessuna risposta trovata.</p>
            </div>
          ) : (
            <div className="global-responses-list">
              {globalResponses.map((response, index) => (
                <div
                  key={`${response.questionario}-${response.questionId}-${index}`}
                  className="global-response-item"
                >
                  <div className="response-context">
                    <div className="context-info">
                      <span className="questionario-ref">
                        📋 {response.questionario}
                      </span>
                      <span className="lezione-ref">📚 {response.lezione}</span>
                      <span className="relatore-ref">
                        👨‍🏫 {response.relatore}
                      </span>
                      <span className="data-ref">
                        📅 {new Date(response.data).toLocaleString("it-IT")}
                      </span>
                      {response.completata ? (
                        <span className="status-ref completata">✅</span>
                      ) : (
                        <span className="status-ref incompleta">⏳</span>
                      )}
                    </div>
                  </div>

                  <div className="response-content">
                    <div className="question-section-global">
                      <div className="question-number">
                        Domanda {response.questionNumber}:
                      </div>
                      <div className="question-text-global">
                        {response.questionText}
                      </div>
                      <div className="question-type-global">
                        Tipo: {response.questionType}
                      </div>
                    </div>
                    <div className="answer-section-global">
                      <div className="answer-label-global">Risposta:</div>
                      <div className="answer-text">
                        {(() => {
                          try {
                            if (Array.isArray(response.answer)) {
                              return response.answer.length > 0
                                ? response.answer.join(", ")
                                : "Nessuna selezione";
                            }
                            if (
                              response.answer === null ||
                              response.answer === undefined ||
                              response.answer === ""
                            ) {
                              return "Nessuna risposta";
                            }

                            const cleanAnswer = String(response.answer)
                              .replace(/\n/g, " ")
                              .replace(/\r/g, "")
                              .trim();

                            return cleanAnswer || "Risposta vuota";
                          } catch (e) {
                            console.error(
                              "Errore nel processare risposta globale:",
                              response.answer,
                              e
                            );
                            return `Errore formato: ${typeof response.answer}`;
                          }
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
            {(() => {
              // Raggruppa i questionari per lezione
              const questionariPerLezione = questionari.reduce(
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
              const lezioniOrdinate = Object.values(questionariPerLezione).sort(
                (a, b) => a.lezione_numero - b.lezione_numero
              );

              return lezioniOrdinate.map((lezione) => (
                <div key={lezione.lezione_id} className="lesson-section">
                  <div className="lesson-header">
                    <h3>
                      📚 {lezione.lezione_titolo}
                      {lezione.lezione_numero > 0 && (
                        <span className="lesson-number">
                          #{lezione.lezione_numero}
                        </span>
                      )}
                    </h3>
                    <p className="lesson-instructor">
                      👨‍🏫 {lezione.relatore_nome}
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
                            <span className="status completed">
                              ✅ Completato
                            </span>
                          ) : (
                            <span className="status pending">
                              ⏳ Da completare
                            </span>
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
                              👁️ Rivedi Risposte
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                setActiveQuestionario(questionario)
                              }
                              className="btn-primary"
                            >
                              📝 Compila Questionario
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
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
    typeof questionario.domande === "string"
      ? JSON.parse(questionario.domande)
      : questionario.domande;

  const normalizedConfig = normalizeConfig(config);

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
    const missingRequired = normalizedConfig.questions.filter(
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
        {normalizedConfig.questions.map((question, index) => (
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
            {question.options.map((option, optionIndex) => (
              <label key={option.id || optionIndex} className="option-label">
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
            {question.options.map((option, optionIndex) => (
              <label key={option.id || optionIndex} className="option-label">
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
      <Routes>
        <Route path="/shared/:token" element={<SharedQuestionairePage />} />
        <Route
          path="/*"
          element={
            <div className="app">
              {!user ? (
                <LoginPage onLogin={handleLogin} />
              ) : user.type === "relatore" ? (
                <RelatoreDashboard user={user} onLogout={handleLogout} />
              ) : (
                <UtenteDashboard user={user} onLogout={handleLogout} />
              )}
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

// Componente per visualizzare le risposte di un questionario
function ResponsesViewer({ questionario, onClose }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [detailedResponses, setDetailedResponses] = useState(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchResponses();
    fetchStatistics();
    fetchAnalysis();
  }, [questionario.id]);

  const fetchResponses = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/risposte/questionario/${questionario.id}`
      );
      const data = await response.json();
      setResponses(data);
    } catch (error) {
      console.error("Errore nel caricamento risposte:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/statistiche/questionario/${questionario.id}`
      );
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error("Errore nel caricamento statistiche:", error);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/analisi/questionario/${questionario.id}`
      );
      const data = await response.json();
      setAnalysis(data);
    } catch (error) {
      console.error("Errore nel caricamento analisi:", error);
    }
  };

  const fetchDetailedResponses = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/questionari/${questionario.id}/risposte-dettagliate`
      );
      const data = await response.json();
      setDetailedResponses(data);
    } catch (error) {
      console.error("Errore nel caricamento risposte dettagliate:", error);
    }
  };

  const handleShowUserResponses = async (questionId) => {
    if (!detailedResponses) {
      await fetchDetailedResponses();
    }
    setSelectedQuestion(questionId);
    setShowDetailedView(true);
  };

  const handleBackToAnalysis = () => {
    setShowDetailedView(false);
    setSelectedQuestion(null);
  };

  const config = normalizeConfig(
    typeof questionario.domande === "string"
      ? JSON.parse(questionario.domande)
      : questionario.domande
  );

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleString("it-IT");
  const formatTime = (seconds) => {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content responses-modal">
          <div className="modal-header">
            <h2>📊 Risposte - {questionario.titolo}</h2>
            <button onClick={onClose} className="btn-close">
              ×
            </button>
          </div>
          <div className="modal-body">
            <p>Caricamento risposte...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content responses-modal">
        <div className="modal-header">
          <h2>📊 Risposte - {questionario.titolo}</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="tabs-navigation">
          <button
            className={`tab-button ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            📈 Panoramica
          </button>
          <button
            className={`tab-button ${activeTab === "analysis" ? "active" : ""}`}
            onClick={() => setActiveTab("analysis")}
          >
            📊 Analisi Dettagliata
          </button>
          <button
            className={`tab-button ${activeTab === "details" ? "active" : ""}`}
            onClick={() => setActiveTab("details")}
          >
            📋 Risposte Individuali
          </button>
        </div>

        <div className="modal-body">
          {activeTab === "overview" && (
            <div className="tab-content">
              {statistics && (
                <div className="statistics-section">
                  <h3>📈 Statistiche Generali</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-number">
                        {statistics.totale_risposte}
                      </span>
                      <span className="stat-label">Risposte Totali</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">
                        {statistics.risposte_completate}
                      </span>
                      <span className="stat-label">Completate</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-number">
                        {formatTime(statistics.tempo_medio)}
                      </span>
                      <span className="stat-label">Tempo Medio</span>
                    </div>
                  </div>
                </div>
              )}
              {analysis && (
                <div className="quick-overview">
                  <h3>🔍 Panoramica Rapida</h3>
                  <div className="overview-grid">
                    {analysis.questions.map((q) => (
                      <div key={q.questionId} className="overview-card">
                        <h4>{q.question}</h4>
                        <div className="overview-stats">
                          <span className="response-rate">
                            📊 {q.responseRate}% di risposta (
                            {q.answeredResponses}/{q.totalResponses})
                          </span>
                          {q.type === "multiple_choice" &&
                            q.analysis.distribution[0] && (
                              <span className="top-answer">
                                🥇 "{q.analysis.distribution[0].choice}" (
                                {q.analysis.distribution[0].percentage}%)
                              </span>
                            )}
                          {q.type === "rating" && (
                            <span className="average-rating">
                              ⭐ Media: {q.analysis.average}/10
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "analysis" && analysis && (
            <div className="tab-content">
              {!showDetailedView ? (
                <div className="detailed-analysis">
                  <h3>📊 Analisi Dettagliata per Domanda</h3>
                  {analysis.questions.map((questionData) => (
                    <div
                      key={questionData.questionId}
                      className="question-analysis"
                    >
                      <div className="question-header">
                        <h4>{questionData.question}</h4>
                        <div className="question-meta">
                          <span className="question-type">
                            {questionData.type}
                          </span>
                          <span className="response-rate">
                            {questionData.responseRate}% risposto
                          </span>
                          <button
                            className="btn-small btn-users"
                            onClick={() =>
                              handleShowUserResponses(questionData.questionId)
                            }
                            title="Vedi chi ha risposto cosa"
                          >
                            👥 Dettagli utenti
                          </button>
                        </div>
                      </div>
                      <div className="analysis-content">
                        {questionData.type === "multiple_choice" && (
                          <div className="choice-analysis">
                            <h5>Distribuzione Scelte:</h5>
                            {questionData.analysis.distribution.map(
                              (item, index) => (
                                <div key={index} className="choice-bar">
                                  <div className="choice-info">
                                    <span className="choice-text">
                                      {item.choice}
                                    </span>
                                    <span className="choice-stats">
                                      {item.count} voti ({item.percentage}%)
                                    </span>
                                  </div>
                                  <div className="progress-bar">
                                    <div
                                      className="progress-fill"
                                      style={{ width: `${item.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        {questionData.type === "rating" && (
                          <div className="rating-analysis">
                            <div className="rating-summary">
                              <div className="avg-rating">
                                <span className="rating-number">
                                  {questionData.analysis.average}
                                </span>
                                <span className="rating-label">Media</span>
                              </div>
                            </div>
                            <h5>Distribuzione Voti:</h5>
                            {questionData.analysis.distribution.map((item) => (
                              <div key={item.rating} className="rating-bar">
                                <div className="rating-info">
                                  <span className="rating-value">
                                    {item.rating} ⭐
                                  </span>
                                  <span className="rating-stats">
                                    {item.count} voti ({item.percentage}%)
                                  </span>
                                </div>
                                <div className="progress-bar">
                                  <div
                                    className="progress-fill"
                                    style={{ width: `${item.percentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {(questionData.type === "text" ||
                          questionData.type === "textarea") && (
                          <div className="text-analysis">
                            <div className="text-stats">
                              <span>
                                📝 {questionData.analysis.responses} risposte
                                testuali
                              </span>
                              <span>
                                📏 Lunghezza media:{" "}
                                {questionData.analysis.averageLength} caratteri
                              </span>
                            </div>
                            {questionData.analysis.samples.length > 0 && (
                              <div className="text-samples">
                                <h5>Esempi di risposte:</h5>
                                {questionData.analysis.samples.map(
                                  (sample, index) => (
                                    <div key={index} className="sample-text">
                                      "{sample}"
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <DetailedResponseView
                  questionId={selectedQuestion}
                  detailedResponses={detailedResponses}
                  onBack={handleBackToAnalysis}
                />
              )}
            </div>
          )}

          {activeTab === "details" && (
            <div className="tab-content">
              <div className="responses-section">
                <h3>📝 Risposte Individuali ({responses.length})</h3>
                {responses.length === 0 ? (
                  <p className="no-responses">
                    Nessuna risposta ancora ricevuta.
                  </p>
                ) : (
                  <div className="responses-list">
                    {responses.map((response) => (
                      <div key={response.id} className="response-card">
                        <div className="response-header">
                          <h4>👤 {response.utente_nome}</h4>
                          <div className="response-meta">
                            <span>📅 {formatDate(response.submitted_at)}</span>
                            <span>
                              ⏱️ {formatTime(response.tempo_impiegato)}
                            </span>
                            <span
                              className={`status ${
                                response.completata ? "completed" : "incomplete"
                              }`}
                            >
                              {response.completata
                                ? "✅ Completata"
                                : "⏳ Incompleta"}
                            </span>
                          </div>
                        </div>
                        <div className="response-answers">
                          {config.questions.map((question) => {
                            const risposteData =
                              typeof response.risposte === "string"
                                ? JSON.parse(response.risposte)
                                : response.risposte;
                            const answer = risposteData[question.id];
                            return (
                              <div key={question.id} className="answer-item">
                                <strong>{question.question}</strong>
                                <div className="answer-value">
                                  {Array.isArray(answer)
                                    ? answer.join(", ")
                                    : answer || "Nessuna risposta"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente per visualizzare risposte dettagliate per utente
function DetailedResponseView({ questionId, detailedResponses, onBack }) {
  if (!detailedResponses || !detailedResponses.rispostePerDomanda) {
    return (
      <div className="loading-container">
        <p>Caricamento risposte dettagliate...</p>
      </div>
    );
  }

  const questionData = detailedResponses.rispostePerDomanda[questionId];
  if (!questionData) {
    return (
      <div className="error">
        <p>Domanda non trovata</p>
        <button onClick={onBack} className="btn-secondary">
          ← Torna indietro
        </button>
      </div>
    );
  }

  // Raggruppa le risposte per valore
  const groupedResponses = {};
  questionData.risposte.forEach((resp) => {
    const key = Array.isArray(resp.risposta)
      ? resp.risposta.join(", ")
      : String(resp.risposta);
    if (!groupedResponses[key]) {
      groupedResponses[key] = [];
    }
    groupedResponses[key].push(resp);
  });

  return (
    <div className="detailed-response-view">
      <div className="back-button-container">
        <button onClick={onBack} className="btn-back-prominent">
          ← Torna all'analisi
        </button>
      </div>

      <div className="question-detail-header">
        <h3>👥 Chi ha risposto cosa</h3>
        <h4>{questionData.question}</h4>
        <p className="response-summary">
          Tipo: <span className="question-type">{questionData.type}</span> |
          Totale risposte: <strong>{questionData.risposte.length}</strong>
        </p>
      </div>

      <div className="grouped-responses">
        {Object.entries(groupedResponses).map(([answer, users]) => (
          <div key={answer} className="response-group">
            <div className="response-group-header">
              <div className="answer-display">
                <span className="answer-text">{answer}</span>
                <span className="user-count">
                  {users.length} utent{users.length === 1 ? "e" : "i"}
                </span>
              </div>
            </div>
            <div className="users-list">
              {users.map((user, index) => (
                <div key={index} className="user-response-item">
                  <div className="user-info">
                    <span className="user-name">👤 {user.utente_nome}</span>
                    <span className="timestamp">
                      📅 {new Date(user.timestamp).toLocaleString("it-IT")}
                    </span>
                    {user.tempo_impiegato && (
                      <span className="time-taken">
                        ⏱️ {Math.round(user.tempo_impiegato / 60)} min
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente per modal di condivisione
function ShareModal({ shareData, onClose }) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [shareData]);

  const generateQRCode = async () => {
    try {
      const QRCode = (await import("qrcode")).default;
      const qrCodeDataUrl = await QRCode.toDataURL(shareData.shareLink, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      setQrCodeDataUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Errore generazione QR code:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Errore copia link:", error);
    }
  };

  const formatExpiryDate = (dateString) => {
    return new Date(dateString).toLocaleString("it-IT");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content share-modal">
        <div className="modal-header">
          <h2>🔗 Condividi Questionario</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="share-content">
            <div className="questionario-info">
              <h3>📝 {shareData.questionario.titolo}</h3>
              <p>
                Gli utenti potranno compilare questo questionario tramite il
                link o scansionando il QR code.
              </p>
            </div>

            <div className="share-methods">
              <div className="share-link-section">
                <h4>🔗 Link di condivisione</h4>
                <div className="link-container">
                  <input
                    type="text"
                    value={shareData.shareLink}
                    readOnly
                    className="share-link-input"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`btn-copy ${copied ? "copied" : ""}`}
                  >
                    {copied ? "✅ Copiato!" : "📋 Copia"}
                  </button>
                </div>
              </div>

              <div className="qr-code-section">
                <h4>📱 QR Code</h4>
                <div className="qr-container">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="QR Code"
                      className="qr-code"
                    />
                  ) : (
                    <div className="qr-loading">Generazione QR code...</div>
                  )}
                </div>
                <p className="qr-instruction">
                  Gli utenti possono scansionare questo QR code per accedere
                  direttamente al questionario
                </p>
              </div>
            </div>

            <div className="share-info">
              <div className="info-item">
                <span className="info-label">🕒 Scadenza:</span>
                <span className="info-value">
                  {formatExpiryDate(shareData.expiresAt)}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">🔑 Token:</span>
                <span className="info-value">
                  {shareData.shareToken.substring(0, 8)}...
                </span>
              </div>
            </div>

            <div className="usage-instructions">
              <h4>📋 Istruzioni per gli utenti</h4>
              <ol>
                <li>Accedere al link o scansionare il QR code</li>
                <li>Selezionare il proprio nome dalla lista</li>
                <li>Compilare il questionario</li>
                <li>Sottomettere le risposte</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente per la pagina pubblica di compilazione questionario
function SharedQuestionairePage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [questionario, setQuestionario] = useState(null);
  const [utenti, setUtenti] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSharedData();
  }, [token]);

  const fetchSharedData = async () => {
    try {
      setLoading(true);

      // Carica informazioni questionario
      const questionarioResponse = await fetch(`${API_BASE}/shared/${token}`);
      if (!questionarioResponse.ok) {
        throw new Error("Link non valido o scaduto");
      }
      const questionarioData = await questionarioResponse.json();
      setQuestionario(questionarioData.questionario);

      // Carica lista utenti
      const utentiResponse = await fetch(`${API_BASE}/shared/${token}/utenti`);
      if (!utentiResponse.ok) {
        throw new Error("Errore nel caricamento utenti");
      }
      const utentiData = await utentiResponse.json();
      setUtenti(utentiData.utenti);
    } catch (error) {
      console.error("Errore caricamento dati condivisi:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (user) => {
    setSelectedUser(user);
    setShowQuestionnaire(true);
  };

  const handleBackToUserSelection = () => {
    setSelectedUser(null);
    setShowQuestionnaire(false);
  };

  if (loading) {
    return (
      <div className="shared-page">
        <div className="shared-container">
          <div className="loading">
            <h2>🔄 Caricamento questionario...</h2>
            <p>Attendere prego</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shared-page">
        <div className="shared-container">
          <div className="error-message">
            <h2>❌ Errore</h2>
            <p>{error}</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="btn-primary"
            >
              Torna alla home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!showQuestionnaire) {
    return (
      <div className="shared-page">
        <div className="shared-container">
          <div className="user-selection-section">
            <div className="header">
              <h1>📝 Compilazione Questionario</h1>
              <h2>{questionario.titolo}</h2>
              <p>
                Relatore: <strong>{questionario.relatore_nome}</strong>
              </p>
            </div>

            <div className="user-selection">
              <h3>👥 Seleziona il tuo nome per iniziare:</h3>
              <div className="users-grid">
                {utenti.map((user) => (
                  <div
                    key={user.id}
                    className="user-card"
                    onClick={() => handleUserSelection(user)}
                  >
                    <div className="user-avatar">👤</div>
                    <span className="user-name">{user.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-page">
      <div className="shared-container">
        <SharedQuestionnaireViewer
          questionario={questionario}
          selectedUser={selectedUser}
          token={token}
          onBack={handleBackToUserSelection}
        />
      </div>
    </div>
  );
}

// Componente per visualizzare il questionario condiviso
function SharedQuestionnaireViewer({
  questionario,
  selectedUser,
  token,
  onBack,
}) {
  const [responses, setResponses] = useState({});
  const [startTime] = useState(Date.now());
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const config = normalizeConfig(
    typeof questionario.domande === "string"
      ? JSON.parse(questionario.domande)
      : questionario.domande
  );

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const tempo_impiegato = Math.round((Date.now() - startTime) / 1000);

      const response = await fetch(`${API_BASE}/shared/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          utente_id: selectedUser.id,
          risposte: responses,
          tempo_impiegato,
        }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const error = await response.json();
        alert(error.error || "Errore nel salvataggio delle risposte");
      }
    } catch (error) {
      console.error("Errore invio risposte:", error);
      alert("Errore nel salvataggio delle risposte");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="submission-success">
        <div className="success-content">
          <h2>✅ Questionario completato!</h2>
          <p>
            Grazie <strong>{selectedUser.nome}</strong> per aver compilato il
            questionario:
          </p>
          <h3>"{questionario.titolo}"</h3>
          <p>Le tue risposte sono state salvate correttamente.</p>
          <p className="completion-note">
            🎉 La compilazione è stata completata. Puoi chiudere questa pagina.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="questionnaire-viewer">
      <div className="questionnaire-header">
        <button onClick={onBack} className="btn-back">
          ← Indietro
        </button>
        <div className="header-info">
          <h2>📝 {questionario.titolo}</h2>
          <p>
            Utente: <strong>{selectedUser.nome}</strong>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="questionnaire-form">
        {config.questions.map((question, index) => (
          <div key={question.id} className="question-block">
            <div className="question-header">
              <span className="question-number">{index + 1}.</span>
              <h3 className="question-text">{question.question}</h3>
            </div>

            <div className="question-input">
              {question.type === "multiple_choice" && (
                <div className="options-list">
                  {question.options.map((option) => (
                    <label key={option.id} className="option-label">
                      <input
                        type="radio"
                        name={`question_${question.id}`}
                        value={option.text}
                        checked={responses[question.id] === option.text}
                        onChange={(e) =>
                          handleResponseChange(question.id, e.target.value)
                        }
                      />
                      <span className="option-text">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "text" && (
                <input
                  type="text"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci la tua risposta..."
                  className="text-input"
                />
              )}

              {question.type === "email" && (
                <input
                  type="email"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="inserisci@email.com"
                  className="text-input"
                />
              )}

              {question.type === "date" && (
                <input
                  type="date"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  className="text-input"
                />
              )}

              {question.type === "textarea" && (
                <textarea
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci la tua risposta..."
                  rows={4}
                  className="textarea-input"
                />
              )}

              {question.type === "rating" && (
                <div className="rating-input">
                  <div className="rating-scale">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <label key={value} className="rating-option">
                        <input
                          type="radio"
                          name={`question_${question.id}`}
                          value={value}
                          checked={responses[question.id] === value}
                          onChange={(e) =>
                            handleResponseChange(
                              question.id,
                              parseInt(e.target.value)
                            )
                          }
                        />
                        <span className="rating-number">{value}</span>
                      </label>
                    ))}
                  </div>
                  <div className="rating-labels">
                    <span>Molto basso</span>
                    <span>Molto alto</span>
                  </div>
                </div>
              )}

              {question.type === "checkbox" && (
                <div className="checkbox-list">
                  {question.options.map((option) => (
                    <label key={option.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={(responses[question.id] || []).includes(
                          option.text
                        )}
                        onChange={(e) => {
                          const currentResponses = responses[question.id] || [];
                          if (e.target.checked) {
                            handleResponseChange(question.id, [
                              ...currentResponses,
                              option.text,
                            ]);
                          } else {
                            handleResponseChange(
                              question.id,
                              currentResponses.filter((r) => r !== option.text)
                            );
                          }
                        }}
                      />
                      <span className="checkbox-text">{option.text}</span>
                    </label>
                  ))}
                </div>
              )}

              {question.type === "number" && (
                <input
                  type="number"
                  value={responses[question.id] || ""}
                  onChange={(e) =>
                    handleResponseChange(question.id, e.target.value)
                  }
                  placeholder="Inserisci un numero..."
                  className="number-input"
                />
              )}
            </div>
          </div>
        ))}

        <div className="submit-section">
          <button type="submit" disabled={submitting} className="btn-submit">
            {submitting ? "⏳ Invio in corso..." : "📤 Invia Risposte"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default App;
