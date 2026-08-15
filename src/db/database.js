const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "1234",
  database: "prueba_db",
});

module.exports = pool;
