/**
 * @file configuracion.js
 * @brief Control de interfaz para el sistema de pestañas y botones.
 */

function openTab(evt, tabName) {
    let i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
        tabcontent[i].classList.remove("active");
    }

    tablinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.addEventListener("DOMContentLoaded", () => {
    // Lógica para los grupos de botones (cambio de colores y alertas)
    const buttonGroups = document.querySelectorAll('.settings-actions');

    buttonGroups.forEach(group => {
        const buttons = group.querySelectorAll('.btn');

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const tipo = button.getAttribute('data-type');
                const valor = button.getAttribute('data-value');

                if (["modo", "cifrado", "protocolo", "sensibilidad"].includes(tipo)) {
                    buttons.forEach(btn => {
                        btn.classList.remove('btn-red');
                        btn.classList.add('btn-white');
                    });
                    button.classList.add('btn-red');
                    button.classList.remove('btn-white');
                }

                ejecutarAccion(tipo, valor);
            });
        });
    });

    // Lógica para el selector de hora personalizado
    const timeInput = document.getElementById('horaDescanso');
    const btnUp = document.getElementById('btnTimeUp');
    const btnDown = document.getElementById('btnTimeDown');

    if (timeInput && btnUp && btnDown) {
        btnUp.addEventListener('click', () => {
            timeInput.stepUp();
            forzarFormato(timeInput);
        });

        btnDown.addEventListener('click', () => {
            timeInput.stepDown();
            forzarFormato(timeInput);
        });

        timeInput.addEventListener('change', function() {
            forzarFormato(this);
        });
    }
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

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const notificationBtn = document.getElementById('notificationBtn');
    const notifOverlay = document.getElementById('notifOverlay');
    const btnCloseNotif = document.getElementById('btn_closeNotifPopup');
    const btnCloseNotif2 = document.getElementById('btn_closeNotifPopup2');
    const btnClearNotif = document.getElementById('btn_clearNotifPopup');
    const notifList = document.getElementById('notifPopupList');

    // 1. Abrir popup al hacer clic en la campana
    if (notificationBtn && notifOverlay) {
        notificationBtn.addEventListener('click', () => {
            notifOverlay.style.display = 'flex';
        });
    }

    // 2. Función para cerrar el popup
    const closeNotifPopup = () => {
        if (notifOverlay) notifOverlay.style.display = 'none';
    };

    // Asignar el cierre a la "X" y al botón "CERRAR"
    if (btnCloseNotif) btnCloseNotif.addEventListener('click', closeNotifPopup);
    if (btnCloseNotif2) btnCloseNotif2.addEventListener('click', closeNotifPopup);

    // 3. Botón para limpiar todas las notificaciones
    if (btnClearNotif && notifList) {
        btnClearNotif.addEventListener('click', () => {
            notifList.innerHTML = '<li class="fr-notif-item"><p class="fr-notif-text" style="text-align:center;">No hay notificaciones nuevas.</p></li>';
        });
    }
});