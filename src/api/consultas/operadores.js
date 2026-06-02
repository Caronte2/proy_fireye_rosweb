/**
 * @file operadores.js
 * @brief Gestión y autenticación de la entidad OPERADOR.
 */
const pool = require('../conexion');

/**
 * @brief Valida las credenciales de un operador para el acceso al Dashboard.
 * @param {Object} datos - Credenciales de acceso (email, password).
 */
const login = async ({ email, password }) => {
    if (!email || !password) throw new Error('Email y contraseña obligatorios');

    // Asumimos que la tabla OPERADOR ahora usa 'email' como identificador para el login
    const res = await pool.query('SELECT * FROM OPERADOR WHERE email = $1', [email]);
    
    // ATENCIÓN: Implementar bcrypt para la contraseña en producción
    if (res.rows.length === 0 || res.rows[0].password_hash !== password) {
        throw new Error('Credenciales inválidas');
    }
    
    const operador = res.rows[0];
    return { 
        success: true, 
        operador: { 
            id: operador.id, 
            nombre: operador.nombre, 
            cargo: operador.cargo 
        } 
    };
};

module.exports = { login };