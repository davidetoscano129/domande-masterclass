# Questionari App

Un'applicazione full-stack per la gestione di questionari e sondaggi.

## 🚀 Struttura del Progetto

```
questionari-app/
├── frontend/          # React.js app - Interfaccia utente
├── backend/           # Node.js/Express API - Server e logica business
├── database/          # SQL scripts - Schema e dati del database
├── README.md         # Documentazione principale
└── .gitignore        # File da escludere dal versioning
```

## 📋 Funzionalità

- **Frontend**: Interfaccia React per creare e rispondere ai questionari
- **Backend**: API REST per gestire questionari, utenti e risposte
- **Database**: Storage persistente per dati e configurazioni

## 🛠️ Setup e Installazione

### Prerequisiti

- Node.js (v18+)
- npm o yarn
- Database (MySQL/PostgreSQL)

### Avvio Rapido

1. Clona il repository
2. Installa le dipendenze del backend: `cd backend && npm install`
3. Installa le dipendenze del frontend: `cd frontend && npm install`
4. Configura il database seguendo le istruzioni in `database/README.md`
5. Avvia il backend: `cd backend && npm start`
6. Avvia il frontend: `cd frontend && npm start`

## 📚 Documentazione

Consulta i README specifici in ogni cartella:

- [Frontend](./frontend/README.md)
- [Backend](./backend/README.md)
- [Database](./database/README.md)
