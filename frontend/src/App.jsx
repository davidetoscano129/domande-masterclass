import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Import dei componenti estratti
import LoginPage from "./components/auth/LoginPage.jsx";
import RelatoreDashboard from "./components/dashboard/RelatoreDashboard.jsx";
import UtenteDashboard from "./components/dashboard/UtenteDashboard.jsx";
import SharedQuestionairePage from "./components/shared/SharedQuestionairePage.jsx";

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

export default App;
