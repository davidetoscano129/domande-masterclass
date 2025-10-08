-- ============================================
-- DATABASE SEMPLIFICATO - FOCUS SU RISPOSTE E CATALOGAZIONE
-- ============================================

-- Step 1: Crea il database (se non esiste già)
CREATE DATABASE IF NOT EXISTS questionari_app 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE questionari_app;

-- Step 2: Elimina tabelle esistenti se presenti
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS compilazioni;
DROP TABLE IF EXISTS questionari;
DROP TABLE IF EXISTS lezioni;
DROP TABLE IF EXISTS utenti;
DROP TABLE IF EXISTS relatori;
SET FOREIGN_KEY_CHECKS = 1;

-- Step 3: Crea le tabelle semplificate

-- Tabella relatori (solo 5, numerati)
CREATE TABLE relatori (
    id INT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella utenti (30 utenti, numerati)
CREATE TABLE utenti (
    id INT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabella lezioni (numerate per semplicità)
CREATE TABLE lezioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(100) NOT NULL,
    descrizione TEXT,
    relatore_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (relatore_id) REFERENCES relatori(id) ON DELETE CASCADE
);

-- Tabella questionari (con domande in JSON per flessibilità)
CREATE TABLE questionari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titolo VARCHAR(200) NOT NULL,
    descrizione TEXT,
    lezione_id INT NOT NULL,
    relatore_id INT NOT NULL,
    domande JSON NOT NULL,
    attivo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (lezione_id) REFERENCES lezioni(id) ON DELETE CASCADE,
    FOREIGN KEY (relatore_id) REFERENCES relatori(id) ON DELETE CASCADE
);

-- Tabella compilazioni (FOCUS PRINCIPALE: salvataggio e catalogazione risposte)
CREATE TABLE compilazioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionario_id INT NOT NULL,
    utente_id INT NOT NULL,
    risposte JSON NOT NULL,           -- Risposte complete in JSON
    completata BOOLEAN DEFAULT FALSE,
    tempo_impiegato INT,              -- Tempo in secondi (utile per analisi)
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (questionario_id) REFERENCES questionari(id) ON DELETE CASCADE,
    FOREIGN KEY (utente_id) REFERENCES utenti(id) ON DELETE CASCADE,
    UNIQUE KEY unique_compilazione (questionario_id, utente_id),
    -- Indici per catalogazione efficiente
    INDEX idx_questionario (questionario_id),
    INDEX idx_utente (utente_id),
    INDEX idx_data (submitted_at)
);

-- Step 4: Inserisci i 5 relatori (nomenclatura semplice)
INSERT INTO relatori (id, nome) VALUES 
(1, 'Relatore 1'),
(2, 'Relatore 2'),
(3, 'Relatore 3'),
(4, 'Relatore 4'),
(5, 'Relatore 5');

-- Step 5: Inserisci i 30 utenti (nomenclatura semplice)
INSERT INTO utenti (id, nome) VALUES 
(1, 'Utente 1'), (2, 'Utente 2'), (3, 'Utente 3'), (4, 'Utente 4'), (5, 'Utente 5'),
(6, 'Utente 6'), (7, 'Utente 7'), (8, 'Utente 8'), (9, 'Utente 9'), (10, 'Utente 10'),
(11, 'Utente 11'), (12, 'Utente 12'), (13, 'Utente 13'), (14, 'Utente 14'), (15, 'Utente 15'),
(16, 'Utente 16'), (17, 'Utente 17'), (18, 'Utente 18'), (19, 'Utente 19'), (20, 'Utente 20'),
(21, 'Utente 21'), (22, 'Utente 22'), (23, 'Utente 23'), (24, 'Utente 24'), (25, 'Utente 25'),
(26, 'Utente 26'), (27, 'Utente 27'), (28, 'Utente 28'), (29, 'Utente 29'), (30, 'Utente 30');

-- Step 6: Inserisci lezioni (nomenclatura semplice)
INSERT INTO lezioni (titolo, descrizione, relatore_id) VALUES 
('Lezione 1', 'Prima lezione del corso', 1),
('Lezione 2', 'Seconda lezione del corso', 2),
('Lezione 3', 'Terza lezione del corso', 3),
('Lezione 4', 'Quarta lezione del corso', 4),
('Lezione 5', 'Quinta lezione del corso', 5),
('Lezione 6', 'Sesta lezione del corso', 1),
('Lezione 7', 'Settima lezione del corso', 2);

