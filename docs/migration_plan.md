# PIANO DI MIGRAZIONE - DA v1.0 A v2.0

## 🎯 STRATEGIA DI MIGRAZIONE

### FASE 1: PREPARAZIONE (Compatibilità)

1. **Backup completo** del database esistente
2. **Aggiungere colonne** alla tabella users esistente:
   ```sql
   ALTER TABLE users ADD COLUMN role ENUM('admin', 'instructor') DEFAULT 'instructor';
   ALTER TABLE users ADD COLUMN invited_by INT UNSIGNED NULL;
   ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
   ```
3. **Convertire utenti esistenti** in "instructor"
4. **Creare admin** di default

### FASE 2: NUOVE TABELLE (Additive)

1. Creare tabelle `students`, `courses`, `student_responses`
2. Modificare tabella `questionnaires` (aggiungere colonne)
3. Modificare tabella `responses` (aggiungere student_id)

### FASE 3: MIGRAZIONE DATI

1. **Studenti**: Estrarre email uniche da `responses` esistenti
2. **Risposte**: Collegare a studenti creati
3. **Questionari**: Aggiungere share_token a quelli esistenti

### FASE 4: NUOVE FUNZIONALITÀ

1. Sistema inviti relatori
2. Gestione corsi
3. Dashboard amministrativo
4. Analytics avanzate

---

## 📋 IMPATTO SUL CODICE ESISTENTE

### BACKEND (Node.js)

#### Routes da modificare:

- **`/api/auth/*`**: Aggiungere gestione ruoli
- **`/api/questionnaires/*`**: Filtri per permessi
- **`/api/shared/*`**: Gestione identificazione studenti

#### Nuove routes necessarie:

- **`/api/admin/*`**: Gestione amministratori
- **`/api/students/*`**: Gestione studenti
- **`/api/courses/*`**: Gestione corsi
- **`/api/analytics/*`**: Statistiche avanzate

#### Middleware da aggiornare:

- **Authentication**: Controllo ruoli
- **Authorization**: Permessi per azione
- **Validation**: Nuovi campi studenti

### FRONTEND (React)

#### Componenti da modificare:

- **`Dashboard.jsx`**: Dashboard diversa per ruolo
- **`Login.jsx`**: Redirect basato su ruolo
- **`SharedQuestionnaire.jsx`**: Identificazione studente

#### Nuovi componenti necessari:

- **`AdminDashboard.jsx`**: Pannello amministrativo
- **`StudentIdentification.jsx`**: Form identificazione
- **`UserManagement.jsx`**: Gestione utenti
- **`CourseManagement.jsx`**: Gestione corsi
- **`AdvancedAnalytics.jsx`**: Analytics estese

---

## ⚠️ BREAKING CHANGES

### Database

❌ **Tabella `responses`**:

- `respondent_email` → Rimosso (ora via student_id)
- `respondent_name` → Rimosso (ora via student_id)
- `student_id` → Aggiunto (REQUIRED)

### API

❌ **Endpoint `/api/shared/{token}/responses`**:

- Ora richiede identificazione studente
- Payload diverso per registrazione

❌ **Endpoint `/api/questionnaires`**:

- Filtro automatico per ruolo utente
- Nuovi campi nel response

### Frontend

❌ **SharedQuestionnaire.jsx**:

- Form identificazione obbligatorio
- Gestione matricola/email

---

## 🔄 PIANO DI IMPLEMENTAZIONE GRADUALE

### SETTIMANA 1: Database Foundation

- [ ] Backup database corrente
- [ ] Eseguire migrations additive
- [ ] Testare compatibilità esistente

### SETTIMANA 2: Backend Core

- [ ] Aggiornare sistema autenticazione
- [ ] Implementare middleware autorizzazione
- [ ] Aggiornare API esistenti

### SETTIMANA 3: Frontend Admin

- [ ] Dashboard amministrativo
- [ ] Gestione utenti/inviti
- [ ] Gestione corsi

### SETTIMANA 4: Student System

- [ ] Identificazione studenti
- [ ] Aggiornare compilazione questionari
- [ ] Storico studenti

### SETTIMANA 5: Analytics & Testing

- [ ] Dashboard analytics avanzate
- [ ] Testing completo
- [ ] Documentazione

---

## 🎛️ FEATURE FLAGS (Implementazione Sicura)

```javascript
const FEATURES = {
  MULTI_ROLE_SYSTEM: process.env.ENABLE_MULTI_ROLE === "true",
  STUDENT_TRACKING: process.env.ENABLE_STUDENT_TRACKING === "true",
  ADVANCED_ANALYTICS: process.env.ENABLE_ANALYTICS === "true",
  COURSE_MANAGEMENT: process.env.ENABLE_COURSES === "true",
};
```

Questo permette di:

- ✅ Rilasciare gradualmente le funzionalità
- ✅ Rollback rapido in caso di problemi
- ✅ Testing A/B su utenti specifici
- ✅ Mantenere stabilità sistema esistente

---

## 📊 METRICHE DI SUCCESS

### Funzionalità

- ✅ 0 downtime durante migrazione
- ✅ 100% compatibilità questionari esistenti
- ✅ Tutti gli utenti attuali convertiti in "instructor"

### Performance

- ✅ Tempo risposta API ≤ 200ms (stesso di prima)
- ✅ Dashboard carica in ≤ 2 secondi
- ✅ Analytics calcolo ≤ 5 secondi

### User Experience

- ✅ Learning curve ≤ 5 minuti per utenti esistenti
- ✅ Nuove funzionalità intuitive per admin
- ✅ Zero perdita dati durante migrazione
