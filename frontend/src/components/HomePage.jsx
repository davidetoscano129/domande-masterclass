import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          textAlign: "center",
          maxWidth: "500px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "40px" }}>
          <h1
            style={{
              color: "#333",
              marginBottom: "10px",
              fontSize: "2.5em",
            }}
          >
            📋 Sistema Questionari
          </h1>
          <p
            style={{
              color: "#666",
              fontSize: "18px",
              lineHeight: "1.5",
            }}
          >
            Accedi al sistema per gestire o completare questionari
          </p>
        </div>

        {/* Opzioni di Login */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {/* Login Staff */}
          <Link
            to="/admin-login"
            style={{
              display: "block",
              backgroundColor: "#007bff",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "background-color 0.2s",
              border: "2px solid #007bff",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#0056b3";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#007bff";
            }}
          >
            👨‍💼 Accesso Amministratore/Relatore
            <div
              style={{
                fontSize: "14px",
                fontWeight: "normal",
                marginTop: "5px",
                opacity: 0.9,
              }}
            >
              Gestisci questionari e visualizza statistiche
            </div>
          </Link>

          {/* Login Utenti */}
          <Link
            to="/user-login"
            style={{
              display: "block",
              backgroundColor: "#28a745",
              color: "white",
              padding: "20px",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "18px",
              fontWeight: "bold",
              transition: "background-color 0.2s",
              border: "2px solid #28a745",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#1e7e34";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#28a745";
            }}
          >
            👤 Accesso Utente
            <div
              style={{
                fontSize: "14px",
                fontWeight: "normal",
                marginTop: "5px",
                opacity: 0.9,
              }}
            >
              Accedi alla tua area personale e completa questionari
            </div>
          </Link>
        </div>

        {/* Info aggiuntiva */}
        <div
          style={{
            marginTop: "30px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          <p style={{ margin: 0 }}>
            💡 <strong>Hai ricevuto un link diretto?</strong> Clicca sul link
            ricevuto per accedere direttamente al questionario.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
