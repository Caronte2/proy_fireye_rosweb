// Inicializar el menú cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
    // ========== Elementos del menú principal ==========
    const menuContainer = document.getElementById('mainMenu');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const toggleMenuBtn = document.getElementById('toggleMenuBtn');
    const logoutBtn = document.querySelector('.logout-btn');
    const submenuOptions = document.querySelectorAll('.menu-option.has-submenu');

    // ========== Elementos del menú de notificaciones (reutiliza clase menu-container) ==========
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationMenu = document.getElementById('notificationMenu');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');
    const clearNotificationsBtn = document.getElementById('clearNotificationsBtn');

    // ========== Lógica del menú principal ==========
    // Alternar visibilidad del menú principal (abrir/cerrar)
    function toggleMenu() {
        menuContainer.classList.toggle('open');
        notificationMenu.classList.remove('open'); // Cerrar menú de notificaciones de forma mutua
        // Actualizar texto del botón según estado del menú
        toggleMenuBtn.textContent = menuContainer.classList.contains('open') 
            ? '✕ ' 
            : '☰ ';
    }

    // Cerrar menú principal y restablecer estado
    function closeMenu() {
        menuContainer.classList.remove('open');
        toggleMenuBtn.textContent = '☰ ';
        // Restablecer todos los submenús (cerrarlos)
        submenuOptions.forEach(option => {
            option.classList.remove('open');
            const toggle = option.querySelector('.submenu-toggle');
            toggle.textContent = '+'; // Volver al icono de "+"
        });
    }

    // Inicializar interacción de submenús (abrir/cerrar al hacer clic)
    function initSubmenus() {
        submenuOptions.forEach(option => {
            const header = option.querySelector('.menu-option-header');
            const toggle = option.querySelector('.submenu-toggle');

            header.addEventListener('click', function() {
                // Cerrar otros submenús al abrir uno nuevo
                submenuOptions.forEach(other => {
                    if (other !== option) other.classList.remove('open');
                });
                option.classList.toggle('open'); // Alternar estado del submenú
                toggle.textContent = '+'; 
            });
        });
    }

    // ========== Lógica del menú de notificaciones (misma interacción que menú principal) ==========
    // Alternar visibilidad del menú de notificaciones
    function toggleNotificationMenu() {
        notificationMenu.classList.toggle('open');
        menuContainer.classList.remove('open'); // Cerrar menú principal de forma mutua
        toggleMenuBtn.textContent = '☰ '; // Restablecer texto del botón del menú
    }

    // Cerrar menú de notificaciones
    function closeNotificationMenu() {
        notificationMenu.classList.remove('open');
    }

    // Limpiar todas las notificaciones (confirmación previa)
    function clearNotifications() {
        const notificationList = document.querySelector('.notification-list');
        // Confirmar acción con el usuario
        if (confirm('¿Estás seguro de limpiar todas las notificaciones?')) {
            // Mostrar mensaje cuando no hay notificaciones
            notificationList.innerHTML = `
                <li class="notification-item">
                    <p class="notification-text">No hay notificaciones</p>
                </li>
            `;
        }
    }

    // Cerrar menús al hacer clic fuera de ellos (área vacía de la página)
    document.addEventListener('click', function(e) {
        const isClickInsideMainMenu = menuContainer.contains(e.target);
        const isClickOnMainMenuBtn = toggleMenuBtn === e.target;
        const isClickInsideNotificationMenu = notificationMenu.contains(e.target);
        const isClickOnNotificationBtn = notificationBtn === e.target;

        // Cerrar menú principal si clic fuera
        if (!isClickInsideMainMenu && !isClickOnMainMenuBtn) closeMenu();
        // Cerrar menú de notificaciones si clic fuera
        if (!isClickInsideNotificationMenu && !isClickOnNotificationBtn) closeNotificationMenu();
    });

    // ========== Lógica de cierre de sesión ==========
    logoutBtn.addEventListener('click', function() {
        // Confirmar cierre de sesión con el usuario
        if (confirm('¿Estás seguro de cerrar sesión?')) {
            alert('Sesión cerrada exitosamente'); // Mensaje de confirmación
            closeMenu(); // Cerrar menú principal
            closeNotificationMenu(); // Cerrar menú de notificaciones
        }
    });

    // ========== Asignar eventos a botones ==========
    toggleMenuBtn.addEventListener('click', toggleMenu); // Botón abrir/cerrar menú principal
    closeMenuBtn.addEventListener('click', closeMenu); // Botón cerrar menú principal
    initSubmenus(); // Inicializar submenús

    notificationBtn.addEventListener('click', toggleNotificationMenu); // Botón notificaciones
    closeNotificationBtn.addEventListener('click', closeNotificationMenu); // Botón cerrar notificaciones
    clearNotificationsBtn.addEventListener('click', clearNotifications); // Botón limpiar notificaciones

    // ========== Funciones globales (accesibles desde cualquier lugar) ==========
    // Abrir menú principal (función global)
    window.openMainMenu = function() {
        menuContainer.classList.add('open');
        toggleMenuBtn.textContent = '✕ Cerrar menú';
        closeNotificationMenu(); // Cerrar notificaciones al abrir menú
    };
    // Cerrar menú principal (función global)
    window.closeMainMenu = closeMenu;
    // Cerrar menú de notificaciones (función global)
    window.closeNotificationMenu = closeNotificationMenu;
});