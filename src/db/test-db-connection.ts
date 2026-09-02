/**
 * Script para probar la conexión a MySQL con las variables de entorno actuales.
 * Ejecutar con: npx ts-node-dev src/db/test-db-connection.ts
 */

import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

async function testConnection() {
  console.log("\n🔍 Probando conexión a MySQL...\n");

  // Mostrar las variables que se están usando (sin la contraseña)
  const config = {
    host: process.env.DB_HOST || "(no definido)",
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || "(vacío)",
    database: process.env.DB_NAME || "(no definido)",
    passwordSet: !!process.env.DB_PASSWORD,
  };

  console.log("📋 Configuración detectada:");
  console.log(`   Host:     ${config.host}`);
  console.log(`   Puerto:   ${config.port}`);
  console.log(`   Usuario:  ${config.user}`);
  console.log(`   Base dat: ${config.database}`);
  console.log(`   Password: ${config.passwordSet ? "✅ Sí" : "❌ No"}\n`);

  if (config.passwordSet) {
    console.log("⚠️  Nota: Por seguridad, la contraseña no se muestra.\n");
  }

  if (!config.user || config.user === "(vacío)") {
    console.error("❌ ERROR: DB_USER está vacío o no definido.");
    console.error("   Edita Backend/.env y agrega un usuario válido (ej: root).\n");
    process.exit(1);
  }

  if (!config.database || config.database === "(no definido)") {
    console.error("❌ ERROR: DB_NAME está vacío o no definido.");
    console.error("   Edita Backend/.env y agrega un nombre de base de datos.\n");
    process.exit(1);
  }

  let conn: mysql.Connection | null = null;

  try {
    // Paso 1: Conectar sin base de datos (para verificar credenciales)
    console.log("📡 Intentando conectar al servidor MySQL...");
    conn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: process.env.DB_PASSWORD || "",
      connectTimeout: 5000,
    });

    // Obtener versión de MySQL
    const [rows] = await conn.query("SELECT VERSION() as version") as any;
    console.log(`✅ Conectado exitosamente a MySQL ${rows[0].version}\n`);

    // Paso 2: Verificar si la base de datos existe
    console.log(`📂 Verificando base de datos '${config.database}'...`);
    const [dbs] = await conn.query("SHOW DATABASES") as any;
    const dbNames = dbs.map((row: any) => row.Database);

    if (dbNames.includes(config.database)) {
      console.log(`✅ La base de datos '${config.database}' existe.\n`);

      // Paso 3: Conectar a la base de datos y verificar tablas
      console.log("🔗 Conectando a la base de datos...");
      const dbConn = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: process.env.DB_PASSWORD || "",
        database: config.database,
        connectTimeout: 5000,
      });

      const [tables] = await dbConn.query("SHOW TABLES") as any;
      await dbConn.end();

      if (tables.length > 0) {
        console.log(`✅ La base de datos tiene ${tables.length} tabla(s):`);
        tables.forEach((t: any) => {
          const tableName = t[Object.keys(t)[0]];
          console.log(`   📌 ${tableName}`);
        });

        const expectedTables = [
          "users",
          "posts",
          "post_images",
          "comments",
          "post_likes",
          "comment_likes",
          "friendships",
          "blocks",
          "notifications",
          "messages",
          "revoked_tokens",
        ];

        const tableNames = tables.map((t: any) => t[Object.keys(t)[0]]);
        const missingTables = expectedTables.filter((t) => !tableNames.includes(t));

        if (missingTables.length > 0) {
          console.log("\n⚠️  Tablas que faltan (ejecuta el schema.sql):");
          missingTables.forEach((t) => console.log(`   ❌ ${t}`));
        } else {
          console.log("\n✅ ¡Todas las tablas están presentes!");
        }

      } else {
        console.log("⚠️  La base de datos existe pero está vacía.");
        console.log("   Ejecuta el archivo Backend/src/db/schema.sql para crear las tablas.\n");
      }

    } else {
      console.error(`❌ La base de datos '${config.database}' NO existe.`);
      console.error("   Crea la base de datos con: CREATE DATABASE IF NOT EXISTS red_social;");
      console.error("   O edita Backend/.env para usar un nombre correcto.\n");
    }

  } catch (error: any) {
    console.error("\n❌ ERROR DE CONEXIÓN:\n");

    if (error.code === "ER_BAD_USER_ERROR") {
      console.error("👤 El usuario no existe o la contraseña es incorrecta.");
      console.error("   Verifica DB_USER y DB_PASSWORD en Backend/.env\n");
    } else if (error.code === "ECONNREFUSED") {
      console.error("🔌 No se pudo conectar al servidor MySQL.");
      console.error("   Verifica que MySQL esté instalado y corriendo.\n");
    } else if (error.code === "ENOENT") {
      console.error("📁 El archivo .env no se encuentra o no es legible.");
      console.error("   Asegúrate de que Backend/.env exista en la raíz del backend.\n");
    } else if (error.code === "ER_NO_DB_ERROR") {
      console.error("📂 La base de datos no existe. Crea la base de datos primero.");
      console.error("   Ejecuta: CREATE DATABASE red_social;\n");
    } else if (error.code === "ETIMEDOUT") {
      console.error("⏱️  Conexión agotada. Verifica que el host y puerto sean correctos.\n");
    } else {
      console.error(`   Código: ${error.code}`);
      console.error(`   Mensaje: ${error.message}\n`);
    }
  } finally {
    if (conn) {
      await conn.end();
    }
  }

  console.log("\n✅ Script de prueba finalizado.\n");
}

testConnection();