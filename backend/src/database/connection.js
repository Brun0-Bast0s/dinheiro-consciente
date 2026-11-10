require('dotenv').config();
const mysql = require('mysql2/promise');

// Pool de conexoes com o MySQL (dados vem do arquivo .env)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  dateStrings: true,     // datas voltam como 'AAAA-MM-DD' (sem problema de fuso)
  decimalNumbers: true   // DECIMAL volta como numero, nao como texto
});

module.exports = pool;
