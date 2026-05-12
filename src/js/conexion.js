//Cuando carga la página se obtendra los dos botones, donde cada uno tendra una función.
document.addEventListener('DOMContentLoaded', event => {
    console.log("entro en la pagina")

    document.getElementById("btn_con").addEventListener("click", connect)
    document.getElementById("btn_dis").addEventListener("click", disconnect)
    document.getElementById("btn_mision").addEventListener("click", empezarMision);
    document.getElementById("btn_delante").addEventListener("click", movimientoAdelante)
    document.getElementById("btn_atras").addEventListener("click", movimientoAtras)
    document.getElementById("btn_derecha").addEventListener("click", movimientoDerecha)
    document.getElementById("btn_izquierda").addEventListener("click", movimientoIzquierda)
    document.getElementById("btn_parar").addEventListener("click", movimientoParar)

    data = {
        // ros connection
        ros: null,
        rosbridge_address: 'ws://127.0.0.1:9090/',
        connected: false,
	    service_busy: false,
	    service_response: '',
		topic: null,
    	position: {x: 0, y: 0},
		action_client: null,
    	mision_activa: false,
    	mision_goal_handle: null,
    }

	const mapYamlUrl = '../mapas/my_map.yaml'; // poner ubicación
	const mapImageUrl = '../mapas/my_map.png'; 

    function connect(){
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

    	topic.subscribe((message) => {
			console.log("Recibiendo mensaje de /odom")
        	data.position = message.pose.pose.position
        	document.getElementById("pos_x").innerHTML = data.position.x.toFixed(2)
        	document.getElementById("pos_y").innerHTML = data.position.y.toFixed(2)
			robotPosition.x = message.pose.pose.position.x;
			robotPosition.y = message.pose.pose.position.y;
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

    function disconnect(){
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

    	goal.on('feedback', function(feedback) {
        	console.log('[Feedback] ' + feedback.etapa_actual
            + ' — ' + (feedback.progreso * 100).toFixed(0) + '%')
    	})

    	goal.on('result', function(result) {
        	console.log('Resultado: ' + result.mensaje)
    	})

    	goal.send()
	}

    function movimientoAdelante(){
    	data.service_busy = true
	    data.service_response = ''

        //definimos los datos del servicio
	    let service = new ROSLIB.Service({
	        ros: data.ros,
	        name: '/movimiento',
	        serviceType: 'proy_fireye_interfaces/srv/   ',
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

    function movimientoAtras(){
        data.service_busy = true
	    data.service_response = ''

        //definimos los datos del servicio
	    let service = new ROSLIB.Service({
	        ros: data.ros,
	        name: '/movimiento',
	        serviceType: 'proy_fireye_interfaces/srv/   ',
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

    function movimientoDerecha(){
        data.service_busy = true
	    data.service_response = ''

        //definimos los datos del servicio
	    let service = new ROSLIB.Service({
	        ros: data.ros,
	        name: '/movimiento',
	        serviceType: 'proy_fireye_interfaces/srv/   ',
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

    function movimientoIzquierda(){
        data.service_busy = true
	    data.service_response = ''

        //definimos los datos del servicio
	    let service = new ROSLIB.Service({
	        ros: data.ros,
	        name: '/movimiento',
	        serviceType: 'proy_fireye_interfaces/srv/   ',
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

    function movimientoParar(){
        data.service_busy = true
	    data.service_response = ''

        //definimos los datos del servicio
	    let service = new ROSLIB.Service({
	        ros: data.ros,
	        name: '/movimiento',
	        serviceType: 'proy_fireye_interfaces/srv/   ',
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

	let mapInfo = null;
	let canvas = document.getElementById("mapCanvas");
	let ctx = canvas.getContext("2d");
	let image = new Image();
	let robotPosition = {x: 0, y: 0};

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

