const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  password: '1234',
  database: 'postgres',
  port: 5432,
  // Configuración recomendada para AWS
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Verificación de conexión
pool.on('connect', () => {
  console.log('Conectado a la DB en AWS RDS');
});

module.exports = pool;