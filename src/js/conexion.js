//Cuando carga la página se obtendra los dos botones, donde cada uno tendra una función.
document.addEventListener('DOMContentLoaded', event => {
    console.log("entro en la pagina")

    document.getElementById("btn_con").addEventListener("click", connect)
    document.getElementById("btn_dis").addEventListener("click", disconnect)
    document.getElementById("btn_mision").addEventListener("click", empezarMision);

    data = {
        // ros connection
        ros: null,
        rosbridge_address: 'ws://127.0.0.1:9090/',
        connected: false,
        // service information
	    service_busy: false,
	    service_response: ''
    }

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
    }

    function disconnect(){
	      data.ros.close()
	      data.connected = false
        console.log('Clic en botón de desconexión')
    }

    function empezarMision(){
      let service = new ROSLIB.Service({
        ros : data.ros,
        name : '/iniciar_mision',
        serviceType : 'std_srvs/Trigger', 
      });
    console.log("Clic en botón de iniciar misión");
      service.callService(new ROSLIB.ServiceRequest({}), function(result) {
        console.log('Resultado de la misión: ' + result.message);
      });
    }

});
