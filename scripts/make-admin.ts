#!/usr/bin/env tsx

import { db } from '@/lib/database-sqlite';

async function makeUserAdmin(username: string) {
  try {
    // Update the user to set is_admin to true using SQLite
    const stmt = db.prepare('UPDATE userdb SET is_admin = 1 WHERE username = ?');
    const result = stmt.run(username);

    // Check if any rows were affected
    if (result.changes > 0) {
      console.log(`✅ User "${username}" has been made an admin successfully!`);
    } else {
      console.log(`❌ User "${username}" was not found in the database.`);
    }
  } catch (error) {
    console.error('❌ Error making user admin:', error);
    console.log('\n💡 To make a user an admin:');
    console.log('1. Make sure the SQLite database file exists');
    console.log('2. Verify your database file path');
    console.log('3. Run this SQL command in your SQLite client:');
    console.log(`   UPDATE userdb SET is_admin = 1 WHERE username = "${username}";`);
  }
}

// Get username from command line arguments
const username = process.argv[2];

if (!username) {
  console.log('Usage: npm run make-admin <username>');
  console.log('Example: npm run make-admin jgrt4g');
  process.exit(1);
}

console.log(`Attempting to make user "${username}" an admin...`);
makeUserAdmin(username);