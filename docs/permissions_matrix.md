# MATRICE PERMESSI - SISTEMA QUESTIONARI v2.0

## 👨‍💼 AMMINISTRATORE

### Gestione Utenti

- ✅ Invitare nuovi relatori (instructor)
- ✅ Disattivare relatori
- ✅ Visualizzare lista tutti relatori
- ✅ Modificare profili relatori

### Gestione Corsi

- ✅ Creare nuovi corsi
- ✅ Modificare qualsiasi corso
- ✅ Eliminare/archiviare corsi
- ✅ Assegnare corsi a relatori

### Gestione Questionari

- ✅ Creare questionari
- ✅ Modificare QUALSIASI questionario
- ✅ Eliminare/archiviare QUALSIASI questionario
- ✅ Visualizzare TUTTI i questionari
- ✅ Condividere questionari
- ✅ Duplicare questionari

### Analisi e Reporting

- ✅ Visualizzare TUTTE le risposte
- ✅ Analytics aggregate su tutto il sistema
- ✅ Statistiche per relatore/corso
- ✅ Storico completo studenti
- ✅ Esportare tutti i dati
- ✅ Dashboard amministrativo

### Gestione Studenti

- ✅ Visualizzare lista tutti studenti
- ✅ Visualizzare storico completo di ogni studente
- ✅ Modificare dati studenti
- ✅ Eliminare studenti (e relative risposte)

---

## 👨‍🏫 RELATORE (INSTRUCTOR)

### Gestione Personale

- ✅ Modificare il proprio profilo
- ✅ Cambiare password
- ❌ Invitare altri utenti

### Gestione Corsi

- ✅ Visualizzare i propri corsi
- ✅ Modificare i propri corsi
- ✅ Creare nuovi corsi (se autorizzato)
- ❌ Modificare corsi di altri relatori

### Gestione Questionari

- ✅ Creare questionari
- ✅ Modificare i PROPRI questionari
- ✅ Eliminare/archiviare i PROPRI questionari
- ✅ Visualizzare TUTTI i questionari (per confronto)
- ✅ Duplicare questionari di altri relatori
- ✅ Condividere i propri questionari
- ❌ Modificare questionari di altri relatori

### Analisi e Reporting

- ✅ Visualizzare risposte ai PROPRI questionari
- ✅ Analytics sui propri questionari/corsi
- ✅ Storico studenti che hanno compilato i propri questionari
- ✅ Esportare dati propri questionari
- ❌ Vedere risposte di questionari di altri relatori

### Gestione Studenti

- ✅ Visualizzare studenti che hanno compilato i propri questionari
- ✅ Visualizzare storico di questi studenti (limitato ai propri questionari)
- ❌ Modificare dati studenti
- ❌ Eliminare studenti

---

## 👨‍🎓 STUDENTE

### Compilazione

- ✅ Compilare questionari tramite link condiviso
- ✅ Salvare risposte parziali (se implementato)
- ✅ Modificare risposte prima dell'invio finale
- ❌ Accedere a questionari senza link

### Identificazione

- ✅ Inserire email per identificazione
- ✅ Inserire matricola (se presente)
- ✅ Aggiornare dati personali durante compilazione
- ❌ Registrarsi autonomamente nel sistema

### Visualizzazione

- ✅ Vedere i propri questionari compilati (se implementato)
- ✅ Storico delle proprie compilazioni (se implementato)
- ❌ Vedere questionari di altri studenti
- ❌ Vedere analytics o statistiche

### Privacy

- ✅ Le proprie risposte sono visibili a relatori/admin
- ❌ Anonimato verso relatori (come richiesto)
- ✅ Tracking completo per analytics

---

## 🔐 REGOLE SPECIFICHE

### Condivisione Questionari

- Solo tramite link con token
- Link validi solo se questionario è attivo
- Nessuna autenticazione richiesta per compilazione
- Identificazione obbligatoria via email/matricola

### Eliminazione/Archiviazione

- Eliminazione = Soft delete (archiviazione)
- Solo admin può fare hard delete
- Risposte conservate anche con questionari archiviati

### Privacy e Sicurezza

- Risposte NON anonime verso relatori
- Storico completo per analytics
- IP tracking per sicurezza
- No audit trail dettagliato

### Analytics

- Admin: tutto il sistema
- Relatori: solo propri questionari
- Studenti: nessuna analytics

---

## 📊 DASHBOARD SPECIFICHE

### Dashboard Admin

- Statistiche sistema completo
- Lista relatori attivi
- Questionari più utilizzati
- Studenti più attivi
- Performance per corso

### Dashboard Relatore

- I miei questionari
- Le mie statistiche
- I miei corsi
- Studenti che hanno risposto
- Confronto con altri questionari (sola visualizzazione)

### Interfaccia Studente

- Solo compilazione questionari
- Eventuale storico personale (da decidere se implementare)
