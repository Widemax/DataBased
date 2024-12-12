import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

// PostgreSQL connection pool configuration
const pool = new Pool({
  user: process.env.DB_USER, // Environment variable for username
  host: process.env.DB_HOST, // Environment variable for host
  database: process.env.DB_NAME, // Environment variable for database name
  password: process.env.DB_PASSWORD, // Environment variable for password
  port: Number(process.env.DB_PORT), // Environment variable for port
});

// Function to connect to the database
export const connectToDb = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Connected to the database');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};


export { pool };
