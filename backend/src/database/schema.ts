export const schema = `
  CREATE TABLE IF NOT EXISTS cats (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    balance INTEGER NOT NULL CHECK (balance >= 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS transfers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES cats(id),
    FOREIGN KEY (recipient_id) REFERENCES cats(id),
    CHECK (sender_id <> recipient_id)
  );

  CREATE INDEX IF NOT EXISTS transfers_sender_id_idx ON transfers(sender_id);
  CREATE INDEX IF NOT EXISTS transfers_recipient_id_idx ON transfers(recipient_id);
`;
