import { SQLQuery } from "../../types/SQLiteTypes";

export const USER_DATA_TABLE_DEFINITIONS: SQLQuery[] = [
    `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        email TEXT,
        avatar BLOB,
        created_at INTEGER NOT NULL,
        updated_at INTEGER DEFAULT NULL
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        theme INTEGER DEFAULT 1,
        font_size INTEGER DEFAULT 2,
        language INTEGER DEFAULT 1,
        is_notifications_active INTEGER DEFAULT 1,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS ref_themes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS ref_font_sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE
    );
    `,
    `
    CREATE TABLE IF NOT EXISTS ref_languages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE
    );
    `,
].map(q => ({query: q}));

export const USER_DATA_DATA_DEFINITIONS: SQLQuery[] = [
    `
    INSERT OR IGNORE INTO ref_themes (code) VALUES 
    ('system'),
    ('light'),
    ('dark')
    `,
    `
    INSERT OR IGNORE INTO ref_font_sizes (code) VALUES 
    ('small'),
    ('medium'),
    ('large')
    `, 
    `
    INSERT OR IGNORE INTO ref_languages (code) VALUES 
    ('en'),
    ('ru')
    `,
].map(q => ({query: q}));
