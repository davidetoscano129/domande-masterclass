import { useState } from "react";
import { auth } from "../services/api";

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let response;
      if (isRegister) {
        response = await auth.register(formData);
      } else {
        response = await auth.login({
          email: formData.email,
          password: formData.password,
        });
      }

      onLogin(response.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={{ maxWidth: "400px", margin: "100px auto", padding: "20px" }}>
      <h2>{isRegister ? "Registrazione" : "Login"}</h2>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div style={{ marginBottom: "15px" }}>
            <input
              type="text"
              name="name"
              placeholder="Nome"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "10px" }}
            />
          </div>
        )}

        <div style={{ marginBottom: "15px" }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "10px" }}
          />
        </div>

        {error && (
          <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          {loading ? "Caricamento..." : isRegister ? "Registrati" : "Accedi"}
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        {isRegister ? "Hai già un account?" : "Non hai un account?"}
        <button
          onClick={() => setIsRegister(!isRegister)}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            cursor: "pointer",
            marginLeft: "5px",
          }}
        >
          {isRegister ? "Accedi" : "Registrati"}
        </button>
      </p>
    </div>
  );
}

export default Login;
