import app from './app';
import { config } from './config';
import db from './config/database';

async function main() {
  // Test database connection
  try {
    await db.raw('SELECT 1');
    console.log('✅ Database connected');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  }

  // Start server
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════╗
║          UniOS Backend API           ║
║──────────────────────────────────────║
║  Environment: ${config.nodeEnv.padEnd(20)}║
║  Port:        ${String(config.port).padEnd(20)}║
║  Version:     0.1.0${' '.repeat(13)}║
╚══════════════════════════════════════╝
    `);
  });
}

main().catch(console.error);