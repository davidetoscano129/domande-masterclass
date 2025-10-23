# # 🎓 App Questionari - Progetto Semplificato

Un'applicazione completa per la gestione di questionari in ambiente didattico, ottimizzata per semplicità e funzionalità.

## 📁 Struttura del Progetto

```
questionari-app/
├── server.js              # Backend completo (unico file)
├── package.json           # Dipendenze backend
├── .env                   # Configurazione database
├── database/
│   └── simple_schema.sql  # Schema database semplificato
└── frontend/
    ├── package.json       # Dipendenze frontend
    ├── src/
    │   ├── App.jsx        # App React completa
    │   └── App.css        # Stili CSS
    └── index.html
```

## 🚀 Setup Rapido

### 1. Database MySQL

```bash
# Crea il database
mysql -u root -p < database/simple_schema.sql
```

### 2. Backend

```bash
# Installa dipendenze
npm install

# Configura database nel file .env (già pronto)
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=questionari_app

# Avvia server
npm run dev
# Server: http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# Frontend: http://localhost:5173
```

## 👥 Accesso Applicazione

### Area Relatore

- **5 relatori predefiniti**: Relatore 1, 2, 3, 4, 5
- Funzionalità:
  - ✅ Gestione lezioni
  - ✅ Creazione/modifica questionari (tipo Google Forms)
  - ✅ Visualizzazione risposte per questionario/utente
  - ✅ Dashboard completa

### Area Utente

- **30 utenti predefiniti**: Utente 1, 2, 3...30
- Funzionalità:
  - ✅ Visualizzazione questionari per lezione
  - ✅ Compilazione questionari
  - ✅ Tracciamento stato completamento

## 📝 Tipi di Domande Supportate

Il sistema supporta tutti i tipi di domanda in stile Google Forms:

- **Testo libero**: Risposte brevi
- **Testo lungo**: Risposte estese
- **Scelta multipla**: Una selezione tra opzioni
- **Caselle di controllo**: Selezioni multiple
- **Numero**: Input numerico
- **Data**: Selezione data
- **Email**: Validazione email
- **Valutazione**: Scala 1-5 stelle

## 🔄 Flusso Applicazione

### Per Relatori:

1. Login → Selezione relatore
2. **Lezioni**: Creare lezioni prima dei questionari
3. **Questionari**: Creare questionari collegati alle lezioni
4. **Utenti**: Monitorare risposte per utente

### Per Utenti:

1. Login → Selezione utente (senza password)
2. Visualizzazione questionari divisi per lezione/relatore
3. Compilazione questionari con stato di completamento
4. Possibilità di rivedere risposte già inviate

## 🛠️ API Endpoints

```
# Autenticazione
POST /api/auth/relatore
POST /api/auth/utente

# Gestione dati
GET /api/relatori
GET /api/utenti
GET /api/lezioni
GET /api/questionari
GET /api/risposte

# CRUD completo per lezioni, questionari, risposte
POST, PUT, DELETE per tutte le entità
```

## 🎯 Caratteristiche Principali

- **Architettura semplificata**: 1 file backend, 1 file frontend principale
- **Zero configurazione complessa**: Setup in 3 comandi
- **Database minimal**: Schema ottimizzato con JSON per flessibilità
- **UI intuitiva**: Design moderno e responsive
- **Funzionalità complete**: Tutte le feature richieste implementate

## 🔧 Personalizzazione

- **Relatori**: Modifica dati in `database/simple_schema.sql`
- **Utenti**: Aggiorna inserimenti nel file SQL
- **Stili**: Personalizza `frontend/src/App.css`
- **API**: Estendi `server.js` per nuove funzionalità

## 📊 Monitoraggio Risposte

I relatori possono:

- Vedere tutte le risposte ai propri questionari
- Analizzare risposte per singolo utente
- Esportare statistiche base (tempo completamento, tasso risposta)
- Modificare solo i propri questionari ma vedere tutti gli altri

Gli utenti possono:

- Compilare questionari una sola volta
- Rivedere le proprie risposte già inviate
- Vedere chiaramente stato completamento per ogni questionario

