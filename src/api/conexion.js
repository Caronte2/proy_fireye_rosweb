const { Pool } = require('pg');

const pool = new Pool({
  host: 'tu-instancia.aws.com',
  user: 'admin',
  password: 'tu_password',
  database: 'fireye_db',
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