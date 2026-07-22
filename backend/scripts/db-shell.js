require('dotenv').config();
const { execSync, spawn } = require('child_process');

const dbName = process.env.DB_NAME || 'OpenWork_db';
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD || '';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || '3306';

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

if (useDocker) {
  console.log('Connecting to Docker container...');
  const path = require('path');
  const rootDir = path.resolve(__dirname, '..', '..');
  const proc = spawn('docker-compose', ['exec', 'db', 'mysql', '-u', 'root', '-prootpassword', dbName], { 
    stdio: 'inherit', 
    shell: true,
    cwd: rootDir
  });
  proc.on('error', (err) => {
    console.error('Error connecting to Docker:', err.message);
    process.exit(1);
  });
} else {
  console.log('Connecting to local MySQL...');
  console.log('Note: This requires MySQL CLI to be installed and in your PATH.');
  console.log('If you don\'t have MySQL CLI, you can use Docker or a MySQL client like MySQL Workbench.');
  console.log('');
  
  const args = ['-u', dbUser];
  if (dbPassword) {
    args.push(`-p${dbPassword}`);
  }
  args.push('-h', dbHost, '-P', dbPort, dbName);
  
  const proc = spawn('mysql', args, { stdio: 'inherit', shell: true });
  proc.on('error', (err) => {
    console.error('Error connecting to MySQL:', err.message);
    console.error('Make sure MySQL CLI is installed and in your PATH.');
    console.error('Alternatively, use Docker: docker-compose up -d');
    process.exit(1);
  });
}
