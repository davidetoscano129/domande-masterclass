import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import SharedQuestionnaire from "./components/SharedQuestionnaire";
import UserArea from "./components/UserArea";
import HomePage from "./components/HomePage";
import UserLogin from "./components/UserLogin";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Controlla se c'è un token salvato
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Caricamento...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Homepage con opzioni di login */}
        <Route path="/" element={<HomePage />} />

        {/* Rotta pubblica per i questionari condivisi */}
        <Route path="/share/:token" element={<SharedQuestionnaire />} />

        {/* Login utenti esterni */}
        <Route path="/user-login" element={<UserLogin />} />

        {/* Area personale utenti esterni */}
        <Route path="/user-area" element={<UserArea />} />

        {/* Login amministratore/relatore */}
        <Route
          path="/admin-login"
          element={
            !isAuthenticated ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />

        {/* Dashboard amministratore/relatore */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/admin-login" replace />
            )
          }
        />

        {/* Rotta di fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
