const db = require('../conexion'); // Importa el pool de conexión a la DB

/**
 * Función para registrar una nueva incidencia/alerta desde el robot
 * @param {Object} datos - Viene del req.body de la API
 */
const registrar = async (datos) => {
    try {
        const { 
            tipo_nombre,    // Nombre del tipo (ej: 'Incendio')
            confianza,      // Nivel de la IA (0.0 a 1.0)
            x, y,           // Coordenadas del robot en ese momento
            descripcion     // Texto adicional
        } = datos;

        // 1. Buscamos el ID del tipo de alerta basado en el nombre enviado por ROS 2
        const tipoRes = await db.query(
            'SELECT id FROM tipos_alerta WHERE nombre = $1', 
            [tipo_nombre]
        );

        if (tipoRes.rows.length === 0) {
            throw new Error(`El tipo de alerta '${tipo_nombre}' no existe en la base de datos.`);
        }

        const tipo_id = tipoRes.rows[0].id;

        // 2. Insertamos la alerta en la tabla 'alertas'
        const queryInsert = `
            INSERT INTO alertas (
                tipo_id, 
                nivel_confianza, 
                coord_x, 
                coord_y, 
                descripcion, 
                estado
            ) 
            VALUES ($1, $2, $3, $4, $5, 'Activa') 
            RETURNING *;
        `;

        const valores = [tipo_id, confianza, x, y, descripcion];
        const resultado = await db.query(queryInsert, valores);

        console.log(`Alerta registrada ID: ${resultado.rows[0].id}`);
        
        return {
            success: true,
            alerta: resultado.rows[0],
            message: "Incidencia guardada correctamente"
        };

    } catch (error) {
        console.error("Error en alertas.registrar:", error.message);
        throw error; // El controlador 'run' de endpoints.js lo capturará
    }
};

/**
 * Función para obtener todas las alertas activas (útil para la Web)
 */
const obtenerActivas = async () => {
    const query = `
        SELECT a.*, t.nombre as tipo_nombre, t.prioridad 
        FROM alertas a
        JOIN tipos_alerta t ON a.tipo_id = t.id
        WHERE a.estado != 'Resuelta'
        ORDER BY a.fecha_hora DESC;
    `;
    const res = await db.query(query);
    return res.rows;
};

// Exportamos las funciones para que el cargador automático las vea
module.exports = {
    registrar,
    obtenerActivas
};