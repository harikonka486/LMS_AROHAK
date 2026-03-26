const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkSchema() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'lms_erp',
    });

    const [columns] = await db.query('DESCRIBE courses');
    console.log('Courses table columns:');
    columns.forEach(col => console.log(`- ${col.Field}: ${col.Type}`));
    
    await db.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();
