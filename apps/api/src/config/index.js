/**
 * Environment Configuration
 * 
 * Loads and validates all required environment variables.
 * Fails fast if any required variable is missing.
 */

import 'dotenv/config';

// Required environment variables
const requiredVars = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

// Validate required variables
const missing = requiredVars.filter((varName) => !process.env[varName]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach((varName) => console.error(`   - ${varName}`));
  console.error('\nPlease check your .env file or environment configuration.');
  process.exit(1);
}

// Export configuration object
const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },
  
  // CORS
  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000')
      .split(',')
      .map((origin) => origin.trim()),
  },
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'debug',
};

export default config;
