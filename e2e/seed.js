import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:Shinas@localhost:5432/busticket_test?sslmode=disable';

if (!dbUrl.toLowerCase().includes('test')) {
  console.error('ERROR: Refusing to seed database! DATABASE_URL must contain "test". Received:', dbUrl);
  process.exit(1);
}

console.log('Seeding test database using Go seed runner...');
const backendDir = process.env.BACKEND_DIR || (
  fs.existsSync(path.resolve(__dirname, '../../TicketDot'))
    ? path.resolve(__dirname, '../../TicketDot')
    : path.resolve(__dirname, '../TicketDot')
);

const res = spawnSync('go', ['run', 'cmd/seed/main.go'], {
  cwd: backendDir,
  env: { ...process.env, DATABASE_URL: dbUrl },
  stdio: 'inherit',
});

if (res.status !== 0) {
  console.error('Failed to seed database');
  process.exit(res.status || 1);
}

console.log('Test database seeded successfully.');
