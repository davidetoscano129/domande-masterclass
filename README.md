# App Questionari - Progetto Masterclass

Applicazione web completa per la gestione di questionari in ambiente didattico con sistema di autenticazione a tre livelli.

## Architettura

```
domande-masterclass/
├── frontend/                    # React + Vite (porta 5173)
│   ├── src/
│   │   ├── components/          # Dashboard per tipologie utente
│   │   ├── styles/              # Sistema di design CSS
│   │   └── utils/               # Helper e utilità
├── database/
│   └── schema.sql               # Schema MySQL
├── server.js                    # Server Node.js/Express completo (porta 3000)
└── package.json                 # Dipendenze backend
```

## Installazione

### 1. Configurazione Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Configurazione Backend

```bash
npm install

# Crea file .env:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=questionari_app

npm start
```

### 3. Configurazione Frontend

```bash
cd frontend
npm install
npm run dev
```

## Sistema di Autenticazione

### Relatori (ID 1-5)

- Gestione lezioni e questionari
- Visualizzazione risposte studenti
- Dashboard analytics
- Accesso tramite codice fiscale

### Utenti (ID 1-30)

- Compilazione questionari assegnati
- Tracking progressi
- Storico risposte
- Accesso tramite codice fiscale

## Tipologie di Domande

- Testo libero e testo lungo
- Scelta multipla e caselle di controllo
- Campi numerici e date
- Email con validazione
- Valutazione scala 1-5

## API Endpoints

### Autenticazione

- `POST /api/auth/relatore` - Login relatore tramite codice fiscale
- `POST /api/auth/utente` - Login utente tramite codice fiscale
- `GET /api/relatori` - Lista relatori
- `GET /api/utenti` - Lista utenti

### Gestione Contenuti

- `GET|POST|PUT|DELETE /api/lezioni` - Gestione lezioni
- `GET|POST|PUT|DELETE /api/questionari` - Gestione questionari
- `GET|POST /api/risposte` - Gestione risposte

### Condivisione

- `GET /api/shared/:token` - Accesso pubblico questionari
- `GET /api/shared/:token/utenti` - Lista utenti per questionario condiviso
- `POST /api/shared/:token/submit` - Invio risposte pubbliche

## Caratteristiche

- Autenticazione tramite codice fiscale per relatori e utenti
- Editor questionari con domande in formato JSON flessibile
- Dashboard responsive con design system unificato
- Condivisione questionari tramite token pubblici
- Tracking completo delle risposte con catalogazione efficiente
- Export risposte in formato Excel, Word e PDF
- Sistema di compilazioni uniche per utente

## Struttura Database

### Tabelle Principali

- `relatori` - Docenti del sistema (5 predefiniti)
- `utenti` - Studenti registrati (30 predefiniti)
- `lezioni` - Contenuti didattici organizzati per relatore
- `questionari` - Form con domande in JSON
- `compilazioni` - Risposte degli utenti con catalogazione
- `condivisioni` - Token per accesso pubblico ai questionari### Dati Predefiniti

- 5 Relatori (Relatore 1-5)
- 30 Utenti con codici fiscali di test
- Lezioni e questionari di esempio
- Sistema di assegnazioni automatiche

## Tecnologie

### Backend

- Node.js + Express (server.js monolitico)
- MySQL con domande e risposte in formato JSON
- Autenticazione tramite codice fiscale
- Export automatico in Excel, Word e PDF

### Frontend

- React 18 + Vite
- Sistema di design CSS unificato
- Componenti modulari per dashboard
- Responsive design

## Deployment

L'applicazione è configurata per deployment automatico su Render tramite `render.yaml`.

## Sviluppo

### Struttura Codice

- API RESTful modulari per tipo utente
- Componenti React specializzati per dashboard
- Sistema di stili centralizzato
- Validazione input client/server

### Autenticazione

- **Relatori**: Codice fiscale predefinito (es. RLTMRA85M10H501A)
- **Utenti**: Codice fiscale predefinito (es. UTNMRA90A01H501A)
- **Condivisione**: Token pubblico senza autenticazione

## Troubleshooting

**Connessione Database**

```bash
# Verificare MySQL attivo e credenziali in .env
mysql -u root -p
USE questionari_app;
```

**Errori Autenticazione**

```bash
# Verificare codici fiscali corretti per relatori/utenti
# Consultare CODICI_FISCALI_TEST.md per credenziali valide
```
