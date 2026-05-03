import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// Support Railway's MYSQL_PUBLIC_URL / DATABASE_URL connection string
// Format: mysql://user:password@host:port/database
const connectionUrl = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;

let poolConfig;

if (connectionUrl) {
  const url = new URL(connectionUrl);
  poolConfig = {
    host:     url.hostname,
    port:     parseInt(url.port || '3306', 10),
    user:     url.username,
    password: url.password,
    database: url.pathname.replace('/', ''),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false }
  };
} else {
  // Local development — use individual .env vars
  poolConfig = {
    host:     process.env.DB_HOST,
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  };
}

const pool = mysql.createPool(poolConfig);

export default pool;

