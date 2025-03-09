const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Validate environment variables
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD) {
  console.error('Missing required database environment variables');
  process.exit(1);
}

async function initializeDatabase() {
  try {
    // Create connection without database selected
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    });

    console.log('Connected to MySQL server');

    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .filter(statement => statement.trim())
      .map(statement => statement + ';');

    // Execute each statement
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log('Database schema initialized successfully');

    // Insert some sample categories
    const sampleCategories = [
      { name: 'Salary', type: 'income', description: 'Monthly salary income', color: '#34D399' },
      { name: 'Freelance', type: 'income', description: 'Freelance project income', color: '#60A5FA' },
      { name: 'Rent', type: 'expense', description: 'Monthly rent payment', color: '#F87171' },
      { name: 'Utilities', type: 'expense', description: 'Electricity, water, and internet bills', color: '#FBBF24' },
      { name: 'Groceries', type: 'expense', description: 'Food and household items', color: '#A78BFA' }
    ];

    for (const category of sampleCategories) {
      await connection.query(
        'INSERT IGNORE INTO bizbooks.categories (name, type, description, color) VALUES (?, ?, ?, ?)',
        [category.name, category.type, category.description, category.color]
      );
    }

    console.log('Sample categories inserted successfully');

    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase(); 