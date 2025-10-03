const API_BASE_URL = "http://localhost:3000/api";

// Configurazione base per le chiamate API
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Errore nella richiesta");
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// API Functions
export const auth = {
  register: (userData) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
};

export const questionnaires = {
  getAll: () => apiRequest("/questionnaires"),

  create: (questionnaireData) =>
    apiRequest("/questionnaires", {
      method: "POST",
      body: JSON.stringify(questionnaireData),
    }),

  // Genera link di condivisione
  generateShareLink: (id) =>
    apiRequest(`/questionnaires/${id}/share`, {
      method: "POST",
    }),

  // Rimuovi condivisione
  removeShare: (id) =>
    apiRequest(`/questionnaires/${id}/share`, {
      method: "DELETE",
    }),

  // Recupera risposte per un questionario
  getResponses: (questionnaireId) =>
    apiRequest(`/questionnaires/${questionnaireId}/responses`),
};

// API per questionari condivisi (senza autenticazione)
export const shared = {
  // Recupera questionario condiviso
  getQuestionnaire: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/shared/${token}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nella richiesta");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  // Invia risposta al questionario condiviso
  submitResponse: async (token, responseData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/shared/${token}/responses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(responseData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Errore nella richiesta");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },
};
