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
 * @brief Obtiene el diagnóstico completo y estado técnico del robot.
 */
const obtenerInfo = async (id) => {
    const query = `
        SELECT 
            r.id,
            r.robot_name,
            r.online,
            r.estado_sistema,
            r.bateria_porcentaje,
            r.ubicacion_x,
            r.ubicacion_y,
            r.ultima_actualizacion,
            CASE 
                WHEN r.bateria_porcentaje < 15 THEN 'Critico'
                WHEN r.estado_sistema = 'Emergencia' THEN 'Atencion Inmediata'
                ELSE 'Operativo'
            END as salud_diagnostico,
            -- Información del operador relacionado
            o.id as operador_id,
            o.username as operador_usuario,
            o.nombre_completo as operador_nombre,
            o.email as operador_email
        FROM robot r
        LEFT JOIN operadores o ON r.operador_id = o.id
        WHERE r.id = $1;
    `;
    const res = await pool.query(query, [id]);
    return res.rows[0];
};

/**
 * @brief Registra la posición actual del robot en la base de datos.
 */
const registrarPosicion = async (id, x, y) => {
    const query = `
        UPDATE ROBOT 
        SET ubicacion_x = $2, 
            ubicacion_y = $3 
        WHERE id = $1 
        RETURNING *;
    `;
    // $1 = id, $2 = x, $3 = y
    const res = await pool.query(query, [id, x, y]);
    return res.rows[0];
};

module.exports = { actualizarEstado, obtenerInfo, registrarPosicion };