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

  submitResponse: (token, responseData) =>
    apiRequest(`/shared/${token}/responses`, {
      method: "POST",
      body: JSON.stringify(responseData),
    }),

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
};
