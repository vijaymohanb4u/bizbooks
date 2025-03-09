import mysql from 'mysql2/promise';
import { Pool } from 'mysql2/promise';

// Database configuration from environment variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'bizbooks',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Create a pool instance
const pool: Pool = mysql.createPool(dbConfig);

// Test the connection and log any errors
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    console.log('Connection config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.message);
  });

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Wrapper function to execute queries with automatic connection handling
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  try {
    const [results] = await pool.query(query, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Export both the pool and the db object for different use cases
export const db = pool;
export { pool };

// Helper function to ensure database is connected before queries
export async function ensureDbConnected() {
  try {
    await pool.getConnection();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw new Error('Database connection failed');
  }
} 