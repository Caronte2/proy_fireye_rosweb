const express = require('express');
const app = express();
const cors = require('cors'); 
app.use(cors()); 

// 1. Cargador dinámico de scripts
const db = require('./consultas/index')(); 

app.use(express.json());

// 2. Controlador universal (try-catch centralizado)
const run = async (res, script, metodo, datos) => {
    try {
        if (!db[script]) throw new Error(`El script '${script}' no está disponible.`);
        if (!db[script][metodo]) throw new Error(`El método '${metodo}' no existe.`);
        // Ejecutamos el método pasándole los datos
        res.json(await db[script][metodo](datos));
    } catch (e) {
        // Atrapa errores de validación, de SQL o de métodos inexistentes sin colapsar
        res.status(500).json({ error: e.message });
    }
};

// 3. Endpoint de testeo
app.get('/api/test-carga', (req, res) => res.json({ scripts_activos: Object.keys(db) }));

// ==========================================
// 4. ENDPOINTS DE LA API FirEye
// Estructura: run(res, 'nombre_archivo', 'metodo_exportado', datos)
// ==========================================

// --- USUARIOS (Operadores) ---
app.post('/api/login', (req, res) => run(res, 'usuarios', 'login', req.body));

// --- ROBOT ---
// Actualiza telemetría (batería, estado: 'activo', 'cargando', 'error')
app.post('/api/robot/estado',  (req, res) => run(res, 'robot', 'actualizarEstado', req.body));
// Obtiene la info del robot y del operador asignado
app.get('/api/robot/:id',      (req, res) => run(res, 'robot', 'obtenerInfo', req.params.id));
// Registra la posición actual del robot
app.post('/api/robot/posicion', (req, res) => run(res, 'robot', 'registrarPosicion', req.body));

// --- MISIONES Y TRAYECTORIAS ---
// Inicia una misión y devuelve el ID
app.post('/api/misiones/iniciar',   (req, res) => run(res, 'misiones', 'iniciar', req.body));
// Finaliza la misión (estado: completada o abortada)
app.post('/api/misiones/finalizar', (req, res) => run(res, 'misiones', 'finalizar', req.body));
// Guarda un array de puntos cartesianos de la misión
app.post('/api/misiones/puntos',    (req, res) => run(res, 'misiones', 'guardarTrayectoria', req.body));

// --- ALERTAS ---
// Registra una nueva alerta (fuego, humo, bateria_baja)
app.post('/api/alertas/registrar', (req, res) => run(res, 'alertas', 'registrar', req.body));
// Obtiene el histórico de alertas
app.get('/api/alertas',            (req, res) => run(res, 'alertas', 'obtenerTodas', null));

// ==========================================

app.listen(3000, () => console.log(`API en puerto 3000 | Scripts montados: ${Object.keys(db)}`));