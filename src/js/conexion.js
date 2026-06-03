//Cuando carga la página se obtendra los dos botones, donde cada uno tendra una función.
document.addEventListener('DOMContentLoaded', event => {
	console.log("entro en la pagina")

	document.getElementById("btn_con").addEventListener("click", connect)
	document.getElementById("btn_dis").addEventListener("click", disconnect)
	document.getElementById("btn_mision").addEventListener("click", empezarMisionService);
	document.getElementById("btn_delante").addEventListener("click", movimientoAdelante)
	document.getElementById("btn_atras").addEventListener("click", movimientoAtras)
	document.getElementById("btn_derecha").addEventListener("click", movimientoDerecha)
	document.getElementById("btn_izquierda").addEventListener("click", movimientoIzquierda)
	document.getElementById("btn_parar").addEventListener("click", movimientoParar)
	document.getElementById("btn_toggle_ia").addEventListener("click", toggleReconocimientoIA)

	var data = {
		// ros connection
		ros: null,
		rosbridge_address: 'ws://localhost:9090',
		connected: false,
		service_busy: false,
		service_response: '',
		topic: null,
		position: { x: 0, y: 0 },
		action_client: null,
		mision_activa: false,
		mision_goal_handle: null,
		ia_activa: false,
	};
	window.data = data;

	const mapYamlUrl = '../mapas/my_map.yaml'; // poner ubicación
	const mapImageUrl = '../mapas/my_map.png';

	function connect() {
		console.log("Clic en connect")

		data.ros = new ROSLIB.Ros({
			url: data.rosbridge_address
		})

		// Define callbacks
		data.ros.on("connection", () => {
			data.connected = true
			console.log("Conexion con ROSBridge correcta")
		})
		data.ros.on("error", (error) => {
			console.log("Se ha producido algun error mientras se intentaba realizar la conexion")
			console.log(error)
		})
		data.ros.on("close", () => {
			data.connected = false
			console.log("Conexion con ROSBridge cerrada")
		})

		let topic = new ROSLIB.Topic({
			ros: data.ros,
			name: '/odom',
			messageType: 'nav_msgs/msg/Odometry'
		})

		let lastOdomTime = 0;
		const odomSampleInterval = 500; // actualizar cada 500ms

		topic.subscribe((message) => {
			const now = Date.now();
			if (now - lastOdomTime < odomSampleInterval) return;
			lastOdomTime = now;

			console.log("Recibiendo mensaje de /odom")
			data.position = message.pose.pose.position
			document.getElementById("pos_x").innerHTML = data.position.x.toFixed(2)
			document.getElementById("pos_y").innerHTML = data.position.y.toFixed(2)
			robotPosition.x = message.pose.pose.position.x;
			robotPosition.y = message.pose.pose.position.y;
			updateZoneDisplay(data.position.x, data.position.y);
			draw()  // redibuja mapa + posición del robot
		})
	}

	// Función para redibujar mapa y robot
	function draw() {
		if (!mapInfo || !image.complete) return;

		// Redibujar el mapa
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(image, 0, 0);

		// Transformar coordenadas ROS -> imagen
		const res = mapInfo.resolution;
		const origin = mapInfo.origin;

		// Transformar odom -> pixeles
		let pixelX = (robotPosition.x - origin[0]) / res;
		let pixelY = canvas.height - ((robotPosition.y - origin[1]) / res); // invertido en Y

		// Dibujar robot
		ctx.beginPath();
		ctx.fillStyle = 'green';
		ctx.arc(pixelX, pixelY, 5, 0, 2 * Math.PI);
		ctx.fill();
	}

	function updateZoneDisplay(x, y) {
		const el = document.getElementById("pos_zone");
		if (!el) return;
		if (x < 0.5 && y >= 0.5) {
			el.textContent = "Zona delantera";
			el.style.color = "#2ecc71";
		} else if (x >= 0.5 && y >= 0.5) {
			el.textContent = "Zona de árboles";
			el.style.color = "#27ae60";
		} else if (x < 0.5 && y < 0.5) {
			el.textContent = "Zona trasera";
			el.style.color = "#e67e22";
		} else {
			el.textContent = "Zona descampado";
			el.style.color = "#9b59b6";
		}
	}

	function disconnect() {
		data.ros.close()
		data.connected = false
		console.log('Clic en botón de desconexión')
	}

	//Serivicios
	function empezarMision() {
		if (!data.connected) {
			console.warn('No hay conexión con ROS.')
			return
		}

		console.log('Enviando misión: inspeccion_a')

		const actionClient = new ROSLIB.ActionClient({
			ros: data.ros,
			serverName: '/ejecutar_mision',
			actionName: 'proy_fireye_interfaces/action/Mision'
		})

		const goal = new ROSLIB.Goal({
			actionClient: actionClient,
			goalMessage: {
				nombre_ruta: 'inspeccion_a'
			}
		})

		goal.on('feedback', function (feedback) {
			console.log('[Feedback] ' + feedback.etapa_actual
				+ ' — ' + (feedback.progreso * 100).toFixed(0) + '%')
		})

		goal.on('result', function (result) {
			console.log('Resultado: ' + result.mensaje)
		})

		goal.send()
	}

	function empezarMisionService() {
		if (!data.connected) {
			console.warn('No hay conexión con ROS.')
			alert('No hay conexión con ROSBridge.')
			return
		}

		if (data.service_busy) {
			console.warn('Ya hay un servicio en curso.')
			return
		}

		console.log('Llamando al servicio /fireye/start_mission...')

		data.service_busy = true
		data.service_response = ''

		const startMissionService = new ROSLIB.Service({
			ros: data.ros,
			name: '/fireye/start_mission',
			serviceType: 'std_srvs/srv/Trigger'
		})

		const request = new ROSLIB.ServiceRequest({})

		startMissionService.callService(request, (result) => {
			data.service_busy = false
			data.service_response = JSON.stringify(result)

			console.log('Respuesta de /fireye/start_mission:', result)

			if (result.success) {
				alert('Misión completada correctamente: ' + result.message)
			} else {
				alert('Error en la misión: ' + result.message)
			}

		}, (error) => {
			console.error('Error llamando a /fireye/start_mission:', error)
			alert('Error llamando a /fireye/start_mission: ' + error)
		}, 30000)
	}


	function movimientoAdelante() {
		data.service_busy = true
		data.service_response = ''

		//definimos los datos del servicio
		let service = new ROSLIB.Service({
			ros: data.ros,
			name: '/movimiento',
			serviceType: 'proy_fireye_interfaces/srv/MiMovimientoMsg',
		})

		let request = new ROSLIB.ServiceRequest({
			move: 'delante'
		})

		service.callService(request, (result) => {
			data.service_busy = false
			data.service_response = JSON.stringify(result)
		}, (error) => {
			data.service_busy = false
			console.error(error)
		})
	}

	function movimientoAtras() {
		data.service_busy = true
		data.service_response = ''

		//definimos los datos del servicio
		let service = new ROSLIB.Service({
			ros: data.ros,
			name: '/movimiento',
			serviceType: 'proy_fireye_interfaces/srv/MiMovimientoMsg',
		})

		let request = new ROSLIB.ServiceRequest({
			move: 'atras'
		})

		service.callService(request, (result) => {
			data.service_busy = false
			data.service_response = JSON.stringify(result)
		}, (error) => {
			data.service_busy = false
			console.error(error)
		})
	}

	function movimientoDerecha() {
		data.service_busy = true
		data.service_response = ''

		//definimos los datos del servicio
		let service = new ROSLIB.Service({
			ros: data.ros,
			name: '/movimiento',
			serviceType: 'proy_fireye_interfaces/srv/MiMovimientoMsg',
		})

		let request = new ROSLIB.ServiceRequest({
			move: 'derecha'
		})

		service.callService(request, (result) => {
			data.service_busy = false
			data.service_response = JSON.stringify(result)
		}, (error) => {
			data.service_busy = false
			console.error(error)
		})
	}

	function movimientoIzquierda() {
		data.service_busy = true
		data.service_response = ''

		//definimos los datos del servicio
		let service = new ROSLIB.Service({
			ros: data.ros,
			name: '/movimiento',
			serviceType: 'proy_fireye_interfaces/srv/MiMovimientoMsg',
		})

		let request = new ROSLIB.ServiceRequest({
			move: 'izquierda'
		})

		service.callService(request, (result) => {
			data.service_busy = false
			data.service_response = JSON.stringify(result)
		}, (error) => {
			data.service_busy = false
			console.error(error)
		})
	}

	function movimientoParar() {
		data.service_busy = true
		data.service_response = ''

		//definimos los datos del servicio
		let service = new ROSLIB.Service({
			ros: data.ros,
			name: '/movimiento',
			serviceType: 'proy_fireye_interfaces/srv/MiMovimientoMsg',
		})

		let request = new ROSLIB.ServiceRequest({
			move: 'parar'
		})

		service.callService(request, (result) => {
			data.service_busy = false
			data.service_response = JSON.stringify(result)
		}, (error) => {
			data.service_busy = false
			console.error(error)
		})
	}

	// Código de ayuda para cargar canvas y marcar robot en el mapa

	/* ═══════════════════════════════════════════
	   RECONOCIMIENTO IA – Toggle vía servidor Flask + ROSBridge (opcional)
	═══════════════════════════════════════════ */

	// URL base del servidor Python de IA (Flask con YOLO + webcam)
	const IA_SERVER = 'http://127.0.0.1:5000';

	// Envía POST al servidor Flask para activar/desactivar la inferencia YOLO,
	// y opcionalmente notifica al robot vía ROSBridge si está conectado.
	function toggleReconocimientoIA() {
		console.log('Se pulsó el botón de reconocimiento IA. Servidor:', IA_SERVER, 'Estado local previo:', data.ia_activa);
		// Enviar POST al servidor Flask para cambiar el estado de la inferencia
		fetch(`${IA_SERVER}/toggle`, { method: 'POST' })
			.then(res => {
				console.log('Respuesta cruda recibida de /toggle:', res);
				return res.json();
			})
			.then(result => {
				console.log('Respuesta parseada de /toggle:', result);
				data.ia_activa = result.active;
				updateIaUI();

				// Si ROSBridge está conectado, notificar también al robot
				if (data.connected) {
					const iaService = new ROSLIB.Service({
						ros: data.ros,
						name: '/fireye/activate_ia',
						serviceType: 'std_srvs/srv/SetBool'
					});
					const request = new ROSLIB.ServiceRequest({ data: result.active });
					iaService.callService(request, (r) => {
						console.log('ROSBridge notificado:', r);
					}, (err) => {
						console.warn('ROSBridge no pudo notificar (no crítico):', err);
					});
				}
			})
			.catch(err => {
				// Si el servidor Flask no está corriendo, informar al usuario
				console.error('Error conectando con el servidor de IA:', err);
				alert('No se pudo conectar con el servidor de IA.\nAsegúrate de que ia_server.py está corriendo en ' + IA_SERVER);
			});
	}

	// Actualiza todos los elementos visuales del panel de IA según el estado actual
	function updateIaUI() {
		// Referencias a los elementos del DOM que se van a modificar
		const btn = document.getElementById('btn_toggle_ia');
		const placeholder = document.getElementById('iaPlaceholder');
		const feed = document.getElementById('detectionFeed');
		const overlay = document.getElementById('iaDetectionOverlay');
		const log = document.getElementById('analysisLog');

		if (data.ia_activa) {
			// Ocultar el panel de espera y mostrar el stream MJPEG del servidor Flask
			placeholder.classList.add('hidden');
			feed.src = `${IA_SERVER}/video_feed`;
			feed.style.display = 'block';
			overlay.style.display = 'flex';

			// Cambiar el botón a estado activo (verde con brillo)
			btn.classList.add('fr-btn-ia-active');
			btn.innerHTML = '<i class="bi bi-eye-fill"></i> Desactivar Reconocimiento';

			// Añadir entrada al log de análisis en directo
			if (log) {
				const p = document.createElement('p');
				const d = new Date();
				const ts = `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}]`;
				p.textContent = `${ts} Reconocimiento IA activado. Procesando flujo de vídeo...`;
				p.classList.add('log-risk-med');
				log.appendChild(p);
				log.scrollTop = log.scrollHeight; // Desplaza el log al final
			}
		} else {
			// Volver a mostrar el panel de espera y cortar el stream de vídeo
			placeholder.classList.remove('hidden');
			feed.style.display = 'none';
			feed.src = ''; // Vaciar el src detiene la petición HTTP al servidor de vídeo
			overlay.style.display = 'none';

			// Devolver el botón a su estado inactivo
			btn.classList.remove('fr-btn-ia-active');
			btn.innerHTML = '<i class="bi bi-eye"></i> Activar Reconocimiento';

			// Añadir entrada al log de análisis en directo
			if (log) {
				const p = document.createElement('p');
				const d = new Date();
				const ts = `[${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}]`;
				p.textContent = `${ts} Reconocimiento IA desactivado.`;
				log.appendChild(p);
				log.scrollTop = log.scrollHeight; // Desplaza el log al final
			}
		}
	}

	let mapInfo = null;
	let canvas = document.getElementById("mapCanvas");
	let ctx = canvas.getContext("2d");
	let image = new Image();
	let robotPosition = { x: 0, y: 0 };

	// Leer YAML del mapa
	fetch(mapYamlUrl)
		.then(response => response.text())
		.then(yamlText => {
			const doc = jsyaml.load(yamlText);
			mapInfo = doc;
			image.src = mapImageUrl;
		});

	// Dibujar mapa una vez cargada la imagen
	image.onload = () => {
		canvas.width = image.width;
		canvas.height = image.height;
		ctx.drawImage(image, 0, 0);
	};

	// Función para redibujar mapa y robot
	function draw() {
		if (!mapInfo || !image.complete) return;

		// Redibujar el mapa
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(image, 0, 0);

		// Transformar coordenadas ROS -> imagen
		const res = mapInfo.resolution;
		const origin = mapInfo.origin;

		// Transformar odom -> pixeles
		let pixelX = (robotPosition.x - origin[0]) / res;
		let pixelY = canvas.height - ((robotPosition.y - origin[1]) / res); // invertido en Y

		// Dibujar robot
		ctx.beginPath();
		ctx.fillStyle = 'green';
		ctx.arc(pixelX, pixelY, 5, 0, 2 * Math.PI);
		ctx.fill();
	}

});

