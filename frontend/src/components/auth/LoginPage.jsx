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
      <h1>Questionari</h1>

      {!loginType && (
        <div className="login-selection">
          <h2>Seleziona il tipo di accesso</h2>
          <button
            onClick={() => setLoginType("relatore")}
            className="btn-primary"
          >
            Area Relatore
          </button>
          <button
            onClick={() => setLoginType("utente")}
            className="btn-secondary"
          >
            Area Utente
          </button>
        </div>
      )}

      {loginType && (
        <div className="user-selection">
          <h2>
            {loginType === "relatore" ? "Login Relatore" : "Login Utente"}
          </h2>

          <div className="login-form">
            <div className="input-group">
              <label htmlFor="codiceFiscale">Codice Fiscale:</label>
              <input
                id="codiceFiscale"
                type="text"
                value={codiceFiscale}
                onChange={(e) => setCodiceFiscale(e.target.value.toUpperCase())}
                placeholder="Inserisci il tuo codice fiscale (16 caratteri)"
                maxLength="16"
                className="login-input"
                disabled={loading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="login-actions">
              <button
                onClick={handleBack}
                className="btn-secondary"
                disabled={loading}
              >
                Indietro
              </button>
              <button
                onClick={handleLogin}
                disabled={loading || !codiceFiscale.trim()}
                className="btn-primary"
              >
                {loading ? "Accesso in corso..." : "Accedi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
