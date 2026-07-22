require('dotenv').config();
const mysql = require('mysql2/promise');
const { execSync } = require('child_process');

const dbName = process.env.DB_NAME || 'OpenWork_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '3306');

// Check if docker-compose is available and db container is running
let useDocker = false;
try {
  const path = require('path');
  const rootDir = path.resolve(__dirname, '..', '..');
  const isWindows = process.platform === 'win32';
  const redirect = isWindows ? '2>nul' : '2>/dev/null';
  const dockerPs = execSync(`(docker-compose ps db ${redirect} || docker compose ps db ${redirect})`, { 
    encoding: 'utf8', 
    stdio: 'pipe',
    shell: true,
    cwd: rootDir
  });
  if (dockerPs.includes('Up') || dockerPs.includes('running')) {
    useDocker = true;
  }
} catch (e) {
  // Docker not available or container not running
}

async function dropDatabase() {
  if (useDocker) {
    console.log('Using Docker container...');
    try {
      const path = require('path');
      const rootDir = path.resolve(__dirname, '..', '..');
      execSync(`docker-compose exec -T db mysql -u root -prootpassword -e "DROP DATABASE IF EXISTS ${dbName};"`, { 
        stdio: 'inherit',
        cwd: rootDir,
        shell: true
      });
      console.log(`Database '${dbName}' dropped successfully from Docker container.`);
    } catch (error) {
      console.error('Failed to drop database in Docker:', error.message);
      process.exit(1);
    }
  } else {
    console.log('Using local MySQL...');
    let connection;
    try {
      // Connect without specifying database (connect to MySQL server)
      connection = await mysql.createConnection({
        host: dbHost,
        port: dbPort,
        user: dbUser,
        password: dbPassword
      });

      // Drop database
      await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\`;`);
      console.log(`Database '${dbName}' dropped successfully.`);
    } catch (error) {
      console.error('Failed to drop database:', error.message);
      console.error('Make sure MySQL is running and credentials in .env are correct.');
      process.exit(1);
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}

dropDatabase();