-- Step 7: Inserisci questionari di esempio con focus su catalogazione risposte
INSERT INTO questionari (titolo, descrizione, lezione_id, relatore_id, domande) VALUES 
(
    'Questionario Lezione 1',
    'Valutazione della prima lezione',
    1, 1,
    JSON_OBJECT(
        'questions', JSON_ARRAY(
            JSON_OBJECT('id', 1, 'type', 'multiple_choice', 'question', 'Come valuti questa lezione?', 'required', true, 'options', JSON_ARRAY('Ottima', 'Buona', 'Sufficiente', 'Scarsa')),
            JSON_OBJECT('id', 2, 'type', 'rating', 'question', 'Voto da 1 a 10', 'required', true, 'min', 1, 'max', 10),
            JSON_OBJECT('id', 3, 'type', 'textarea', 'question', 'Commenti aggiuntivi', 'required', false)
        )
    )
),
(
    'Questionario Lezione 2', 
    'Valutazione della seconda lezione',
    2, 2,
    JSON_OBJECT(
        'questions', JSON_ARRAY(
            JSON_OBJECT('id', 1, 'type', 'checkbox', 'question', 'Quali argomenti hai trovato interessanti?', 'required', true, 'options', JSON_ARRAY('Teoria', 'Esempi pratici', 'Esercizi', 'Discussione')),
            JSON_OBJECT('id', 2, 'type', 'number', 'question', 'Quante ore hai dedicato allo studio?', 'required', true),
            JSON_OBJECT('id', 3, 'type', 'text', 'question', 'Cosa miglioreresti?', 'required', false)
        )
    )
);

-- Step 8: Inserisci alcune risposte di esempio per testare la catalogazione
INSERT INTO compilazioni (questionario_id, utente_id, risposte, completata, tempo_impiegato) VALUES 
(1, 1, JSON_OBJECT('1', 'Ottima', '2', 9, '3', 'Lezione molto chiara e ben strutturata'), true, 180),
(1, 2, JSON_OBJECT('1', 'Buona', '2', 7, '3', 'Interessante ma un po veloce'), true, 150),
(1, 3, JSON_OBJECT('1', 'Ottima', '2', 10, '3', 'Perfetta, complimenti!'), true, 120),
(2, 1, JSON_OBJECT('1', JSON_ARRAY('Teoria', 'Esempi pratici'), '2', 3, '3', 'Più esercizi pratici'), true, 200),
(2, 4, JSON_OBJECT('1', JSON_ARRAY('Esempi pratici', 'Discussione'), '2', 2, '3', ''), true, 160);

-- Step 9: Crea viste per catalogazione rapida delle risposte

-- Vista: Risposte per questionario (chi ha risposto a cosa)
CREATE VIEW risposte_per_questionario AS
SELECT 
    q.id as questionario_id,
    q.titolo as questionario,
    l.titolo as lezione,
    r.nome as relatore,
    u.nome as utente,
    c.risposte,
    c.completata,
    c.submitted_at,
    c.tempo_impiegato
FROM compilazioni c
JOIN questionari q ON c.questionario_id = q.id
JOIN lezioni l ON q.lezione_id = l.id
JOIN relatori r ON q.relatore_id = r.id
JOIN utenti u ON c.utente_id = u.id
ORDER BY q.id, u.id;

-- Vista: Risposte per utente (come ha risposto ai diversi questionari)
CREATE VIEW risposte_per_utente AS
SELECT 
    u.id as utente_id,
    u.nome as utente,
    q.titolo as questionario,
    l.titolo as lezione,
    r.nome as relatore,
    c.risposte,
    c.completata,
    c.submitted_at,
    c.tempo_impiegato
FROM utenti u
LEFT JOIN compilazioni c ON u.id = c.utente_id
LEFT JOIN questionari q ON c.questionario_id = q.id
LEFT JOIN lezioni l ON q.lezione_id = l.id
LEFT JOIN relatori r ON q.relatore_id = r.id
ORDER BY u.id, c.submitted_at;

-- Step 10: Statistiche e verifica
SELECT 'Database creato con successo!' as status;
SELECT COUNT(*) as relatori FROM relatori;
SELECT COUNT(*) as utenti FROM utenti;
SELECT COUNT(*) as lezioni FROM lezioni;
SELECT COUNT(*) as questionari FROM questionari;
SELECT COUNT(*) as compilazioni FROM compilazioni;