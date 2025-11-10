/**
 * Migration script to fix foreign key constraints
 */

import pool from "./pool";

async function fixForeignKeyConstraints() {
  const client = await pool.connect();

  try {
    console.log("🔧 Fixing foreign key constraints...\n");

    // Drop the existing constraint
    console.log("Dropping old api_usage foreign key constraint...");
    await client.query(`
      ALTER TABLE api_usage 
      DROP CONSTRAINT IF EXISTS api_usage_api_id_fkey;
    `);
    console.log("✓ Old constraint dropped\n");

    // Add the new constraint with CASCADE
    console.log("Adding new foreign key constraint with CASCADE...");
    await client.query(`
      ALTER TABLE api_usage 
      ADD CONSTRAINT api_usage_api_id_fkey 
      FOREIGN KEY (api_id) 
      REFERENCES api_listings(id) 
      ON DELETE CASCADE;
    `);
    console.log("✓ New constraint added\n");

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixForeignKeyConstraints()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
