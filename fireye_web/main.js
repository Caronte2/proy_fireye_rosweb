document.addEventListener('DOMContentLoaded', () => {

  let ros = null;
  const status = document.getElementById("status");

  document.getElementById("btn_con").addEventListener("click", connect);
  document.getElementById("btn_dis").addEventListener("click", disconnect);

  function connect() {
      console.log("CLICK connect");
  ros = new ROSLIB.Ros({
    url: 'ws://localhost:9090'
  });

  ros.on('connection', () => {
    console.log("Connected to ROS");
    console.log("CREANDO SUBSCRIBER");
    status.innerText = "Estado: conectado";

    const listener = new ROSLIB.Topic({
      ros: ros,
      name: '/scan',
      messageType: 'sensor_msgs/msg/LaserScan'
    });

    listener.subscribe(function(msg) {
      console.log("Scan recibido:", msg);
    });

  });

  ros.on('error', (error) => {
    console.log("Error:", error);
  });

  ros.on('close', () => {
    console.log("Disconnected");
  });
}

  function disconnect() {
    if (ros) ros.close();
  }

});