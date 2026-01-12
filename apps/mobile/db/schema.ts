// SQLite schema for offline storage
export const SCHEMA_VERSION = 1

export const CREATE_TABLES_SQL = `
  -- Offline queue for pending syncs
  CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    action TEXT NOT NULL,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    retries INTEGER DEFAULT 0
  );

  -- Cached quotes
  CREATE TABLE IF NOT EXISTS quotes_cache (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL,
    synced_at INTEGER,
    updated_at INTEGER NOT NULL
  );

  -- Cached clients
  CREATE TABLE IF NOT EXISTS clients_cache (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL,
    synced_at INTEGER,
    updated_at INTEGER NOT NULL
  );

  -- Schema version
  CREATE TABLE IF NOT EXISTS schema_meta (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('version', '${SCHEMA_VERSION}');
`
