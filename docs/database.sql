-- ==========================================================
-- SCRIPT DE BASE DE DATOS CONSOLIDADO - PROYECTO FIREYE
-- Configuración para AWS RDS (PostgreSQL)
-- ==========================================================

-- 1. GESTIÓN DE USUARIOS (OPERADORES Y ADMINISTRADORES)
-- ----------------------------------------------------------

-- Habilitar extensión para tokens UUID 
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE operadores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    token VARCHAR(255), 
    cuenta_confirmada BOOLEAN DEFAULT FALSE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    operador_id INTEGER UNIQUE NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
    nivel_permisos VARCHAR(20) DEFAULT 'full', -- Reutilizado de tu código
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. INFRAESTRUCTURA DE ROBOT Y TELEMETRÍA
-- ----------------------------------------------------------
CREATE TABLE robot (
    id SERIAL PRIMARY KEY,
    robot_name VARCHAR(50) UNIQUE DEFAULT 'FirEye_01',
    modelo VARCHAR(50), 
    online BOOLEAN DEFAULT FALSE,
    estado_sistema VARCHAR(50), -- 'Patrullando', 'Cargando', 'Emergencia'
    bateria_porcentaje INTEGER,
    ubicacion_x FLOAT,
    ubicacion_y FLOAT,
    operador_id INT REFERENCES operadores(id) ON DELETE SET NULL, -- Quién lo controla
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. NAVEGACIÓN Y RUTAS (NAV2)
-- ----------------------------------------------------------
-- RUTAS PREDEFINIDAS 
CREATE TABLE rutas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_por INTEGER REFERENCES operadores(id)
);

CREATE TABLE puntos_ruta (
    id SERIAL PRIMARY KEY,
    ruta_id INTEGER REFERENCES rutas(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL,
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    orientacion_z FLOAT DEFAULT 0.0,
    orientacion_w FLOAT DEFAULT 1.0
);

-- HISTORIAL DE MISIONES (Para análisis posterior)
CREATE TABLE misiones_historial (
    id SERIAL PRIMARY KEY,
    robot_name VARCHAR(50) REFERENCES robot(robot_name),
    ruta_id INTEGER REFERENCES rutas(id),
    fecha_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_fin TIMESTAMP,
    estado_final VARCHAR(30) -- 'Completada', 'Abortada', 'Interrumpida por Incendio'
);


-- 4. GESTIÓN DE ALERTAS Y EVENTOS
-- ----------------------------------------------------------
-- ALERTAS Y EVENTOS (Diversificadas)
CREATE TABLE tipos_alerta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- 'Incendio', 'Obstrucción', 'Persona'
    prioridad INTEGER DEFAULT 1
);

CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    tipo_id INTEGER REFERENCES tipos_alerta(id),
    mision_id INTEGER REFERENCES misiones_historial(id), -- Vinculada a la misión actual
    operador_atendio_id INTEGER REFERENCES operadores(id),
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nivel_confianza FLOAT,
    coord_x FLOAT,
    coord_y FLOAT,
    estado VARCHAR(20) DEFAULT 'Activa'
);

-- MULTIMEDIA (Imágenes de las alertas)
CREATE TABLE alerta_imagenes (
    id SERIAL PRIMARY KEY,
    alerta_id INTEGER REFERENCES alertas(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL,
    fecha_captura TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ==========================================================
-- DATOS INICIALES PARA PRUEBAS (SEEDS)
-- ==========================================================

-- Insertar tipos de alerta base
INSERT INTO tipos_alerta (nombre, prioridad) VALUES 
('Incendio', 3), 
('Obstáculo Crítico', 2), 
('Persona Detectada', 2),
('Fallo de Sistema', 3),
('Evento Informativo', 1);

-- Registrar el robot inicial
INSERT INTO robot (robot_name, estado_sistema, bateria_porcentaje) 
VALUES ('FirEye_Alpha', 'Offline', 0);

-- Ejemplo de Operador y Admin (Contraseña de ejemplo '1234')
INSERT INTO operadores (username, password_hash, nombre_completo) 
VALUES ('admin_user', 'hash_provisional_1234', 'Administrador Principal');

INSERT INTO administradores (operador_id) VALUES (1);