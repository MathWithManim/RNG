import { NextRequest } from 'next/server';
import { getSession } from '@/services/auth-client';
import { getUserData, convertDbUserToUserData, updateUserData, checkUserExistsByEmail } from '@/services/auth'; // Import convertDbUserToUserData, and updateUserData
import type { UserData } from '@/services/auth'; // Import UserData as a type

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map();

// Enhanced admin API with additional security measures
export async function POST(request: NextRequest) {
  try {
    // Rate limiting using environment variables
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitKey = `admin_${clientIP}`;

    const now = Date.now();
    const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '300000'); // 5 minutes default
    const maxRequests = parseInt(process.env.RATE_LIMIT_MAX || '50'); // 50 requests default

    const record = rateLimitStore.get(rateLimitKey) || { count: 0, resetTime: now + windowMs };

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
    } else {
      record.count++;
      if (record.count > maxRequests) {
        return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
      }
    }

    rateLimitStore.set(rateLimitKey, record);

    // Additional security: Check for suspicious headers
    const userAgent = request.headers.get('user-agent');
    if (!userAgent || userAgent.includes('bot') || userAgent.includes('crawler')) {
      console.warn(`Suspicious request blocked from IP: ${clientIP}`);
      return Response.json({ error: 'Unauthorized request' }, { status: 401 });
    }

    // Admin authentication check
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return Response.json({ error: 'Unauthorized: Missing user ID' }, { status: 401 });
    }

    const id = parseInt(userId);
    if (isNaN(id)) {
      return Response.json({ error: 'Unauthorized: Invalid user ID format' }, { status: 401 });
    }

    // Verify session is still valid
    const session = getSession();
    if (!session || session.id !== id) {
      return Response.json({ error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    const user = await getUserData(id);

    if (!user || !user.is_admin) {
      return Response.json({ error: 'Unauthorized: Not an admin' }, { status: 401 });
    }

    // Validate request body to prevent injection attacks
    const rawBody = await request.text();
    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch (e) {
      return Response.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    // Validate action parameter
    const { action, ...params } = parsedBody;
    if (!action || typeof action !== 'string') {
      return Response.json({ error: 'Action parameter is required and must be a string' }, { status: 400 });
    }

    // Validate parameters to prevent injection
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // Basic validation to prevent SQL injection attempts
        if (value.includes("'") || value.includes('"') || value.includes(';') || value.includes('--') ||
            value.toLowerCase().includes('drop ') || value.toLowerCase().includes('delete ') ||
            value.toLowerCase().includes('insert ') || value.toLowerCase().includes('update ')) {
          console.warn(`Potential injection attempt detected from IP: ${clientIP}`, { key, value });
          return Response.json({ error: 'Invalid parameter detected' }, { status: 400 });
        }

        // Additional validation: limit string length to prevent buffer overflow
        if (value.length > 1000) {
          console.warn(`Parameter too long detected from IP: ${clientIP}`, { key, length: value.length });
          return Response.json({ error: 'Parameter too long' }, { status: 400 });
        }
      }

      // Validate numeric values
      if (typeof value === 'number') {
        // Check for reasonable bounds
        if (value > Number.MAX_SAFE_INTEGER || value < Number.MIN_SAFE_INTEGER) {
          console.warn(`Invalid numeric value detected from IP: ${clientIP}`, { key, value });
          return Response.json({ error: 'Invalid numeric parameter' }, { status: 400 });
        }
      }
    }

    // Log admin actions for audit trail
    console.log(`Admin action: ${action} by user ID: ${id}`, params);

    switch (action) {
      // Global actions (for now, will be removed or made user-specific later if needed)
      case 'applyGlobalMultiplier':
        return await handleGlobalMultiplier(params.multiplier);
      case 'giveFreeCurrency':
        return await handleGiveFreeCurrency(params.amount);
      case 'giveFreeXp':
        return await handleGiveFreeXp(params.amount);

      // User-specific actions (Economy)
      case 'setIndividualMultiplier':
        return await handleSetIndividualMultiplier(params.username, params.multiplier);
      case 'giveIndividualCurrency':
        return await handleGiveIndividualCurrency(params.username, params.amount);
      case 'giveIndividualXp':
        return await handleGiveIndividualXp(params.username, params.amount);

      // User-specific actions (User Management)
      case 'impersonateUser':
        return await handleImpersonateUser(params.username);
      case 'deleteUser':
        return await handleDeleteUser(params.username);
      case 'banUser':
        return await handleBanUser(params.username);
      case 'kickUser':
        return await handleKickUser(params.username);
      case 'trollUser':
        return await handleTrollUser(params.username);
      case 'makeAdmin':
        return await handleMakeAdmin(params.username);

      // Database actions
      case 'getDatabaseTable':
        return await handleGetDatabaseTable(params.tableName);
      case 'executeSqlQuery':
        return await handleExecuteSqlQuery(params.query);

      // Test actions
      case 'testUserEconomy':
        return await handleTestUserEconomy(params.username);
      case 'testUserPowers':
        return await handleTestUserPowers(params.username);
      case 'testUserQuests':
        return await handleTestUserQuests(params.username);
      case 'resetUserData':
        return await handleResetUserData(params.username);

      default:
        return Response.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Admin API error:', error);
    console.error('Error stack:', error.stack); // Log the stack trace
    return Response.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

async function handleGlobalMultiplier(multiplier: number) {
  // In a real implementation, this would update a global setting in the database
  // For now, we'll just return success
  console.log(`Setting global multiplier to ${multiplier}`);
  return Response.json({ success: true, message: `Global multiplier set to ${multiplier}x` });
}

async function handleGiveFreeCurrency(amount: number) {
  // In a real implementation, this would add currency to all users in the database
  // For now, we'll just return success
  console.log(`Giving ${amount} currency to all users`);
  return Response.json({ success: true, message: `Gave ${amount} currency to all users` });
}

async function handleGiveFreeXp(amount: number) {
  // In a real implementation, this would add XP to all users in the database
  // For now, we'll just return success
  console.log(`Giving ${amount} XP to all users`);
  return Response.json({ success: true, message: `Gave ${amount} XP to all users` });
}

// Helper to get user by username
async function getUserByUsername(username: string): Promise<UserData | null> {
  const dbModule = await import('@/lib/database-sqlite');
  const stmt = dbModule.db.prepare('SELECT * FROM userdb WHERE username = ?');
  const user = stmt.get(username);

  if (user) {
    delete (user as any).password; // Remove password before returning
    return convertDbUserToUserData(user);
  }
  return null;
}

// --- User-specific Economy Handlers ---

async function handleSetIndividualMultiplier(username: string, multiplier: number) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  await updateUserData(user.id, { marketMultiplier: multiplier });
  console.log(`Set market multiplier for ${username} to ${multiplier}x`);
  return Response.json({ success: true, message: `Set market multiplier for ${username} to ${multiplier}x` });
}

async function handleGiveIndividualCurrency(username: string, amount: number) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  await updateUserData(user.id, { balance: user.balance + amount });
  console.log(`Gave ${amount} currency to ${username}`);
  return Response.json({ success: true, message: `Gave ${amount} currency to ${username}` });
}

async function handleGiveIndividualXp(username: string, amount: number) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  await updateUserData(user.id, { xp: user.xp + amount });
  console.log(`Gave ${amount} XP to ${username}`);
  return Response.json({ success: true, message: `Gave ${amount} XP to ${username}` });
}

