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
    <div className="login-page">
      <div className="login-logo-container">
        <img
          src="/images/logo-tesoridellimpresa.png"
          alt="I Tesori dell'Impresa"
          className="login-logo-image"
        />
      </div>
      <div className="login-card">
        {!loginType ? (
          <>
            <div className="login-card-body">
              <h2 className="selection-title">Seleziona il tipo di accesso</h2>
              <div className="login-options">
                <button
                  onClick={() => setLoginType("relatore")}
                  className="login-option-btn login-option-relatore"
                >
                  <div className="option-content">
                    <span className="option-title">AREA RELATORE</span>
                    <span className="option-subtitle">
                      Gestisci lezioni e questionari
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setLoginType("utente")}
                  className="login-option-btn login-option-utente"
                >
                  <div className="option-content">
                    <span className="option-title">AREA UTENTE</span>
                    <span className="option-subtitle">
                      Accedi ai contenuti formativi
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="login-card-header">
              <h1 className="login-card-title">
                {loginType === "relatore" ? "AREA RELATORE" : "AREA UTENTE"}
              </h1>
              <p className="login-card-subtitle">
                {loginType === "relatore"
                  ? "Gestione lezioni e questionari"
                  : "Contenuti formativi"}
              </p>
            </div>

            <div className="login-card-body">
              <form
                className="login-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
              >
                <div className="form-field">
                  <label htmlFor="codiceFiscale">Codice Fiscale</label>
                  <input
                    id="codiceFiscale"
                    type="text"
                    value={codiceFiscale}
                    onChange={(e) =>
                      setCodiceFiscale(e.target.value.toUpperCase())
                    }
                    placeholder="Inserisci 16 caratteri"
                    maxLength="16"
                    className="form-control"
                    disabled={loading}
                    autoComplete="off"
                  />
                  <span className="form-hint">16 caratteri alfanumerici</span>
                </div>

                {error && <div className="alert-error">{error}</div>}

                <div className="form-buttons">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn btn-secondary"
                    disabled={loading}
                  >
                    Indietro
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !codiceFiscale.trim()}
                    className={`btn btn-primary ${
                      loginType === "relatore"
                        ? "btn-relatore-primary"
                        : "btn-utente-primary"
                    }`}
                  >
                    {loading ? "Accesso in corso..." : "Accedi"}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
