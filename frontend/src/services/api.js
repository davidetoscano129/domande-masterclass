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

  getById: (id) => apiRequest(`/questionnaires/${id}`),

  create: (questionnaireData) =>
    apiRequest("/questionnaires", {
      method: "POST",
      body: JSON.stringify(questionnaireData),
    }),

  update: (id, questionnaireData) =>
    apiRequest(`/questionnaires/${id}`, {
      method: "PUT",
      body: JSON.stringify(questionnaireData),
    }),

  generateShareLink: (id) =>
    apiRequest(`/questionnaires/${id}/share`, {
      method: "POST",
    }),

  removeShare: (id) =>
    apiRequest(`/questionnaires/${id}/share`, {
      method: "DELETE",
    }),

  delete: (id) =>
    apiRequest(`/questionnaires/${id}`, {
      method: "DELETE",
    }),

  getResponses: (id) => apiRequest(`/questionnaires/${id}/responses`),
};

export const shared = {
  getQuestionnaire: (token) => apiRequest(`/shared/${token}`),

  submitResponse: (token, responseData) => {
    const externalUserToken = localStorage.getItem("external_user_token");
    const headers = {
      "Content-Type": "application/json",
      ...(externalUserToken && {
        Authorization: `Bearer ${externalUserToken}`,
      }),
    };

    return fetch(`${API_BASE_URL}/shared/${token}/responses`, {
      method: "POST",
      headers,
      body: JSON.stringify(responseData),
    }).then((response) => {
      if (!response.ok) {
        return response.json().then((error) => {
          throw new Error(error.error || "Errore nell'invio delle risposte");
        });
      }
      return response.json();
    });
  },

  registerStudent: (studentData) =>
    apiRequest("/shared/register-student", {
      method: "POST",
      body: JSON.stringify(studentData),
    }),

  registerUser: (userData) =>
    apiRequest("/shared/register-user", {
      method: "POST",
      body: JSON.stringify(userData),
    }),

  loginUser: (loginData) =>
    apiRequest("/shared/login-user", {
      method: "POST",
      body: JSON.stringify(loginData),
    }),

  getUserQuestionnaires: () => {
    const token = localStorage.getItem("external_user_token");
    return fetch(`${API_BASE_URL}/shared/my-questionnaires`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (!response.ok) {
        throw new Error("Errore nel caricamento dei questionari");
      }
      return response.json();
    });
  },

  getMyResponses: (shareToken) => {
    const token = localStorage.getItem("external_user_token");
    return fetch(`${API_BASE_URL}/shared/${shareToken}/my-responses`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }).then((response) => {
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Nessuna risposta trovata");
        }
        throw new Error("Errore nel caricamento delle risposte");
      }
      return response.json();
    });
  },
};
