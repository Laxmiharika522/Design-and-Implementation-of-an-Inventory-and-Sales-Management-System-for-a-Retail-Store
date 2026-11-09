import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Determine whether SSL should be enabled (optimized for AWS RDS and local dev)
const shouldEnableSSL = () => {
  if (process.env.DB_SSL === 'true') return true;
  if (process.env.DB_SSL === 'false') return false;
  
  // Default in production for remote databases (e.g. AWS RDS)
  const isRemoteHost = process.env.DB_HOST && !['localhost', '127.0.0.1'].includes(process.env.DB_HOST.toLowerCase());
  return process.env.NODE_ENV === 'production' && isRemoteHost;
};

const sslConfig = shouldEnableSSL()
  ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' }
  : undefined;

// Support cloud DATABASE_URL / MYSQL_PUBLIC_URL connection string or individual env vars
const connectionUrl = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;

let poolConfig;

if (connectionUrl) {
  const url = new URL(connectionUrl);
  poolConfig = {
    host: url.hostname,
    port: parseInt(url.port || '3306', 10),
    user: url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 20000,
    ssl: sslConfig || { rejectUnauthorized: false }
  };
} else {
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'retail_db',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 20000,
    ssl: sslConfig
  };
}

const pool = mysql.createPool(poolConfig);

export default pool;