L'applicazione è ora **completamente funzionale** e **ottimizzata per semplicità** mantenendo tutte le funzionalità richieste!

- **Relatori**: Selezione diretta da lista (nessuna password)
- **Partecipanti**: Selezione diretta da lista (nessuna password)

### Organizzazione per Lezioni

- Ogni relatore può creare più lezioni
- Ogni lezione può contenere più questionari
- Sistema di assegnazione controllata dei partecipanti

## 🚀 Struttura del Progetto

```
domande-masterclass/
├── frontend/                 # React + Vite app (port 5173)
│   ├── src/
│   │   ├── components/       # Dashboard per i 3 tipi di utenti
│   │   └── services/         # API client per nuovo sistema
├── backend/                  # Node.js/Express API (port 3000)
│   ├── src/
│   │   ├── routes/
│   │   │   ├── admin.js      # Gestione admin
│   │   │   ├── instructors.js # Gestione relatori
│   │   │   ├── users.js      # Gestione partecipanti
│   │   │   ├── lessons.js    # Gestione lezioni
│   │   │   ├── questionnaires.js # Gestione questionari
│   │   │   └── questions.js  # Gestione domande
│   │   ├── config/           # Database configuration
│   │   └── middleware/       # Autenticazione per 3 livelli
├── database/                 # MySQL schema per nuovo sistema
│   └── complete_migration.sql # Migrazione completa
└── render.yaml              # Render deployment configuration
```

## 📋 Funzionalità per Tipo di Utente

### 👑 Admin

- Login con username/password
- Statistiche complete del sistema
- Gestione di tutti i relatori e partecipanti
- Monitoraggio globale delle attività
- Backup e manutenzione del sistema

### 🎓 Relatori (Instructors)

- Selezione dalla lista (ID 1-5)
- Creazione e gestione delle proprie lezioni
- Creazione questionari per le lezioni
- Visualizzazione risposte dei partecipanti
- Analytics delle proprie attività

### 👥 Partecipanti (Users)

- Selezione dalla lista (ID 1-30)
- Dashboard con questionari assegnati
- Compilazione questionari attivi
- Storico delle risposte
- Tracking del progresso

## 🛠️ Setup e Installazione

### Prerequisiti

- Node.js (v18+)
- MySQL database
- npm

### 1. Configurazione Database

```bash
# Eseguire la migrazione completa
cd backend
npm install
node migrate.js
```

Questo comando:

- Ricrea completamente il database
- Inserisce i dati di esempio
- Configura il sistema a 3 livelli

### 2. Configurazione Backend

```bash
cd backend
npm install

# Crea file .env con:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=domande_questionari
JWT_SECRET=your_jwt_secret_key
PORT=3000
```

### 3. Avvio Backend

```bash
npm start
```

Il server sarà disponibile su `http://localhost:3000`

### 4. Configurazione Frontend

```bash
cd frontend
npm install
npm run dev
```

Il frontend sarà disponibile su `http://localhost:5173`

## 🔑 API Endpoints

### Admin

- `POST /api/admin/login` - Login admin
- `GET /api/admin/stats` - Statistiche sistema
- `GET /api/admin/users` - Lista tutti gli utenti

### Relatori

- `GET /api/instructors` - Lista relatori
- `GET /api/instructors/:id/dashboard` - Dashboard relatore
- `POST /api/instructors/:id/lessons` - Crea lezione

### Partecipanti

- `GET /api/users` - Lista partecipanti
- `GET /api/users/:id/dashboard` - Dashboard partecipante
- `GET /api/users/:id/questionnaires` - Questionari assegnati

### Lezioni

- `GET /api/lessons` - Lista lezioni
- `POST /api/lessons` - Crea lezione
- `PUT /api/lessons/:id` - Modifica lezione
- `DELETE /api/lessons/:id` - Elimina lezione

### Questionari

- `GET /api/questionnaires` - Lista questionari
- `GET /api/questionnaires/lesson/:lessonId` - Questionari per lezione
- `POST /api/questionnaires` - Crea questionario
- `PUT /api/questionnaires/:id` - Modifica questionario

