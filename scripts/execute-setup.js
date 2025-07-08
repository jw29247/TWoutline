const { execSync } = require('child_process');
const fs = require('fs');

// Read the generated SQL
const sql = fs.readFileSync('scripts/setup-generated.sql', 'utf8');

// Create a temporary file with the SQL wrapped in a Node.js script
const nodeScript = `
const { Client } = require('pg');

async function runSetup() {
  const client = new Client({
    host: 'gondola.proxy.rlwy.net',
    port: 29588,
    database: 'railway',
    user: 'postgres',
    password: 'lMMWSVAkVeiFvtDygibCnaazavyDpOns',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to database\\n');
    
    const queries = \`${sql.replace(/`/g, '\\`')}\`.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        try {
          console.log('Executing:', query.trim().substring(0, 50) + '...');
          const result = await client.query(query);
          if (result.rows && result.rows.length > 0) {
            console.log('Result:', result.rows);
          }
        } catch (err) {
          console.error('Query error:', err.message);
        }
      }
    }
    
    console.log('\\n✅ Setup complete!');
    console.log('\\nYou can now sign in at: https://outline.workshub.agency/auth/google');
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await client.end();
  }
}

runSetup();
`;

// Write the temporary script
fs.writeFileSync('scripts/temp-setup.js', nodeScript);

// Check if pg is installed globally or locally
try {
  execSync('npm list pg', { stdio: 'ignore' });
  console.log('Using local pg module');
} catch {
  console.log('Installing pg module temporarily...');
  execSync('npm install pg', { stdio: 'inherit' });
}

// Run the script
console.log('Executing database setup...\n');
execSync('node scripts/temp-setup.js', { stdio: 'inherit' });

// Clean up
fs.unlinkSync('scripts/temp-setup.js');