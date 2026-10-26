import pg from 'pg';
const { Client } = pg;

async function run() {
  const client = new Client({
    host: 'aws-0-ap-southeast-2.pooler.supabase.com',
    port: 6543,
    user: 'postgres.ffidiwastvtwjdjlujvv',
    password: 'Nexis453993',
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  // Delete the 10 sample rows created at 20:56
  const delRes = await client.query("DELETE FROM telemetry_records WHERE created_at < '2026-10-25 21:00:00+00'");
  console.log('Successfully deleted sample records:', delRes.rowCount);

  // Check remaining rows
  const remaining = await client.query('SELECT id, device_id, carrier_name, download_mbps, created_at FROM telemetry_records');
  console.log('Remaining real tests count:', remaining.rowCount);
  console.table(remaining.rows);

  // Also clean up any sample probe devices if they have 0 submissions left
  await client.query("DELETE FROM probe_devices WHERE device_id NOT IN (SELECT DISTINCT device_id FROM telemetry_records)");

  await client.end();
}

run().catch(console.error);
