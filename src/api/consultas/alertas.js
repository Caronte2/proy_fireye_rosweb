/**
 * @file alertas.js
 * @brief Registro y gestión de anomalías detectadas por el sistema de visión e IA.
 */
const pool = require('../conexion');

/**
 * @brief Registra una nueva alerta vinculada a un robot y su misión actual.
 * @param {Object} datos - Detalles de la alerta (mision_id, robot_id, tipo, latitud, longitud, nivel_confianza).
 */
const registrar = async (datos) => {
    const { mision_id, robot_id, tipo, latitud, longitud, nivel_confianza } = datos;

    // Validación según los tipos definidos en el documento: 'fuego', 'humo', 'bateria_baja'
    const tiposValidos = ['fuego', 'humo', 'bateria_baja'];
    if (!tiposValidos.includes(tipo)) {
        throw new Error(`Tipo de alerta inválido. Debe ser: ${tiposValidos.join(', ')}`);
    }

    if (!mision_id || !robot_id || nivel_confianza === undefined) {
        throw new Error('Faltan datos obligatorios de trazabilidad (misión, robot o confianza)');
    }

    const queryInsert = `
        INSERT INTO ALERTA (
            mision_id, robot_id, tipo, latitud, longitud, nivel_confianza, fecha_hora
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
        RETURNING *;
    `;
    
    const resultado = await pool.query(queryInsert, [
        mision_id, robot_id, tipo, latitud, longitud, nivel_confianza
    ]);

    console.log(`========Alerta crítica [${tipo.toUpperCase()}] registrada. ID: ${resultado.rows[0].id}`);
    
    return { success: true, alerta: resultado.rows[0] };
};

/**
 * @brief Obtiene el listado histórico de alertas.
 */
const obtenerTodas = async () => {
    const query = `
        SELECT a.*, r.modelo as robot_modelo 
        FROM ALERTA a
        JOIN ROBOT r ON a.robot_id = r.id
        ORDER BY a.fecha_hora DESC;
    `;
    const res = await pool.query(query);
    return res.rows;
};

module.exports = { registrar, obtenerTodas };