// --- User-specific User Management Handlers ---

async function handleImpersonateUser(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  // Impersonation logic would typically involve setting a session token
  // on the client-side for the admin. For this API, we just confirm.
  return Response.json({ success: true, message: `Impersonation initiated for ${username}` });
}

async function handleDeleteUser(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  // In a real scenario, this would delete the user from the database.
  // For now, we'll just log and return success.
  console.log(`Deleting user ${username}`);
  return Response.json({ success: true, message: `User ${username} deleted` });
}

async function handleBanUser(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  await updateUserData(user.id, { is_banned: true });
  console.log(`Banned user ${username}`);
  return Response.json({ success: true, message: `User ${username} banned` });
}

async function handleKickUser(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  // Kicking a user would typically involve invalidating their session
  // or forcing a re-login. For this API, we just confirm.
  return Response.json({ success: true, message: `User ${username} kicked` });
}

async function handleTrollUser(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  await updateUserData(user.id, { is_troll: !user.is_troll }); // Toggle troll status
  console.log(`Toggled troll status for ${username} to ${!user.is_troll}`);
  return Response.json({ success: true, message: `Toggled troll status for ${username}` });
}

async function handleMakeAdmin(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  // Update the user's admin status in the database
  await updateUserData(user.id, { is_admin: true });
  console.log(`Made user ${username} admin`);
  return Response.json({ success: true, message: `User ${username} made admin` });
}

