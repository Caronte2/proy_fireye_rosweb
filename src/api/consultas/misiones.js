/**
 * @file misiones.js
 * @brief Gestión del histórico de misiones y trazabilidad de trayectorias.
 */
const pool = require('../conexion');

/**
 * @brief Inicia una nueva misión para un robot específico.
 * @param {Object} datos - Datos de inicio (robot_id).
 * @returns {Promise<Object>} ID de la misión iniciada.
 */
const iniciar = async ({ robot_id }) => {
    if (!robot_id) throw new Error('Se requiere el ID del robot para iniciar la misión');

    const query = `
        INSERT INTO MISION (robot_id, inicio, resultado) 
        VALUES ($1, CURRENT_TIMESTAMP, 'en_curso') 
        RETURNING *;
    `;
    const res = await pool.query(query, [robot_id]);
    return { success: true, mision: res.rows[0] };
};

/**
 * @brief Finaliza una misión actualizando su resultado y tiempo de fin.
 * @param {Object} datos - ID de la misión y el resultado ('completada' o 'abortada').
 */
const finalizar = async ({ mision_id, resultado }) => {
    if (!mision_id || !resultado) throw new Error('Faltan datos para finalizar la misión');

    const query = `
        UPDATE MISION 
        SET fin = CURRENT_TIMESTAMP, resultado = $1 
        WHERE id = $2 
        RETURNING *;
    `;
    const res = await pool.query(query, [resultado, mision_id]);
    return { success: true, mision: res.rows[0] };
};

/**
 * @brief Registra un array de puntos cartesianos reconstruyendo la trayectoria de la misión.
 * @param {Object} datos - ID de la misión y array de puntos {pos_x, pos_y, pos_z}.
 */
const guardarTrayectoria = async ({ mision_id, puntos }) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        for (const p of puntos) {
            await client.query(
                `INSERT INTO TRAYECTORIA_PUNTO (mision_id, pos_x, pos_y, pos_z, capturado_en) 
                 VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
                [mision_id, p.pos_x, p.pos_y, p.pos_z]
            );
        }
        
        await client.query('COMMIT');
        return { success: true, message: `Guardados ${puntos.length} puntos de trayectoria` };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

module.exports = { iniciar, finalizar, guardarTrayectoria };
