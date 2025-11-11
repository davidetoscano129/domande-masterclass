import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE } from "../../constants/api.js";

function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState("");
  const [codiceFiscale, setCodiceFiscale] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Controlla se c'è un redirect per questionario condiviso
  const redirectPath = searchParams.get("redirect");
  const isSharedRedirect = redirectPath?.startsWith("shared/");

  useEffect(() => {
    if (isSharedRedirect) {
      // Se è un redirect da questionario condiviso, forza il login come utente
      setLoginType("utente");
    }
  }, [isSharedRedirect]);

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

    // Per i redirect condivisi, usa sempre "utente"
    const currentLoginType = isSharedRedirect ? "utente" : loginType;

    if (!currentLoginType) {
      setError("Tipo di login non selezionato");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/${currentLoginType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codice_fiscale: codiceFiscale.toUpperCase() }),
      });

      const data = await response.json();

      if (data.success) {
        // Se c'è un redirect per questionario condiviso, vai direttamente lì
        if (isSharedRedirect) {
          navigate(`/${redirectPath}`, {
            state: { user: data.utente },
            replace: true,
          });
        } else {
          onLogin(data);
        }
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
        {!loginType && !isSharedRedirect ? (
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
                {isSharedRedirect
                  ? "ACCESSO QUESTIONARIO CONDIVISO"
                  : loginType === "relatore"
                  ? "AREA RELATORE"
                  : "AREA UTENTE"}
              </h1>
              {isSharedRedirect && (
                <p className="shared-redirect-message">
                  Inserisci il tuo codice fiscale per accedere al questionario
                </p>
              )}
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
                  {!isSharedRedirect && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="btn btn-secondary"
                      disabled={loading}
                    >
                      Indietro
                    </button>
                  )}
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
