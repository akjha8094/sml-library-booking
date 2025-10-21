const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs').promises;

// Load environment variables
require('dotenv').config();

async function runMigrations() {
  console.log('Starting database migrations...');
  
  // Database configuration
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sml_library',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection(config);
    console.log('Connected to database');
    
    // Read and execute schema.sql
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schemaSql = await fs.readFile(schemaPath, 'utf8');
    
    // Split SQL by semicolons and execute each statement
    const statements = schemaSql.split(';').filter(stmt => stmt.trim() !== '');
    
    for (const statement of statements) {
      if (statement.trim() !== '') {
        try {
          await connection.execute(statement);
          console.log('Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          // Ignore errors for CREATE DATABASE IF NOT EXISTS and USE statements
          if (!error.message.includes('Unknown database') && !error.message.includes('Database does not exist')) {
            console.warn('Warning:', error.message);
          }
        }
      }
    }
    
    // Read and execute advanced_features.sql
    const advancedPath = path.join(__dirname, '../database/advanced_features.sql');
    try {
      const advancedSql = await fs.readFile(advancedPath, 'utf8');
      const advancedStatements = advancedSql.split(';').filter(stmt => stmt.trim() !== '');
      
      for (const statement of advancedStatements) {
        if (statement.trim() !== '') {
          try {
            await connection.execute(statement);
            console.log('Executed advanced feature:', statement.substring(0, 50) + '...');
          } catch (error) {
            console.warn('Warning (advanced features):', error.message);
          }
        }
      }
    } catch (error) {
      console.log('Advanced features SQL not found, skipping...');
    }
    
    console.log('Database migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migrations if this script is called directly
if (require.main === module) {
  runMigrations();
}

module.exports = runMigrations;