## 🔐 Autenticazione

### Admin

```bash
# Header richiesto:
Authorization: Bearer <jwt_token>

# Ottenere token:
POST /api/admin/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Relatori

```bash
# Header richiesto:
x-instructor-id: <1-5>

# Esempio per Relatore 3:
x-instructor-id: 3
```

### Partecipanti

```bash
# Header richiesto:
x-user-id: <1-30>

# Esempio per Partecipante 15:
x-user-id: 15
```

## � Database Schema

### Tabelle Principali

- `admin` - Utente amministratore (1)
- `instructors` - Relatori (5)
- `users` - Partecipanti (30)
- `lessons` - Lezioni create dai relatori
- `questionnaires` - Questionari collegati alle lezioni
- `questions` - Domande dei questionari
- `responses` - Risposte dei partecipanti
- `answers` - Dettagli delle risposte
- `questionnaire_assignments` - Assegnazioni partecipanti-questionari

### Dati di Esempio

Dopo la migrazione, il sistema include:

- 1 Admin configurato
- 5 Relatori (Relatore 1-5)
- 30 Partecipanti (Partecipante 1-30)
- 5 Lezioni di esempio
- 5 Questionari di esempio
- Assegnazioni di test

## 🌐 Deploy su Render

Il progetto include configurazione per deploy automatico su Render via `render.yaml`.

## 📄 Migrazione dal Sistema Precedente

Per migrare dal sistema precedente:

1. Eseguire backup dei dati esistenti
2. Lanciare `node migrate.js`
3. Aggiornare il frontend per le nuove API
4. Testare i 3 tipi di autenticazione

## 🤝 Sviluppo

### Struttura del Codice

- Backend modularizzato per tipo di utente
- Middleware di autenticazione specifici
- API RESTful con convenzioni chiare
- Frontend componentizzato per i 3 dashboard

### Best Practices

- Sempre verificare permessi nelle API
- Usare gli header di autenticazione corretti
- Validare input lato client e server
- Gestire errori in modo user-friendly

## 📋 ToDo per Sviluppo Futuro

- [ ] Sistema di notifiche in tempo reale
- [ ] Export avanzato delle risposte
- [ ] Template di questionari predefiniti
- [ ] Sistema di backup automatico
- [ ] Analytics avanzate per admin
- [ ] Mobile responsive ottimizzato

---

## 🔧 Troubleshooting

### Problemi Comuni

**Database non si connette**

```bash
# Verificare che MySQL sia in esecuzione
# Controllare credenziali in .env
# Verificare che il database esista
```

**Errori di autenticazione**

```bash
# Verificare header corretti per tipo utente
# Admin: Authorization Bearer token
# Relatori: x-instructor-id (1-5)
# Partecipanti: x-user-id (1-30)
```

**Migrazione fallisce**

```bash
# Verificare permessi MySQL
# Assicurarsi che il database sia vuoto
# Controllare log per errori specifici
```

Per supporto, verificare i log del server e della console browser.

# DB_USER=root

# DB_PASSWORD=your_password

# DB_NAME=domande-questionari

# JWT_SECRET=your-secret-key

# JWT_EXPIRES_IN=7d

npm run dev

````

### Configurazione Frontend

```bash
cd frontend
npm install
npm run dev
````

## 🌐 Utilizzo

1. **Staff/Admin**: Accesso tramite `/login` per creare e gestire questionari
2. **Utenti Esterni**: Registrazione tramite `/user-login` per accedere ai questionari assegnati
3. **Condivisione Pubblica**: I questionari possono essere condivisi tramite link `/share/:token`

## 🔧 API Endpoints

- `POST /api/auth/login` - Login staff/admin
- `POST /api/shared/register-user` - Registrazione utenti esterni
- `POST /api/shared/login-user` - Login utenti esterni
- `GET /api/shared/my-questionnaires` - Questionari assegnati all'utente
- `GET /api/shared/:token` - Accesso pubblico ai questionari
- `POST /api/shared/:token/responses` - Invio risposte

Credenziali -> codice fiscale
Web design
