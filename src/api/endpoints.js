const express = require('express');
const app = express();
const cors = require('cors'); // Instala con: npm install cors
app.use(cors()); // Esto permite que tu Web local acceda a tu API local sin bloqueos

// 1. Llamamos explícitamente al archivo index y lo ejecutamos
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

// 3. Endpoints ultra-compactos
app.get('/api/test-carga', (req, res) => res.json({ scripts_activos: Object.keys(db) }));

// Ejemplos de uso(Estructura): (req, res) => run(respuesta, 'nombre_archivo', 'nombre_funcion_exportada', datos)
app.get('/api/usuarios/:id', (req, res) => run(res, 'usuarios', 'obtenerPorId', req.params.id));
app.post('/api/login',       (req, res) => run(res, 'usuarios', 'login', req.body));
app.post('/api/alerta',      (req, res) => run(res, 'alertas', 'registrar', req.body));

app.listen(3000, () => console.log(`🚀 API en puerto 3000 | Scripts: ${Object.keys(db)}`));