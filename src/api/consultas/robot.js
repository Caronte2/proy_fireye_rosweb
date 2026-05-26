/**
 * @file robot.js
 * @brief Control y actualización del estado de la flota de robots FirEye.
 */
const pool = require('../conexion');

/**
 * @brief Actualiza la telemetría básica y el estado operativo del robot.
 * @param {Object} datos - Estado de la máquina (id, estado, nivel_bateria).
 */
const actualizarEstado = async ({ id, estado, nivel_bateria }) => {
    if (!id || nivel_bateria === undefined) throw new Error('ID y nivel de batería son obligatorios');

    // Validación de estados según la documentación del Sprint 3
    const estadosValidos = ['activo', 'cargando', 'error'];
    if (estado && !estadosValidos.includes(estado)) {
        throw new Error(`Estado '${estado}' no válido. Opciones: ${estadosValidos.join(', ')}`);
    }

    const query = `
        UPDATE ROBOT 
        SET estado = $1, nivel_bateria = $2 
        WHERE id = $3 
        RETURNING *;
    `;
    const res = await pool.query(query, [estado, nivel_bateria, id]);
    return res.rows[0];
};

/**
 * @brief Obtiene la información completa de un robot y el operador que lo supervisa.
 * @param {number} id - Identificador del robot.
 */
const obtenerInfo = async (id) => {
    const query = `
        SELECT r.*, o.nombre as operador_nombre, o.cargo as operador_cargo
        FROM ROBOT r
        JOIN OPERADOR o ON r.operador_id = o.id
        WHERE r.id = $1;
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0];
};

module.exports = { actualizarEstado, obtenerInfo };