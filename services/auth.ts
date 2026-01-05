// Define user data structure
export interface UserData {
  id: number;
  email: string;
  username: string;
  password?: string; // Storing plaintext password as per user's request. WARNING: Security Risk.
  balance: number;
  xp: number;
  luckLevel: number;
  autoRollLevel: number;
  multiRollLevel: number;
  goldenTouchLevel: number;
  hasProgrammerSocks: boolean;
  hasDoubleSell: boolean;
  hasMarketBot: boolean;
  forcedRarity: number | null;
  marketMultiplier: number;
  createdAt: Date;
  lastLogin: Date;
  activeCosmetic: string | null;
  ownedCosmetics: string[];
  stats: {
    totalRolls: number;
    totalEarned: number;
    highestRarityIndex: number;
    rebirths: number;
  };
  history: any[]; // Roll history
  is_banned: boolean;
  is_troll: boolean;
  is_admin: boolean;
}

// Create or get user data
export const createUserIfNotExists = async (email: string, username: string, password?: string): Promise<UserData> => {
  // Import database functions dynamically to avoid server-side issues
  const dbModule = await import('../lib/database-sqlite');

  // Try to get existing user
  const existingUser = await dbModule.getUserByEmail(email);

  if (existingUser) {
    // Update last login
    await dbModule.updateUserData(existingUser.id, { last_login: new Date() });

    // Convert database user to UserData format
    return convertDbUserToUserData(existingUser);
  } else {
    // Create new user with default data
    const newUser = await dbModule.createUser({
      email,
      username,
      password,
    });

    // Convert to UserData format
    return convertDbUserToUserData(newUser);
  }
};

// Get user data
export const getUserData = async (id: number): Promise<UserData | null> => {
  const dbModule = await import('../lib/database-sqlite');
  const user = await dbModule.getUserById(id);
  if (!user) return null;

  return convertDbUserToUserData(user);
};

// Update user data
export const updateUserData = async (id: number, data: Partial<UserData>): Promise<void> => {
  const dbModule = await import('../lib/database-sqlite');

  // Convert UserData properties to database column names
  const dbData: any = {};
  for (const [key, value] of Object.entries(data)) {
    switch (key) {
      case 'luckLevel':
        dbData.luck_level = value;
        break;
      case 'autoRollLevel':
        dbData.auto_roll_level = value;
        break;
      case 'multiRollLevel':
        dbData.multi_roll_level = value;
        break;
      case 'goldenTouchLevel':
        dbData.golden_touch_level = value;
        break;
      case 'hasProgrammerSocks':
        dbData.has_programmer_socks = value;
        break;
      case 'hasDoubleSell':
        dbData.has_double_sell = value;
        break;
      case 'hasMarketBot':
        dbData.has_market_bot = value;
        break;
      case 'forcedRarity':
        dbData.forced_rarity = value;
        break;
      case 'marketMultiplier':
        dbData.market_multiplier = value;
        break;
      case 'activeCosmetic':
        dbData.active_cosmetic = value;
        break;
      case 'ownedCosmetics':
        dbData.owned_cosmetics = Array.isArray(value) ? JSON.stringify(value) : value;
        break;
      case 'stats':
        if (value && typeof value === 'object' && value !== null) {
          dbData.stats_total_rolls = (value as any).totalRolls;
          dbData.stats_total_earned = (value as any).totalEarned;
          dbData.stats_highest_rarity_index = (value as any).highestRarityIndex;
          dbData.stats_rebirths = (value as any).rebirths;
        }
        break;
      case 'history':
        dbData.history = Array.isArray(value) ? JSON.stringify(value) : value;
        break;
      case 'is_banned':
        dbData.is_banned = value;
        break;
      case 'is_troll':
        dbData.is_troll = value;
        break;
      case 'is_admin':
        dbData.is_admin = value;
        break;
      case 'balance':
      case 'xp':
      case 'password': // Include password for update
        dbData[key] = value;
        break;
      default:
        break;
    }
  }

  await dbModule.updateUserData(id, dbData);
};

// Convert database user to UserData format
export const convertDbUserToUserData = (dbUser: any): UserData => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    username: dbUser.username,
    password: dbUser.password, // Include password
    balance: parseFloat(dbUser.balance) || 1000,
    xp: dbUser.xp || 0,
    luckLevel: dbUser.luck_level || 0,
    autoRollLevel: dbUser.auto_roll_level || 0,
    multiRollLevel: dbUser.multi_roll_level || 0,
    goldenTouchLevel: dbUser.golden_touch_level || 0,
    hasProgrammerSocks: Boolean(dbUser.has_programmer_socks),
    hasDoubleSell: Boolean(dbUser.has_double_sell),
    hasMarketBot: Boolean(dbUser.has_market_bot),
    forcedRarity: dbUser.forced_rarity || null,
    marketMultiplier: parseFloat(dbUser.market_multiplier) || 1.0,
    createdAt: new Date(dbUser.created_at),
    lastLogin: new Date(dbUser.last_login),
    activeCosmetic: dbUser.active_cosmetic || null,
    ownedCosmetics: typeof dbUser.owned_cosmetics === 'string' ? JSON.parse(dbUser.owned_cosmetics) : dbUser.owned_cosmetics || [],
    stats: {
      totalRolls: dbUser.stats_total_rolls || 0,
      totalEarned: parseFloat(dbUser.stats_total_earned) || 0,
      highestRarityIndex: dbUser.stats_highest_rarity_index || -1,
      rebirths: dbUser.stats_rebirths || 0,
    },
    history: typeof dbUser.history === 'string' ? JSON.parse(dbUser.history) : dbUser.history || [],
    is_banned: Boolean(dbUser.is_banned),
    is_troll: Boolean(dbUser.is_troll),
    is_admin: Boolean(dbUser.is_admin),
  };
};

// Check if email already exists
export const checkUserExistsByEmail = async (email: string): Promise<boolean> => {
  const dbModule = await import('../lib/database-sqlite');
  return await dbModule.checkEmailExists(email);
};

// Check if user is a troll
export const isUserTroll = async (id: number): Promise<boolean> => {
  const userData = await getUserData(id);
  return userData ? userData.is_troll : false;
};

// Check if user is banned
export const isUserBanned = async (id: number): Promise<boolean> => {
  const userData = await getUserData(id);
  return userData ? userData.is_banned : false;
};