// --- Database Management Handlers ---

async function handleGetDatabaseTable(tableName: string) {
  // Validate table name to prevent SQL injection
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tableName)) {
    return Response.json({ success: false, error: 'Invalid table name' }, { status: 400 });
  }

  // Additional security: Only allow specific tables to be viewed
  const allowedTables = ['userdb']; // Add other allowed tables as needed
  if (!allowedTables.includes(tableName)) {
    console.warn(`Unauthorized table access attempt: ${tableName}`);
    return Response.json({ success: false, error: 'Table access not permitted' }, { status: 403 });
  }

  const dbModule = await import('@/lib/database-sqlite');
  try {
    const sqlQuery = `SELECT * FROM \`${tableName}\` LIMIT 100`;
    console.log(`Executing SQL query: ${sqlQuery}`); // Debug log
    const stmt = dbModule.db.prepare(sqlQuery);
    const rows = stmt.all();
    return Response.json({ success: true, data: rows });
  } catch (error: any) {
    console.error(`Error getting table ${tableName}:`, error);
    return Response.json({ success: false, error: error.message || 'Failed to get table data' }, { status: 500 });
  }
}

async function handleExecuteSqlQuery(query: string) {
  // Enhanced SQL injection prevention
  const trimmedQuery = query.trim();

  // Convert to lowercase for pattern matching
  const lowerQuery = trimmedQuery.toLowerCase();

  // Only allow SELECT statements
  if (!lowerQuery.startsWith('select ')) {
    return Response.json({ success: false, error: 'Only SELECT queries are allowed' }, { status: 400 });
  }

  // Additional security: Check for potentially dangerous patterns
  const dangerousPatterns = [
    'drop ', 'delete ', 'insert ', 'update ', 'create ', 'alter ', 'truncate ', 'exec ',
    'execute ', 'xp_', 'sp_', 'union ', 'information_schema', 'mysql.', 'pg_', 'sys.',
    'master..', 'sysobjects', 'syscolumns', 'exec(', 'execute('
  ];

  for (const pattern of dangerousPatterns) {
    if (lowerQuery.includes(pattern)) {
      console.warn(`Potentially dangerous SQL pattern detected: ${pattern}`);
      return Response.json({ success: false, error: 'Query contains forbidden patterns' }, { status: 400 });
    }
  }

  // Additional validation: limit query length
  if (trimmedQuery.length > 2000) {
    return Response.json({ success: false, error: 'Query too long' }, { status: 400 });
  }

  const dbModule = await import('@/lib/database-sqlite');
  try {
    const stmt = dbModule.db.prepare(trimmedQuery);
    const result = stmt.all();
    return Response.json({ success: true, data: result });
  } catch (error: any) {
    console.error(`Error executing query "${trimmedQuery}":`, error);
    return Response.json({ success: false, error: error.message || 'Failed to execute query' }, { status: 500 });
  }
}

// --- Test Function Handlers ---

async function handleTestUserEconomy(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  // Simulate some test actions
  console.log(`Running economy test for ${username}`);
  return Response.json({ success: true, message: `Economy test for ${username} executed (placeholder)` });
}

async function handleTestUserPowers(username: string) {
    const user = await getUserByUsername(username);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    console.log(`Running powers test for ${username}`);
    return Response.json({ success: true, message: `Powers test for ${username} executed (placeholder)` });
  }

  async function handleTestUserQuests(username: string) {
    const user = await getUserByUsername(username);
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    console.log(`Running quests test for ${username}`);
    return Response.json({ success: true, message: `Quests test for ${username} executed (placeholder)` });
  }

  async function handleResetUserData(username: string) {
  const user = await getUserByUsername(username);
  if (!user) {
    return Response.json({ error: 'User not found' }, { status: 404 });
  }
  // This is a dangerous operation. In a real app, it would involve
  // resetting user balance, XP, stats, etc., to default values.
  // For now, we'll just log and return success.
  console.log(`Resetting data for ${username}`);
  return Response.json({ success: true, message: `Data for ${username} reset (placeholder)` });
}