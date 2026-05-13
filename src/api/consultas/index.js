const fs = require('fs');
const path = require('path');

// Exportamos una función que carga los scripts explícitamente
module.exports = () => {
    const db = {};
    fs.readdirSync(__dirname).forEach(file => {
        if (file !== 'index.js' && file.endsWith('.js')) {
            try { 
                db[path.basename(file, '.js')] = require(path.join(__dirname, file)); 
            } catch (e) { 
                console.error(`⚠️ Error en [${file}]: ${e.message}`); 
            }
        }
    });
    return db;
};