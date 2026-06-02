-- ==========================================================
-- SCRIPT DE BASE DE DATOS CONSOLIDADO - PROYECTO FIREYE
-- Configuración para AWS RDS (PostgreSQL)
-- ==========================================================

-- 1. GESTIÓN DE USUARIOS (OPERADORES Y ADMINISTRADORES)
-- ----------------------------------------------------------
CREATE TABLE operadores (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(100),
    nombre_completo VARCHAR(100),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de administradores como lista de IDs de operadores autorizados
CREATE TABLE administradores (
    id SERIAL PRIMARY KEY,
    operador_id INTEGER UNIQUE NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. INFRAESTRUCTURA DE ROBOT Y TELEMETRÍA
-- ----------------------------------------------------------
CREATE TABLE robot (
    id SERIAL PRIMARY KEY,
    robot_name VARCHAR(50) UNIQUE DEFAULT 'FirEye_01',
    online BOOLEAN DEFAULT FALSE,
    estado_sistema VARCHAR(50), -- 'Patrullando', 'Emergencia', 'Cargando', 'Offline'
    bateria_porcentaje INTEGER CHECK (bateria_porcentaje >= 0 AND bateria_porcentaje <= 100),
    ubicacion_x FLOAT,
    ubicacion_y FLOAT,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. NAVEGACIÓN Y RUTAS (NAV2)
-- ----------------------------------------------------------
CREATE TABLE rutas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    creado_por INTEGER REFERENCES operadores(id)
);

CREATE TABLE puntos_ruta (
    id SERIAL PRIMARY KEY,
    ruta_id INTEGER REFERENCES rutas(id) ON DELETE CASCADE,
    orden INTEGER NOT NULL, -- Secuencia de navegación
    pos_x FLOAT NOT NULL,
    pos_y FLOAT NOT NULL,
    pos_z FLOAT DEFAULT 0.0,
    orientacion_z FLOAT DEFAULT 0.0,
    orientacion_w FLOAT DEFAULT 1.0
);

-- 4. GESTIÓN DE ALERTAS Y EVENTOS
-- ----------------------------------------------------------
CREATE TABLE tipos_alerta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL, -- 'Incendio', 'Obstrucción', 'Intrusión', 'Batería Baja'
    prioridad INTEGER DEFAULT 1  -- 1: Bajo, 2: Medio, 3: Crítico (Pánico)
);

CREATE TABLE alertas (
    id SERIAL PRIMARY KEY,
    tipo_id INTEGER REFERENCES tipos_alerta(id),
    operador_atendio_id INTEGER REFERENCES operadores(id), -- Null si nadie la ha atendido
    fecha_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nivel_confianza FLOAT, -- De la IA (ej. 0.98)
    coord_x FLOAT,
    coord_y FLOAT,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'Activa', -- 'Activa', 'En proceso', 'Resuelta', 'Falsa Alarma'
    confirmada_por_humano BOOLEAN DEFAULT FALSE
);

-- Tabla para múltiples imágenes por alerta (Análisis en directo)
CREATE TABLE alerta_imagenes (
    id SERIAL PRIMARY KEY,
    alerta_id INTEGER REFERENCES alertas(id) ON DELETE CASCADE,
    url_imagen TEXT NOT NULL, -- URL de AWS S3
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