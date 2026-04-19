-- Extensión para manejar UUIDs si prefieres tokens más complejos
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla General de Usuarios (Operadores y potenciales Admins)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    token_confirmacion VARCHAR(255),
    cuenta_confirmada BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Administradores (Lista blanca de usuarios con privilegios)
CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    usuario_id INT UNIQUE REFERENCES usuarios(id) ON DELETE CASCADE,
    nivel_permisos VARCHAR(20) DEFAULT 'full', -- 'superadmin', 'soporte', etc.
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Robots (Vinculada a Usuarios/Operadores)
CREATE TABLE robots (
    id SERIAL PRIMARY KEY,
    modelo VARCHAR(50) NOT NULL,
    estado VARCHAR(20) DEFAULT 'disponible',
    nivel_bateria DECIMAL(5,2),
    operador_id INT REFERENCES usuarios(id) ON DELETE SET NULL
);

-- 4. Tabla de Misiones
CREATE TABLE misiones (
    id SERIAL PRIMARY KEY,
    robot_id INT REFERENCES robots(id) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP NOT NULL,
    fecha_fin TIMESTAMP,
    estado_mision VARCHAR(30)
);

-- 5. Tabla de Trayectorias (Puntos exactos)
CREATE TABLE trayectorias_puntos (
    id SERIAL PRIMARY KEY,
    mision_id INT REFERENCES misiones(id) ON DELETE CASCADE,
    pos_x DOUBLE PRECISION NOT NULL,
    pos_y DOUBLE PRECISION NOT NULL,
    pos_z DOUBLE PRECISION NOT NULL,
    capturado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabla de Alertas
CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    robot_id INT REFERENCES robots(id) ON DELETE CASCADE,
    mision_id INT REFERENCES misiones(id),
    tipo_alerta VARCHAR(50) NOT NULL,
    latitud DOUBLE PRECISION,
    longitud DOUBLE PRECISION,
    nivel_confianza DECIMAL(4,2),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
