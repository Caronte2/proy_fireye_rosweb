/**
 * configuracion.js – Fireye Configuración v2
 * - Gestión de pestañas
 * - Selección de botones radio
 * - Guardado/restauración de estado con localStorage
 */

/* ═══════════════════════════════════════
   PESTAÑAS
═══════════════════════════════════════ */
function openTab(evt, tabName) {
    document.querySelectorAll('.tab-content').forEach(el => {
        el.style.display = 'none';
        el.classList.remove('active');
    });
    document.querySelectorAll('.tab-link').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(tabName).style.display = 'block';
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.classList.add('active');
}

/* ═══════════════════════════════════════
   ESTADO — clave única por botón
═══════════════════════════════════════ */
const STORAGE_KEY = 'fireye_config_v1';

function cargarEstado() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
}

function guardarEstado(estado) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

/* ═══════════════════════════════════════
   BOTONES RADIO — selección visual
═══════════════════════════════════════ */
const TIPOS_RADIO = ['modo', 'cifrado', 'protocolo', 'sensibilidad'];

function aplicarSeleccion(tipo, valor) {
    document.querySelectorAll(`[data-type="${tipo}"]`).forEach(btn => {
        const activo = btn.getAttribute('data-value') === valor;
        btn.classList.toggle('btn-red',   activo);
        btn.classList.toggle('btn-white', !activo);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    /* — Restaurar estado guardado — */
    const estado = cargarEstado();
    TIPOS_RADIO.forEach(tipo => {
        if (estado[tipo]) aplicarSeleccion(tipo, estado[tipo]);
    });

    /* — Eventos de botones — */
    document.querySelectorAll('.settings-actions .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tipo  = btn.getAttribute('data-type');
            const valor = btn.getAttribute('data-value');
            if (!tipo || !valor) return;

            if (TIPOS_RADIO.includes(tipo)) {
                aplicarSeleccion(tipo, valor);
            }

            ejecutarAccion(tipo, valor);
        });
    });

    /* — Botón GUARDAR — */
    document.querySelector('.btn-save')?.addEventListener('click', () => {
        const estado = cargarEstado();

        // Recorrer todos los botones activos y guardar su tipo/valor
        TIPOS_RADIO.forEach(tipo => {
            const activo = document.querySelector(`[data-type="${tipo}"].btn-red`);
            if (activo) estado[tipo] = activo.getAttribute('data-value');
        });

        guardarEstado(estado);

        // Feedback visual en el botón
        const btnSave = document.querySelector('.btn-save');
        const textoOriginal = btnSave.textContent;
        btnSave.textContent = '✓ GUARDADO';
        btnSave.style.background = '#2a7a2a';
        setTimeout(() => {
            btnSave.textContent = textoOriginal;
            btnSave.style.background = '';
        }, 1800);
    });

});

function ejecutarAccion(tipo, valor) {
    switch (tipo) {
        case 'mantenimiento':
            alert(`Iniciando proceso de ${valor}...`);
            break;
        case 'contacto':
            alert(`Configurando alerta vía ${valor}`);
            break;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timeInput = document.getElementById('horaDescanso');
    const btnUp = document.getElementById('btnTimeUp');
    const btnDown = document.getElementById('btnTimeDown');

    if (timeInput && btnUp && btnDown) {
        
        // Al pulsar flecha arriba, sumamos 1 "step" (30 min)
        btnUp.addEventListener('click', () => {
            timeInput.stepUp();
            forzarFormato(timeInput);
        });

        // Al pulsar flecha abajo, restamos 1 "step" (30 min)
        btnDown.addEventListener('click', () => {
            timeInput.stepDown();
            forzarFormato(timeInput);
        });

        // También validamos si el usuario escribe el número con el teclado
        timeInput.addEventListener('change', function() {
            forzarFormato(this);
        });
    }

    // Extraemos tu lógica de redondeo a una función para poder usarla en los 3 casos
    function forzarFormato(inputElement) {
        if (!inputElement.value) return; 
        
        let [hours, minutes] = inputElement.value.split(':');
        let mins = parseInt(minutes);
        let hrs = parseInt(hours);

        let roundedMins = '00';
        
        if (mins >= 15 && mins < 45) {
            roundedMins = '30';
        } else if (mins >= 45) {
            hrs = (hrs + 1) % 24; 
        }

        const formattedHours = hrs.toString().padStart(2, '0');
        inputElement.value = `${formattedHours}:${roundedMins}`;
    }
});
