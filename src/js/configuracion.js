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