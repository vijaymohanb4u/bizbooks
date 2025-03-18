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

// Test the connection
pool.getConnection()
  .then(connection => {
    connection.release();
  })
  .catch(err => {
    // Silent error handling
  });

// Query interface
interface QueryParams {
  query: string;
  values?: any[];
}

// Query function that returns the results
export async function query({ query, values = [] }: QueryParams) {
  try {
    const [results] = await pool.execute(query, values);
    return results;
  } catch (error) {
    throw error;
  }
}

// Wrapper function to execute queries with automatic connection handling
export async function executeQuery<T>(query: string, params: any[] = []): Promise<T> {
  try {
    const [results] = await pool.query(query, params);
    return results as T;
  } catch (error) {
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
    throw new Error('Database connection failed');
  }
}