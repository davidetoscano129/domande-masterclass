import { useState } from "react";
import { API_BASE } from "../../constants/api.js";

function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState("");
  const [codiceFiscale, setCodiceFiscale] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!codiceFiscale.trim()) {
      setError("Inserisci il codice fiscale");
      return;
    }

    // Validazione base del codice fiscale (16 caratteri)
    if (codiceFiscale.length !== 16) {
      setError("Il codice fiscale deve essere di 16 caratteri");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/${loginType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codice_fiscale: codiceFiscale.toUpperCase() }),
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data);
      } else {
        setError(data.error || "Credenziali non valide");
      }
    } catch (error) {
      console.error("Errore login:", error);
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setLoginType("");
    setCodiceFiscale("");
    setError("");
  };

  return (
    <div className="login-container">
      <div className="login-brand">
        <h1 className="login-title">Questionari</h1>
        <div className="login-subtitle">Sistema di gestione questionari</div>
      </div>

      {!loginType && (
        <div className="login-selection">
          <h2>Seleziona il tipo di accesso</h2>
          <div className="access-buttons">
            <button
              onClick={() => setLoginType("relatore")}
              className="btn-access btn-relatore"
            >
              <div className="btn-icon">�</div>
              <div className="btn-content">
                <span className="btn-title">Area Relatore</span>
                <span className="btn-description">
                  Gestisci lezioni e questionari
                </span>
              </div>
              <div className="btn-arrow">→</div>
            </button>
            <button
              onClick={() => setLoginType("utente")}
              className="btn-access btn-utente"
            >
              <div className="btn-icon">�</div>
              <div className="btn-content">
                <span className="btn-title">Area Utente</span>
                <span className="btn-description">
                  Accedi ai contenuti formativi
                </span>
              </div>
              <div className="btn-arrow">→</div>
            </button>
          </div>
        </div>
      )}

      {loginType && (
        <div className="user-selection">
          <div className="login-header">
            <h2>
              {loginType === "relatore"
                ? "🎯 Login Relatore"
                : "📚 Login Utente"}
            </h2>
            <p className="login-description">
              {loginType === "relatore"
                ? "Accedi alla tua area di gestione"
                : "Accedi ai tuoi contenuti formativi"}
            </p>
          </div>

          <div className="login-form">
            <div className="input-group">
              <label htmlFor="codiceFiscale">Codice Fiscale</label>
              <div className="input-wrapper">
                <input
                  id="codiceFiscale"
                  type="text"
                  value={codiceFiscale}
                  onChange={(e) =>
                    setCodiceFiscale(e.target.value.toUpperCase())
                  }
                  placeholder="Inserisci il tuo codice fiscale (16 caratteri)"
                  maxLength="16"
                  className="login-input"
                  disabled={loading}
                />
                <div className="input-icon">📄</div>
              </div>
              <div className="input-hint">
                Il codice fiscale deve essere di 16 caratteri
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="login-actions">
              <button
                onClick={handleBack}
                className="btn-back"
                disabled={loading}
              >
                ← Indietro
              </button>
              <button
                onClick={handleLogin}
                disabled={loading || !codiceFiscale.trim()}
                className={`btn-login ${
                  loginType === "relatore"
                    ? "btn-login-relatore"
                    : "btn-login-utente"
                }`}
              >
                {loading ? (
                  <>
                    <span className="loading-spinner">⏳</span>
                    Accesso in corso...
                  </>
                ) : (
                  <>🚀 Accedi</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
