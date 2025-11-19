import { SQLQuery } from "../../types/SQLiteTypes";

export const tables: SQLQuery[] = [
    `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        avatar BLOB,
        extra TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
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
        extra TEXT,
        created_at INTEGER NOT NULL DEFAULT (strftime('%s','now')),
        updated_at INTEGER DEFAULT NULL,
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

export const data: SQLQuery[] = [
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
    `
    INSERT OR IGNORE INTO users (id, user_id, username, avatar, extra, created_at, updated_at) VALUES 
    (0, 'default', 'User', NULL, NULL, strftime('%s','now'), NULL)
    `,
    `
    INSERT OR IGNORE INTO user_settings (user_id, theme, font_size, language, is_notifications_active, created_at, updated_at) VALUES 
    (0, 1, 2, 1, 1, strftime('%s','now'), NULL)
    `,
].map(q => ({query: q}));
