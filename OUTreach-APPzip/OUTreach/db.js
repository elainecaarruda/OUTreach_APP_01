import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data.db');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Handle schema migrations
try {
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='evangelismos'`).all();
  if (tables.length > 0) {
    const checkColumn = db.prepare(`PRAGMA table_info(evangelismos)`).all();
    const hasStatusColumn = checkColumn.some(col => col.name === 'status');
    if (!hasStatusColumn) {
      console.log('⚙️ Migrating evangelismos table (adding status column)...');
      db.exec(`
        CREATE TABLE evangelismos_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          evangelismoDate TEXT NOT NULL,
          evangelismoTimeStart TEXT,
          evangelismoTimeEnd TEXT,
          location TEXT,
          status TEXT DEFAULT 'aberto',
          leadersNeeded INTEGER DEFAULT 1,
          evangelists INTEGER DEFAULT 3,
          coordinatorName TEXT,
          coordinatorPhone TEXT,
          leadersNeededText TEXT,
          evangelistsList TEXT,
          intercessorTeam TEXT,
          evangelismoType TEXT,
          materials TEXT,
          emergencyResponsibles TEXT,
          specialCares TEXT,
          followUpNotes TEXT,
          description TEXT,
          additionalNotes TEXT,
          driveFolderId TEXT,
          createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
          updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        );
        INSERT INTO evangelismos_new SELECT *, 'aberto' FROM evangelismos;
        DROP TABLE evangelismos;
        ALTER TABLE evangelismos_new RENAME TO evangelismos;
      `);
      console.log('✅ Migration complete - status column added');
    }
  }

  // Migrate testemunhos table to add bilingual summary columns
  const testemunhosTables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name='testemunhos'`).all();
  if (testemunhosTables.length > 0) {
    const testemunhosColumns = db.prepare(`PRAGMA table_info(testemunhos)`).all();
    const hasSummaryNative = testemunhosColumns.some(col => col.name === 'summaryNative');
    if (!hasSummaryNative) {
      console.log('⚙️ Migrating testemunhos table (adding bilingual summary columns)...');
      db.exec(`
        ALTER TABLE testemunhos ADD COLUMN summaryNative TEXT;
        ALTER TABLE testemunhos ADD COLUMN summaryEnglish TEXT;
        ALTER TABLE testemunhos ADD COLUMN nativeLanguage TEXT DEFAULT 'pt-BR';
        ALTER TABLE testemunhos ADD COLUMN resumoEnglishDocxId TEXT;
      `);
      console.log('✅ Migration complete - bilingual summary columns added');
    }
  }
} catch (err) {
  console.log('ℹ️ Migration check skipped:', err.message);
}

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS evangelismos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    evangelismoDate TEXT NOT NULL,
    evangelismoTimeStart TEXT,
    evangelismoTimeEnd TEXT,
    location TEXT,
    status TEXT DEFAULT 'aberto',
    leadersNeeded INTEGER DEFAULT 1,
    evangelists INTEGER DEFAULT 3,
    coordinatorName TEXT,
    coordinatorPhone TEXT,
    leadersNeededText TEXT,
    evangelistsList TEXT,
    intercessorTeam TEXT,
    evangelismoType TEXT,
    materials TEXT,
    emergencyResponsibles TEXT,
    specialCares TEXT,
    followUpNotes TEXT,
    description TEXT,
    additionalNotes TEXT,
    driveFolderId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS testemunhos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evangelismoId INTEGER NOT NULL,
    title TEXT NOT NULL,
    personalInfo TEXT,
    profileInfo TEXT,
    eventInfo TEXT,
    decisionInfo TEXT,
    summaryText TEXT,
    photosUrls TEXT,
    videosUrls TEXT,
    driveFolderId TEXT,
    resumoDocxId TEXT,
    footshootFolderId TEXT,
    videosFolderId TEXT,
    photosFolderId TEXT,
    summaryNative TEXT,
    summaryEnglish TEXT,
    nativeLanguage TEXT DEFAULT 'pt-BR',
    resumoEnglishDocxId TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evangelismoId) REFERENCES evangelismos(id)
  );

  CREATE TABLE IF NOT EXISTS uploaded_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    testemunhoId INTEGER NOT NULL,
    fileId TEXT,
    fileName TEXT,
    fileType TEXT,
    driveLink TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (testemunhoId) REFERENCES testemunhos(id)
  );

  CREATE TABLE IF NOT EXISTS aplicacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    evangelismoId INTEGER NOT NULL,
    userId TEXT NOT NULL,
    userName TEXT,
    tipo TEXT NOT NULL,
    status TEXT DEFAULT 'pendente',
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (evangelismoId) REFERENCES evangelismos(id)
  );
`);

export default db;
