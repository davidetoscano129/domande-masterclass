-- Migration per aggiungere funzionalità di condivisione
-- Eseguire questo script per aggiornare il database esistente

USE questionari_app;

-- Aggiungi le nuove colonne alla tabella questionnaires
ALTER TABLE questionnaires 
ADD COLUMN share_token VARCHAR(64) UNIQUE NULL,
ADD COLUMN is_public BOOLEAN DEFAULT FALSE;

-- Indice per migliorare le performance di ricerca per token
CREATE INDEX idx_questionnaires_share_token ON questionnaires(share_token);