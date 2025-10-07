import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shared } from "../services/api";

function UserLogin() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    nome: "",
    cognome: "",
    azienda: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Se l'utente è già loggato, vai all'area personale
    const token = localStorage.getItem("external_user_token");
    if (token) {
      navigate("/user-area");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (isRegister) {
        // Registrazione
        result = await shared.registerUser({
          email: formData.email,
          password: formData.password,
          azienda: formData.azienda,
          nome: formData.nome,
          cognome: formData.cognome,
        });
      } else {
        // Login
        result = await shared.loginUser({
          email: formData.email,
          password: formData.password,
        });
      }

      // Salva token e reindirizza
      localStorage.setItem("external_user_token", result.token);
      navigate("/user-area");
    } catch (error) {
      console.error("Errore:", error);
      setError(error.message || "Errore durante l'operazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "#333", marginBottom: "10px" }}>
            👤 {isRegister ? "Registrazione Utente" : "Login Utente"}
          </h2>
          <p style={{ color: "#666", fontSize: "14px" }}>
            {isRegister
              ? "Crea il tuo account per accedere ai questionari"
              : "Accedi alla tua area personale"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Campi per registrazione */}
          {isRegister && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <input
                  type="text"
                  name="nome"
                  placeholder="Nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <input
                  type="text"
                  name="cognome"
                  placeholder="Cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "15px" }}>
                <input
                  type="text"
                  name="azienda"
                  placeholder="Azienda/Organizzazione"
                  value={formData.azienda}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "16px",
                  }}
                />
              </div>
            </>
          )}

          {/* Email */}
          <div style={{ marginBottom: "15px" }}>
            <input
              type="email"
              name="email"
              placeholder="Email Professionale"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontSize: "16px",
              }}
            />
          </div>

          {/* Errore */}
          {error && (
            <div
              style={{
                color: "#dc3545",
                marginBottom: "15px",
                padding: "10px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Caricamento..." : isRegister ? "Registrati" : "Accedi"}
          </button>
        </form>

        {/* Toggle Login/Registrazione */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setFormData({
                email: "",
                password: "",
                nome: "",
                cognome: "",
                azienda: "",
              });
            }}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              textDecoration: "underline",
              fontSize: "14px",
            }}
          >
            {isRegister
              ? "Hai già un account? Accedi"
              : "Non hai un account? Registrati"}
          </button>
        </div>

        {/* Link Homepage */}
        <div
          style={{
            textAlign: "center",
            marginTop: "20px",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
          }}
        >
          <a
            href="/"
            style={{
              color: "#6c757d",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Torna alla homepage
          </a>
        </div>
      </div>
    </div>
  );
}

export default UserLogin;
