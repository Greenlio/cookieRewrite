const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./cookies.db');

db.serialize(() => {
    db.run('CREATE TABLE IF NOT EXISTS economy (user_id TEXT PRIMARY KEY, cookies INTEGER DEFAULT 0)');
    db.run('CREATE TABLE IF NOT EXISTS last_guess (user_id TEXT PRIMARY KEY, cookies INTEGER DEFAULT 0)');
    db.run('CREATE TABLE IF NOT EXISTS banned_users ( user_id TEXT PRIMARY KEY )');
    db.run('CREATE TABLE IF NOT EXISTS message_counts (user_id TEXT PRIMARY KEY, count INTEGER DEFAULT 0)');
});

db.close();