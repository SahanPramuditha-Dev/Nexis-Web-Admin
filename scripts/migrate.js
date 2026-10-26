import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not defined in .env');
  process.exit(1);
}

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully.');

    const schemaPath = path.resolve(__dirname, '../database/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema.sql...');
    await client.query(sql);
    console.log('Schema migration applied successfully!');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public';
    `);
    console.log('Public tables in database:', res.rows.map(r => r.table_name));

  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigration();
