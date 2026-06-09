import Database from 'better-sqlite3'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = process.env.ARISE_DB_PATH || join(__dirname, 'arise.db')

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf8')
db.exec(schema)

for (const sql of [
  'ALTER TABLE users ADD COLUMN google_id TEXT',
  'ALTER TABLE users ADD COLUMN email TEXT',
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)',
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
]) {
  try {
    db.exec(sql)
  } catch {
    // column or index already exists
  }
}

export default db