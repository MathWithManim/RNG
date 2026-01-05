import Database from 'better-sqlite3';

// Create database in the project root
const db = new Database('db.sqlite');

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Create userdb table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS userdb (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    balance REAL DEFAULT 1000.00,
    xp INTEGER DEFAULT 0,
    luck_level INTEGER DEFAULT 0,
    auto_roll_level INTEGER DEFAULT 0,
    multi_roll_level INTEGER DEFAULT 0,
    golden_touch_level INTEGER DEFAULT 0,
    has_programmer_socks BOOLEAN DEFAULT 0,
    has_double_sell BOOLEAN DEFAULT 0,
    has_market_bot BOOLEAN DEFAULT 0,
    forced_rarity INTEGER DEFAULT NULL,
    market_multiplier REAL DEFAULT 1.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
    active_cosmetic TEXT DEFAULT NULL,
    owned_cosmetics TEXT DEFAULT '[]',
    stats_total_rolls INTEGER DEFAULT 0,
    stats_total_earned REAL DEFAULT 0.00,
    stats_highest_rarity_index INTEGER DEFAULT -1,
    stats_rebirths INTEGER DEFAULT 0,
    history TEXT DEFAULT '[]',
    is_banned BOOLEAN DEFAULT 0,
    is_troll BOOLEAN DEFAULT 0,
    is_admin BOOLEAN DEFAULT 0
  )
`);

// Prepare statements for better performance and security
const statements = {
  checkEmailExists: db.prepare('SELECT id FROM userdb WHERE email = ?'),
  createUser: db.prepare(`
    INSERT INTO userdb (email, username, password)
    VALUES (@email, @username, @password)
  `),
  getUserByEmailWithPassword: db.prepare('SELECT * FROM userdb WHERE email = ?'),
  getUserByEmail: db.prepare(`
    SELECT id, email, username, balance, xp, luck_level, auto_roll_level, multi_roll_level,
           golden_touch_level, has_programmer_socks, has_double_sell, has_market_bot,
           forced_rarity, market_multiplier, created_at, last_login, active_cosmetic,
           owned_cosmetics, stats_total_rolls, stats_total_earned, stats_highest_rarity_index,
           stats_rebirths, history, is_banned, is_troll, is_admin
    FROM userdb WHERE email = ?
  `),
  getUserById: db.prepare(`
    SELECT id, email, username, balance, xp, luck_level, auto_roll_level, multi_roll_level,
           golden_touch_level, has_programmer_socks, has_double_sell, has_market_bot,
           forced_rarity, market_multiplier, created_at, last_login, active_cosmetic,
           owned_cosmetics, stats_total_rolls, stats_total_earned, stats_highest_rarity_index,
           stats_rebirths, history, is_banned, is_troll, is_admin
    FROM userdb WHERE id = ?
  `),
  updateUserData: db.prepare(`
    UPDATE userdb SET
      balance = COALESCE(@balance, balance),
      xp = COALESCE(@xp, xp),
      luck_level = COALESCE(@luck_level, luck_level),
      auto_roll_level = COALESCE(@auto_roll_level, auto_roll_level),
      multi_roll_level = COALESCE(@multi_roll_level, multi_roll_level),
      golden_touch_level = COALESCE(@golden_touch_level, golden_touch_level),
      has_programmer_socks = COALESCE(@has_programmer_socks, has_programmer_socks),
      has_double_sell = COALESCE(@has_double_sell, has_double_sell),
      has_market_bot = COALESCE(@has_market_bot, has_market_bot),
      forced_rarity = COALESCE(@forced_rarity, forced_rarity),
      market_multiplier = COALESCE(@market_multiplier, market_multiplier),
      active_cosmetic = COALESCE(@active_cosmetic, active_cosmetic),
      owned_cosmetics = COALESCE(@owned_cosmetics, owned_cosmetics),
      stats_total_rolls = COALESCE(@stats_total_rolls, stats_total_rolls),
      stats_total_earned = COALESCE(@stats_total_earned, stats_total_earned),
      stats_highest_rarity_index = COALESCE(@stats_highest_rarity_index, stats_highest_rarity_index),
      stats_rebirths = COALESCE(@stats_rebirths, stats_rebirths),
      history = COALESCE(@history, history),
      is_banned = COALESCE(@is_banned, is_banned),
      is_troll = COALESCE(@is_troll, is_troll),
      is_admin = COALESCE(@is_admin, is_admin),
      last_login = CURRENT_TIMESTAMP
    WHERE id = @id
  `)
};

// Check if email already exists
export const checkEmailExists = async (email: string): Promise<boolean> => {
  const result = statements.checkEmailExists.get(email);
  return !!result;
};

// Create a new user
export const createUser = async (userData: {
  email: string;
  username: string;
  password?: string;
}): Promise<any> => {
  const userPassword = userData.password || '';

  const info = statements.createUser.run({
    email: userData.email,
    username: userData.username,
    password: userPassword
  });

  // Return the created user (without password)
  const user = getUserById(info.lastInsertRowid as number);
  if (user) {
    delete (user as any).password; // Remove password from returned object
  }
  return user;
};

// Get user by email (including password for login verification)
export const getUserByEmailWithPassword = async (email: string): Promise<any> => {
  return statements.getUserByEmailWithPassword.get(email);
};

// Get user by email (excluding password for general use)
export const getUserByEmail = async (email: string): Promise<any> => {
  return statements.getUserByEmail.get(email);
};

// Get user by ID
export const getUserById = async (id: number): Promise<any> => {
  return statements.getUserById.get(id);
};

// Update user data by numeric ID
export const updateUserData = async (id: number, data: any): Promise<void> => {
  // Prepare the data object for the prepared statement
  const updateData: any = { id };

  // Map the data fields to the corresponding database columns
  for (const [key, value] of Object.entries(data)) {
    if (key === 'id') continue; // Don't update ID

    // Convert camelCase to snake_case for database columns
    const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    updateData[dbKey] = value;
  }

  statements.updateUserData.run(updateData);
};

// Export the db instance for direct access
export { db };