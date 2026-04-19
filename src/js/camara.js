//  ejemplo de función (simple para prueba inicial)
function updateCameraFeed() {
  const img = document.getElementById("cameraFeed");
  img.src = `http://localhost:8080/stream?topic=/camera/image_raw`;
  //const timestamp = new Date().getTime(); // Evita caché agregando un timestamp
  //img.src = `http://localhost:8080/stream?topic=/camera/image_raw&t=${timestamp}`;
  //img.src = `http://localhost:8080/stream?topic=/turtlebot3/camera/image_raw&console.log("Cactualizando: http://0.0.0.0:8080/stream?topic=/camera/image_raw)"`
}

updateCameraFeed(); // Llama a la función para actualizar la imagen al cargar la página