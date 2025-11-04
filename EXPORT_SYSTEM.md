# 📊 Sistema di Esportazione Risposte

## Panoramica

Il sistema di esportazione centralizzato permette ai relatori di esportare le risposte dei questionari in modo flessibile e personalizzato.

## Accesso

Il pulsante **"📊 Esporta Risposte"** è disponibile nell'header del Dashboard Relatore, in alto a destra accanto al pulsante Logout.

## Funzionalità

### 1. Modalità di Esportazione

Il sistema offre 4 modalità di esportazione:

#### 📊 Tutte le Risposte

- Esporta **tutte** le risposte di tutti i questionari
- Utile per analisi globali e backup completi

#### 👤 Per Utente

- Seleziona un **utente specifico**
- Esporta solo le sue risposte a tutti i questionari
- Ideale per report individuali

#### 📝 Per Questionario

- Seleziona un **questionario specifico**
- Esporta tutte le risposte ricevute per quel questionario
- Perfetto per analisi di un singolo questionario

#### 📚 Per Lezione

- Seleziona una **lezione specifica**
- Esporta tutte le risposte dei questionari associati a quella lezione
- Utile per valutare l'efficacia di una lezione

### 2. Filtri Aggiuntivi

#### Intervallo Date

- **Data Inizio**: filtra risposte dalla data specificata
- **Data Fine**: filtra risposte fino alla data specificata
- Combinabili con qualsiasi modalità di esportazione

### 3. Formati di Esportazione

Il sistema supporta 5 formati:

| Formato   | Estensione | Stato          | Uso Consigliato                         |
| --------- | ---------- | -------------- | --------------------------------------- |
| **Excel** | `.xlsx`    | ✅ Disponibile | Analisi avanzate con formule e grafici  |
| **CSV**   | `.csv`     | ✅ Disponibile | Import in altri software                |
| **PDF**   | `.pdf`     | ✅ Disponibile | Documentazione stampabile e report      |
| **JSON**  | `.json`    | ✅ Disponibile | Backup tecnico/integrazione API         |
| **Word**  | `.docx`    | ✅ Disponibile | Report formattati e documenti ufficiali |

### 4. Anteprima

Prima di esportare, il sistema mostra:

- **Statistiche rapide**:

  - Numero totale di risposte
  - Numero di utenti unici
  - Numero di questionari unici

- **Tabella anteprima**:
  - Prime 50 risposte
  - Utente, Questionario, Data, Stato
  - Possibilità di verificare i dati prima dell'export

## Workflow d'Uso

1. **Clicca** sul pulsante "📊 Esporta Risposte" nell'header
2. **Seleziona** la modalità di esportazione desiderata
3. **Configura** i filtri specifici (utente/questionario/lezione)
4. **Imposta** eventuale intervallo di date
5. **Scegli** il formato di esportazione
6. **Clicca** su "Anteprima Dati" per verificare
7. **Rivedi** le statistiche e l'anteprima
8. **Clicca** su "Esporta in [FORMATO]" per scaricare

## Struttura Dati Esportati

### Formato JSON/CSV

Ogni riga contiene:

```json
{
  "utente_nome": "Nome Utente",
  "utente_id": 123,
  "questionario": "Titolo Questionario",
  "lezione": "Titolo Lezione",
  "relatore": "Nome Relatore",
  "domanda": "Testo della domanda",
  "tipo_domanda": "text|multiple_choice|rating|...",
  "risposta": "Risposta fornita",
  "data_invio": "01/01/2025, 10:30:00",
  "completata": "Sì|No",
  "tempo_impiegato": "5 min"
}
```

## API Backend

### GET `/api/export/preview`

Restituisce anteprima dei dati da esportare

**Query Parameters:**

- `utente_id` (optional): ID utente
- `questionario_id` (optional): ID questionario
- `lezione_id` (optional): ID lezione
- `date_from` (optional): Data inizio (YYYY-MM-DD)
- `date_to` (optional): Data fine (YYYY-MM-DD)

**Response:**

```json
{
  "totale_risposte": 150,
  "utenti_unici": 25,
  "questionari_unici": 5,
  "risposte": [...]
}
```

### GET `/api/export/risposte`

Esegue l'export nel formato richiesto

**Query Parameters:**

- `format` (required): `excel|csv|pdf|json|word`
- Stessi filtri di `/preview`

**Response:**

- File scaricabile nel formato richiesto

## Note Tecniche

### Limitazioni Attuali

- ⚠️ Formati Excel, PDF e Word in fase di implementazione
- ⚠️ Anteprima limitata alle prime 50 righe (per performance)
- ⚠️ Export asincrono per grandi dataset da implementare

### Performance

- Query ottimizzate con JOIN
- Indici su colonne filtrate
- Stream per file grandi (future enhancement)

### Sicurezza

- Export limitato ai dati del relatore loggato
- Validazione parametri lato server
- Sanitizzazione output CSV (escape caratteri speciali)

## Roadmap Futuri Sviluppi

### v1.1 - Formati Avanzati

- ✅ Implementazione export Excel con formattazione
- ✅ Generazione PDF con grafici
- ✅ Template Word personalizzabili

### v1.2 - Export Asincrono

- 📧 Invio email con link download per export grandi
- ⏱️ Job queue per elaborazione in background
- 📊 Progress bar per export lunghi

### v1.3 - Export Schedulato

- 🕐 Export automatici programmati
- 📅 Report settimanali/mensili
- ☁️ Salvataggio su cloud storage

### v1.4 - Export Avanzato

- 📈 Grafici e visualizzazioni incluse
- 🎨 Template personalizzati
- 🔄 Export comparativo tra periodi

## Supporto

Per problemi o suggerimenti sul sistema di esportazione, contattare il team di sviluppo.

---

**Ultimo aggiornamento:** 4 novembre 2025
**Versione:** 1.1.0 - Tutti i formati implementati ✅
