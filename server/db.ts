import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Using v2 db to ensure schema compatibility with UUIDs
const dbPath = path.join(process.cwd(), 'swasthai_v2.db');
const db = new Database(dbPath);

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Supabase UUID
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    age INTEGER,
    gender TEXT,
    height REAL,
    current_weight REAL,
    goal_type TEXT,
    goal_weight REAL,
    target_date TEXT,
    activity_level TEXT,
    daily_calories INTEGER,
    protein_target INTEGER,
    carbs_target INTEGER,
    fat_target INTEGER,
    water_target INTEGER,
    preferred_language TEXT DEFAULT 'en',
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    calories INTEGER DEFAULT 0,
    protein REAL DEFAULT 0,
    carbs REAL DEFAULT 0,
    fat REAL DEFAULT 0,
    water_intake INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS food_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    name TEXT NOT NULL,
    calories INTEGER NOT NULL,
    protein REAL NOT NULL,
    carbs REAL NOT NULL,
    fat REAL NOT NULL,
    grams REAL NOT NULL,
    meal_type TEXT, -- breakfast, lunch, dinner, snack
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS weight_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    weight REAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS nutrition_database (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    calories_per_100g INTEGER NOT NULL,
    protein_per_100g REAL NOT NULL,
    carbs_per_100g REAL NOT NULL,
    fat_per_100g REAL NOT NULL,
    fiber_per_100g REAL DEFAULT 0,
    category TEXT -- e.g., 'Breads', 'Curries', 'Snacks'
  );
`);

export default db;
