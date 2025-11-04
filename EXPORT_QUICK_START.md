# 🎯 Quick Start - Sistema di Esportazione

## Come Usare il Sistema di Export

### 1. Accedi come Relatore

```
Codice Fiscale: RLTMRA85M10H501A
```

### 2. Clicca su "📊 Esporta Risposte"

Trovi il pulsante nell'header della dashboard, in alto a destra.

### 3. Scegli il Tipo di Export

**Opzione A: Tutte le Risposte**

- Esporta tutto il database
- Perfetto per backup completi

**Opzione B: Per Utente**

- Seleziona un utente dal menu dropdown
- Vedi solo le sue risposte

**Opzione C: Per Questionario**

- Seleziona un questionario specifico
- Analizza un solo questionario

**Opzione D: Per Lezione**

- Seleziona una lezione
- Tutte le risposte dei questionari di quella lezione

### 4. Applica Filtri (Opzionale)

```
Data Inizio: 2025-01-01
Data Fine:   2025-12-31
```

### 5. Scegli il Formato

| Formato      | Quando Usarlo                            |
| ------------ | ---------------------------------------- |
| 📊 **Excel** | Analisi con formule, grafici, pivot      |
| 📄 **CSV**   | Import in Google Sheets, Excel, database |
| 📑 **PDF**   | Stampa, condivisione formale             |
| 📝 **Word**  | Report aziendali, documenti              |
| 💾 **JSON**  | Backup tecnico, API integration          |

### 6. Anteprima

Clicca **"Anteprima Dati"** per vedere:

- Quante risposte verranno esportate
- Quanti utenti coinvolti
- Preview delle prime righe

### 7. Esporta!

Clicca **"Esporta in [FORMATO]"** e il file verrà scaricato.

---

## 📊 Esempi Pratici

### Esempio 1: Report Excel di un Questionario

```
1. Tipo: Per Questionario
2. Seleziona: "2 questionario"
3. Formato: Excel
4. Anteprima → Esporta
```

**Risultato:** File Excel con tutte le risposte del questionario, pronto per analisi.

### Esempio 2: PDF delle Risposte di un Utente

```
1. Tipo: Per Utente
2. Seleziona: "Utente 10"
3. Formato: PDF
4. Anteprima → Esporta
```

**Risultato:** PDF stampabile con le risposte dell'utente.

### Esempio 3: Backup JSON Completo

```
1. Tipo: Tutte le Risposte
2. Formato: JSON
3. Anteprima → Esporta
```

**Risultato:** Backup completo in formato JSON.

### Esempio 4: CSV Filtrato per Date

```
1. Tipo: Tutte le Risposte
2. Data Inizio: 2025-01-01
3. Data Fine: 2025-06-30
4. Formato: CSV
5. Anteprima → Esporta
```

**Risultato:** CSV con risposte del primo semestre.

---

## 🔥 Tips & Tricks

### Per Grandi Dataset

- ✅ Usa **Excel** o **CSV** (nessun limite di righe)
- ⚠️ Evita PDF/Word per dataset > 100 righe

### Per Presentazioni

- ✅ **PDF** è perfetto per meeting e stampe
- ✅ **Word** è ideale per report aziendali

### Per Analisi Dati

- ✅ **Excel** con formule e grafici
- ✅ **CSV** per import in altri tool (R, Python, Tableau)

### Per Backup

- ✅ **JSON** mantiene la struttura originale
- ✅ **CSV** per compatibilità universale

---

## 🐛 Troubleshooting

**Problema:** "Nessun dato da esportare"

- ✓ Verifica che ci siano risposte nel periodo selezionato
- ✓ Controlla i filtri applicati

**Problema:** "Export non parte"

- ✓ Clicca prima su "Anteprima Dati"
- ✓ Verifica la selezione (utente/questionario/lezione)

**Problema:** "File troppo grande"

- ✓ Usa filtri per date
- ✓ Esporta per questionario invece che tutto
- ✓ Scegli CSV invece di Word/PDF

---

## 📚 Risorse

- [Documentazione Completa](./EXPORT_SYSTEM.md)
- [Codici Fiscali Test](./CODICI_FISCALI_TEST.md)

**Versione:** 1.1.0
**Data:** 4 novembre 2025
