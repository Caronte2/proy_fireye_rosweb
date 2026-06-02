/**
 * @file script.js
 * @brief Control de interfaz para el sistema de pestañas.
 * @author Manuel Pérez
 * @date 11/4/2026
 */

/**
 * @function openTab
 * @brief Cambia la pestaña visible en el panel de configuración.
 * * @param {Event} evt El evento de click del ratón.
 * @param {string} tabName El ID de la sección que se desea mostrar.
 * @return {void}
 */
function openTab(evt, tabName) {
    // Declaración de variables locales
    let i, tabcontent, tablinks;

    // Ocultar todos los elementos con clase "tab-content"
    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }

    // Eliminar la clase "active" de todos los botones "tab-link"
    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Mostrar la pestaña actual y añadir la clase "active" al botón
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

/**
 * @brief Inicialización por defecto (opcional si ya se define en HTML).
 */
document.addEventListener("DOMContentLoaded", () => {
    const buttonGroups = document.querySelectorAll('.settings-actions');

    buttonGroups.forEach(group => {
        const buttons = group.querySelectorAll('.btn');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const tipo = button.getAttribute('data-type');
                const valor = button.getAttribute('data-value');

                // 1. Lógica Visual: Solo grupos tipo "Radio" cambian colores entre sí
                // Filtramos para que botones de acción única (como actualizar) no limpien otros
                if (["modo", "cifrado", "protocolo", "sensibilidad"].includes(tipo)) {
                    buttons.forEach(btn => {
                        btn.classList.remove('btn-red');
                        btn.classList.add('btn-white');
                    });
                    button.classList.add('btn-red');
                    button.classList.remove('btn-white');
                }

                // 2. Ejecutar la función correspondiente
                ejecutarAccion(tipo, valor);
            });
        });
    });
});

function ejecutarAccion(tipo, valor) {
    console.log(`Ejecutando: ${tipo} -> ${valor}`);
    
    switch (tipo) {
        case 'modo':
            // Lógica para cambiar el movimiento del robot
            break;
        case 'sensibilidad':
            // Lógica para ajustar umbrales térmicos
            break;
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
