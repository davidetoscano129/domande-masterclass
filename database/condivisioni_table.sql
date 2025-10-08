-- Tabella per gestire le condivisioni dei questionari
CREATE TABLE IF NOT EXISTS condivisioni (
    id INT AUTO_INCREMENT PRIMARY KEY,
    questionario_id INT NOT NULL,
    relatore_id INT NOT NULL,
    share_token VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NULL,
    FOREIGN KEY (questionario_id) REFERENCES questionari(id) ON DELETE CASCADE,
    FOREIGN KEY (relatore_id) REFERENCES relatori(id) ON DELETE CASCADE,
    UNIQUE KEY unique_questionario_relatore (questionario_id, relatore_id)
);
-- Indice per ottimizzare le ricerche per token
CREATE INDEX idx_share_token ON condivisioni(share_token);
CREATE INDEX idx_expires_at ON condivisioni(expires_at);