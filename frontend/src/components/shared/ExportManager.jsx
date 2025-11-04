import React, { useState, useEffect } from "react";
import { API_BASE } from "../../constants/api.js";

function ExportManager({ user, onClose }) {
  const [exportType, setExportType] = useState("all"); // all, user, questionario, lezione
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedQuestionario, setSelectedQuestionario] = useState("");
  const [selectedLezione, setSelectedLezione] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [format, setFormat] = useState("excel");

  const [utenti, setUtenti] = useState([]);
  const [questionari, setQuestionari] = useState([]);
  const [lezioni, setLezioni] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setDataLoading(true);
    try {
      const [utentiRes, questionariRes, lezioniRes] = await Promise.all([
        fetch(`${API_BASE}/utenti`),
        fetch(`${API_BASE}/questionari/relatore/${user.relatore.id}`),
        fetch(`${API_BASE}/lezioni/relatore/${user.relatore.id}`),
      ]);

      const utentiData = await utentiRes.json();
      const questionariData = await questionariRes.json();
      const lezioniData = await lezioniRes.json();

      setUtenti(utentiData);
      setQuestionari(questionariData);
      setLezioni(lezioniData);
    } catch (error) {
      console.error("Errore caricamento dati:", error);
    } finally {
      setDataLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/export/preview?`;
      const params = new URLSearchParams();

      if (exportType === "user" && selectedUser) {
        params.append("utente_id", selectedUser);
      } else if (exportType === "questionario" && selectedQuestionario) {
        params.append("questionario_id", selectedQuestionario);
      } else if (exportType === "lezione" && selectedLezione) {
        params.append("lezione_id", selectedLezione);
      }

      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);

      const response = await fetch(url + params.toString());
      const data = await response.json();
      setPreview(data);
    } catch (error) {
      console.error("Errore anteprima:", error);
      alert("Errore nel caricamento dell'anteprima");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!preview || preview.risposte.length === 0) {
      alert("Nessun dato da esportare");
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("format", format);

      if (exportType === "user" && selectedUser) {
        params.append("utente_id", selectedUser);
      } else if (exportType === "questionario" && selectedQuestionario) {
        params.append("questionario_id", selectedQuestionario);
      } else if (exportType === "lezione" && selectedLezione) {
        params.append("lezione_id", selectedLezione);
      }

      if (dateFrom) params.append("date_from", dateFrom);
      if (dateTo) params.append("date_to", dateTo);

      const response = await fetch(
        `${API_BASE}/export/risposte?${params.toString()}`
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `export_risposte_${new Date().getTime()}.${
          format === "excel" ? "xlsx" : format
        }`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        alert("Export completato con successo!");
      } else {
        alert("Errore durante l'export");
      }
    } catch (error) {
      console.error("Errore export:", error);
      alert("Errore durante l'export");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content-large">
        <div className="modal-header">
          <h2>Gestione Esportazioni</h2>
          <button onClick={onClose} className="btn-close">
            ×
          </button>
        </div>

        <div style={{ padding: "var(--space-lg)" }}>
          {/* Selezione tipo di export */}
          <div
            className="relatore-card-modern"
            style={{ marginBottom: "var(--space-lg)" }}
          >
            <div className="relatore-card-content">
              <h3 className="relatore-card-title">Seleziona cosa esportare</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "var(--space-md)",
                  marginTop: "var(--space-md)",
                }}
              >
                <button
                  onClick={() => setExportType("all")}
                  className={`btn-small-modern ${
                    exportType === "all" ? "btn-view" : "btn-share"
                  }`}
                  style={{ padding: "var(--space-md)", height: "auto" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        marginBottom: "var(--space-xs)",
                      }}
                    >
                      📊
                    </div>
                    <div style={{ fontWeight: "600" }}>Tutte le Risposte</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                      Esporta tutto
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExportType("user")}
                  className={`btn-small-modern ${
                    exportType === "user" ? "btn-view" : "btn-share"
                  }`}
                  style={{ padding: "var(--space-md)", height: "auto" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        marginBottom: "var(--space-xs)",
                      }}
                    >
                      👤
                    </div>
                    <div style={{ fontWeight: "600" }}>Per Utente</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                      Seleziona utente
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExportType("questionario")}
                  className={`btn-small-modern ${
                    exportType === "questionario" ? "btn-view" : "btn-share"
                  }`}
                  style={{ padding: "var(--space-md)", height: "auto" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        marginBottom: "var(--space-xs)",
                      }}
                    >
                      📝
                    </div>
                    <div style={{ fontWeight: "600" }}>Per Questionario</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                      Seleziona questionario
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setExportType("lezione")}
                  className={`btn-small-modern ${
                    exportType === "lezione" ? "btn-view" : "btn-share"
                  }`}
                  style={{ padding: "var(--space-md)", height: "auto" }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div
                      style={{
                        fontSize: "1.5rem",
                        marginBottom: "var(--space-xs)",
                      }}
                    >
                      📚
                    </div>
                    <div style={{ fontWeight: "600" }}>Per Lezione</div>
                    <div style={{ fontSize: "0.75rem", opacity: 0.8 }}>
                      Seleziona lezione
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Filtri specifici */}
          <div
            className="relatore-card-modern"
            style={{ marginBottom: "var(--space-lg)" }}
          >
            <div className="relatore-card-content">
              <h3 className="relatore-card-title">Filtri</h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-md)",
                  marginTop: "var(--space-md)",
                }}
              >
                {exportType === "user" && (
                  <div className="input-group">
                    <label>Seleziona Utente</label>
                    <select
                      value={selectedUser}
                      onChange={(e) => setSelectedUser(e.target.value)}
                      className="input-modern"
                      disabled={dataLoading}
                    >
                      <option value="">-- Seleziona un utente --</option>
                      {utenti.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.nome} (ID: {u.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {exportType === "questionario" && (
                  <div className="input-group">
                    <label>Seleziona Questionario</label>
                    <select
                      value={selectedQuestionario}
                      onChange={(e) => setSelectedQuestionario(e.target.value)}
                      className="input-modern"
                      disabled={dataLoading}
                    >
                      <option value="">-- Seleziona un questionario --</option>
                      {questionari.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.titolo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {exportType === "lezione" && (
                  <div className="input-group">
                    <label>Seleziona Lezione</label>
                    <select
                      value={selectedLezione}
                      onChange={(e) => setSelectedLezione(e.target.value)}
                      className="input-modern"
                      disabled={dataLoading}
                    >
                      <option value="">-- Seleziona una lezione --</option>
                      {lezioni.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.titolo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-row-modern">
                  <div className="input-group">
                    <label>Data Inizio</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="input-modern"
                    />
                  </div>
                  <div className="input-group">
                    <label>Data Fine</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="input-modern"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Formato Esportazione</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="input-modern"
                  >
                    <option value="excel">Excel (.xlsx)</option>
                    <option value="csv">CSV (.csv)</option>
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="json">JSON (.json)</option>
                    <option value="word">Word (.docx)</option>
                  </select>
                </div>

                <button
                  onClick={handlePreview}
                  disabled={
                    loading ||
                    dataLoading ||
                    (exportType === "user" && !selectedUser) ||
                    (exportType === "questionario" && !selectedQuestionario) ||
                    (exportType === "lezione" && !selectedLezione)
                  }
                  className="btn-primary-modern"
                >
                  {loading ? "Caricamento..." : "Anteprima Dati"}
                </button>
              </div>
            </div>
          </div>

          {/* Anteprima */}
          {preview && (
            <div
              className="relatore-card-modern"
              style={{ marginBottom: "var(--space-lg)" }}
            >
              <div className="relatore-card-content">
                <h3 className="relatore-card-title">Anteprima Export</h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: "var(--space-md)",
                    marginTop: "var(--space-md)",
                    marginBottom: "var(--space-md)",
                  }}
                >
                  <div
                    style={{
                      padding: "var(--space-md)",
                      backgroundColor: "var(--brand-blue)",
                      color: "var(--white)",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", fontWeight: "700" }}>
                      {preview.totale_risposte}
                    </div>
                    <div style={{ fontSize: "0.875rem" }}>Risposte</div>
                  </div>
                  <div
                    style={{
                      padding: "var(--space-md)",
                      backgroundColor: "var(--brand-green)",
                      color: "var(--white)",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", fontWeight: "700" }}>
                      {preview.utenti_unici}
                    </div>
                    <div style={{ fontSize: "0.875rem" }}>Utenti</div>
                  </div>
                  <div
                    style={{
                      padding: "var(--space-md)",
                      backgroundColor: "var(--gray-700)",
                      color: "var(--white)",
                      borderRadius: "var(--radius-sm)",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: "2rem", fontWeight: "700" }}>
                      {preview.questionari_unici}
                    </div>
                    <div style={{ fontSize: "0.875rem" }}>Questionari</div>
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid var(--gray-200)",
                    borderRadius: "var(--radius-sm)",
                    padding: "var(--space-md)",
                  }}
                >
                  <table style={{ width: "100%", fontSize: "0.875rem" }}>
                    <thead
                      style={{
                        position: "sticky",
                        top: 0,
                        backgroundColor: "var(--white)",
                        borderBottom: "2px solid var(--gray-200)",
                      }}
                    >
                      <tr>
                        <th
                          style={{
                            padding: "var(--space-sm)",
                            textAlign: "left",
                          }}
                        >
                          Utente
                        </th>
                        <th
                          style={{
                            padding: "var(--space-sm)",
                            textAlign: "left",
                          }}
                        >
                          Questionario
                        </th>
                        <th
                          style={{
                            padding: "var(--space-sm)",
                            textAlign: "left",
                          }}
                        >
                          Data
                        </th>
                        <th
                          style={{
                            padding: "var(--space-sm)",
                            textAlign: "center",
                          }}
                        >
                          Stato
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.risposte.slice(0, 50).map((risposta, index) => (
                        <tr
                          key={index}
                          style={{ borderBottom: "1px solid var(--gray-100)" }}
                        >
                          <td style={{ padding: "var(--space-sm)" }}>
                            {risposta.utente_nome}
                          </td>
                          <td style={{ padding: "var(--space-sm)" }}>
                            {risposta.questionario_titolo}
                          </td>
                          <td style={{ padding: "var(--space-sm)" }}>
                            {new Date(risposta.submitted_at).toLocaleDateString(
                              "it-IT"
                            )}
                          </td>
                          <td
                            style={{
                              padding: "var(--space-sm)",
                              textAlign: "center",
                            }}
                          >
                            <span
                              className={
                                risposta.completata
                                  ? "badge-success"
                                  : "badge-elimina"
                              }
                            >
                              {risposta.completata ? "✓" : "✗"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.risposte.length > 50 && (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "var(--space-md)",
                        color: "var(--gray-600)",
                        fontSize: "0.875rem",
                      }}
                    >
                      ... e altre {preview.risposte.length - 50} risposte
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: "var(--space-md)",
                    display: "flex",
                    gap: "var(--space-sm)",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setPreview(null)}
                    className="btn-secondary-modern"
                  >
                    Annulla
                  </button>
                  <button
                    onClick={handleExport}
                    disabled={loading}
                    className="btn-primary-modern"
                  >
                    {loading
                      ? "Esportazione..."
                      : `Esporta in ${format.toUpperCase()}`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExportManager;
