const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3307,
  user: "root",
  password: "",
  database: "prueba_db",
});

module.exports = pool; // exportás la función para usarla en los routers
