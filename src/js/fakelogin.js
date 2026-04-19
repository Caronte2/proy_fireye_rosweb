document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById('loginForm');

    loginForm.addEventListener('submit', (e) => {
        // Evitamos que el formulario se envíe realmente al servidor
        e.preventDefault();

        // Obtenemos los valores de los inputs
        const user = document.getElementById('userId').value;
        const pass = document.getElementById('password').value;

        // El "puente": Validamos con un IF
        // Cambia 'admin' y '1234' por lo que tú quieras
        if (user === 'admin' && pass === '1234') {
            alert('¡Acceso concedido! Redirigiendo...');
            
            // Redirigir a la página de configuración que hicimos antes
            window.location.href = "../html/paginaRobot.html"; 
        } else {
            alert('ID o Contraseña incorrectos. Inténtalo de nuevo.');
            
            // Opcional: limpiar los campos si falla
            document.getElementById('password').value = '';
        }
    });
});