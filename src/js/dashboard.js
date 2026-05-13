/**
 * dashboard.js – Fireye Dashboard v2
 *
 * Gestiona (todo simulado salvo la posición del robot):
 *   1. Timestamp en la cámara (cada segundo)
 *   2. Índice de riesgo aleatorio ponderado (cada 8 s)
 *   3. Log de análisis en directo (nuevas entradas cada 12 s)
 *   4. Popup SOS: confirmar / alarma sonora / cancelar
 *   5. Popup de notificaciones (abre al pulsar 🔔, con entradas simuladas)
 *   6. Posición del robot desde ROS2 via rosbridge (/odom o /robot_position)
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ─── utilidad hora actual ─────────────────────── */
    function nowStr() {
        const d = new Date();
        return `[${pad(d.getHours())}:${pad(d.getMinutes())}]`;
    }
    function timeStr() {
        const d = new Date();
        return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
    function pad(n) { return String(n).padStart(2, '0'); }

    /* ═══════════════════════════════════════════
       1. TIMESTAMP CÁMARA
    ═══════════════════════════════════════════ */
    const camTimestamp = document.getElementById('camTimestamp');
    function updateTimestamp() {
        if (!camTimestamp) return;
        const d = new Date();
        camTimestamp.textContent =
            `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()} ` +
            `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    setInterval(updateTimestamp, 1000);
    updateTimestamp();

    /* ═══════════════════════════════════════════
       2. ÍNDICE DE RIESGO (simulado)
    ═══════════════════════════════════════════ */
    const riskLevels = [
        { label: 'BAJO',     angle: -90, color: '#27ae60' },
        { label: 'MODERADO', angle: -45, color: '#d4ac0d' },
        { label: 'ALTO',     angle:   0, color: '#e67e22' },
        { label: 'MUY ALTO', angle:  40, color: '#e74c3c' },
        { label: 'EXTREMO',  angle:  75, color: '#8e44ad' },
    ];
    const riskNeedle = document.getElementById('riskNeedle');
    const riskLabel  = document.getElementById('riskLabel');

    function setRiskLevel(idx) {
        if (!riskNeedle || !riskLabel) return;
        const lvl = riskLevels[idx];
        riskNeedle.setAttribute('transform', `rotate(${lvl.angle},100,100)`);
        riskLabel.textContent = lvl.label;
        riskLabel.style.color = lvl.color;
    }

    function randomRisk() {
        // Pesos: BAJO 40%, MODERADO 30%, ALTO 20%, MUY ALTO 7%, EXTREMO 3%
        const w = [40, 30, 20, 7, 3];
        let r = Math.random() * 100;
        for (let i = 0; i < w.length; i++) { r -= w[i]; if (r <= 0) return i; }
        return 0;
    }

    setRiskLevel(0);
    setInterval(() => setRiskLevel(randomRisk()), 8000);

    /* ═══════════════════════════════════════════
       3. LOG DE ANÁLISIS EN DIRECTO (simulado)
    ═══════════════════════════════════════════ */
    const analysisLog = document.getElementById('analysisLog');

    const logPool = [
        { text: 'Temperatura del suelo actualizada: 23°C.',             risk: '' },
        { text: 'Señal de vigilancia estable. Transmitiendo datos.',     risk: '' },
        { text: 'Objeto detectado en el camino. Analizando imagen...',  risk: 'med' },
        { text: 'Obstáculo identificado. El robot continúa la ruta.',    risk: '' },
        { text: 'Nivel de Riesgo actualizado: Bajo.',                    risk: '' },
        { text: 'Nivel de Riesgo actualizado: Moderado.',                risk: 'med' },
        { text: 'Nivel de Riesgo actualizado: ALTO. Revisando zona.',    risk: 'high' },
        { text: 'Batería al 78%. Autonomía calculada: 9 horas.',         risk: '' },
        { text: 'Patrulla continuando por Sector Este.',                 risk: '' },
        { text: 'Zona de pasto seco revisada. Sin anomalías.',           risk: '' },
        { text: 'GPS recalibrado. Precisión: ±0.5 m.',                  risk: '' },
        { text: 'Posible foco de calor detectado. Comprobando...',       risk: 'high' },
        { text: 'Falsa alarma descartada. Continuando patrulla.',        risk: '' },
        { text: 'Velocidad de viento: 12 km/h. Ajustando trayectoria.', risk: '' },
    ];

    function addLogEntry() {
        if (!analysisLog) return;
        const item = logPool[Math.floor(Math.random() * logPool.length)];
        const p = document.createElement('p');
        p.textContent = `${nowStr()} ${item.text}`;
        if (item.risk === 'high') p.classList.add('log-risk-high');
        if (item.risk === 'med')  p.classList.add('log-risk-med');
        analysisLog.appendChild(p);
        while (analysisLog.children.length > 30) analysisLog.removeChild(analysisLog.firstChild);
        analysisLog.scrollTop = analysisLog.scrollHeight;
    }
    setInterval(addLogEntry, 12000);

    /* ═══════════════════════════════════════════
       4. POPUP SOS
    ═══════════════════════════════════════════ */
    const sosOverlay      = document.getElementById('sosOverlay');
    const btnSos          = document.getElementById('btn_sos');
    const btnConfirmar    = document.getElementById('btn_confirmar');
    const btnAlarmaSonora = document.getElementById('btn_alarma_sonora');
    const btnCancelar     = document.getElementById('btn_cancelar');

    function openSos()  { if (sosOverlay) sosOverlay.style.display = 'flex'; }
    function closeSos() { if (sosOverlay) sosOverlay.style.display = 'none'; }

    btnSos?.addEventListener('click', openSos);
    btnCancelar?.addEventListener('click', closeSos);
    sosOverlay?.addEventListener('click', e => { if (e.target === sosOverlay) closeSos(); });

    btnConfirmar?.addEventListener('click', () => {
        closeSos();
        pushNotif('emergency', 'EMERGENCIA',
            'Protocolo de Emergencia activado. Ubicación e imagen enviadas a Bomberos y Contactos de Confianza.');
        appendLog('🚨 PROTOCOLO DE EMERGENCIA ACTIVADO.', 'high');
        alert('⚠️ Emergencia confirmada. Servicios de emergencia notificados.');
    });

    btnAlarmaSonora?.addEventListener('click', () => {
        closeSos();
        pushNotif('error', 'ALARMA SONORA',
            'El robot ha activado la señal acústica de alta potencia en la finca.');
        appendLog('🔊 Alarma sonora activada en la finca.', 'med');
    });

    function appendLog(text, risk) {
        if (!analysisLog) return;
        const p = document.createElement('p');
        p.textContent = `${nowStr()} ${text}`;
        if (risk === 'high') p.classList.add('log-risk-high');
        if (risk === 'med')  p.classList.add('log-risk-med');
        analysisLog.appendChild(p);
        analysisLog.scrollTop = analysisLog.scrollHeight;
    }

    /* ═══════════════════════════════════════════
       5. POPUP NOTIFICACIONES
    ═══════════════════════════════════════════ */
    const notifOverlay       = document.getElementById('notifOverlay');
    const notifPopupList     = document.getElementById('notifPopupList');
    const btnCloseNotif      = document.getElementById('btn_closeNotifPopup');
    const btnCloseNotif2     = document.getElementById('btn_closeNotifPopup2');
    const btnClearNotif      = document.getElementById('btn_clearNotifPopup');
    const notificationBtn    = document.getElementById('notificationBtn');
    // badge contador
    let notifCount = 2; // las dos iniciales
    const badge = document.createElement('span');
    badge.id = 'notifBadge';
    badge.style.cssText = `
        position:absolute; top:-5px; right:-5px;
        background:#fff; color:var(--red,#870000);
        border-radius:50%; width:18px; height:18px;
        font-size:0.68rem; font-weight:bold;
        display:flex; align-items:center; justify-content:center;
        font-family:Arial,sans-serif; pointer-events:none;
        border:1px solid var(--red,#870000);
    `;
    badge.textContent = notifCount;
    if (notificationBtn) {
        notificationBtn.style.position = 'relative';
        notificationBtn.appendChild(badge);
    }

    function updateBadge() {
        if (!badge) return;
        badge.textContent = notifCount;
        badge.style.display = notifCount > 0 ? 'flex' : 'none';
    }

    function openNotif() {
        if (notifOverlay) notifOverlay.style.display = 'flex';
    }
    function closeNotif() {
        if (notifOverlay) notifOverlay.style.display = 'none';
    }

    notificationBtn?.addEventListener('click', openNotif);
    btnCloseNotif?.addEventListener('click', closeNotif);
    btnCloseNotif2?.addEventListener('click', closeNotif);
    notifOverlay?.addEventListener('click', e => { if (e.target === notifOverlay) closeNotif(); });

    btnClearNotif?.addEventListener('click', () => {
        if (!notifPopupList) return;
        notifPopupList.innerHTML =
            `<li class="fr-notif-item"><p class="fr-notif-text" style="color:#888">No hay notificaciones.</p></li>`;
        notifCount = 0;
        updateBadge();
    });

    /**
     * pushNotif(type, label, text)
     * type: 'emergency' | 'error' | 'info'
     */
    function pushNotif(type, label, text) {
        if (!notifPopupList) return;
        const li = document.createElement('li');
        li.className = `fr-notif-item fr-notif-${type}`;
        li.innerHTML = `
            <span class="fr-notif-label">${label}:</span>
            <p class="fr-notif-text">${text} <em>${timeStr()}</em></p>
        `;
        notifPopupList.insertBefore(li, notifPopupList.firstChild);
        notifCount++;
        updateBadge();
    }

    /* Notificaciones simuladas aleatorias cada ~30 s */
    const randomNotifs = [
        { type: 'info',      label: 'INFO',           text: 'Patrulla completada. Iniciando nuevo ciclo de vigilancia.' },
        { type: 'info',      label: 'INFO',           text: 'Batería al 65%. Continuando operación normal.' },
        { type: 'error',     label: 'AVISO',          text: 'Temperatura del motor elevada. Revisión recomendada.' },
        { type: 'emergency', label: 'ALERTA',         text: 'Objeto no identificado detectado en Sector Sur.' },
        { type: 'info',      label: 'INFO',           text: 'GPS recalibrado correctamente. Precisión óptima.' },
        { type: 'error',     label: 'ERROR DE SENSOR','text': 'Sensor de temperatura suelo desconectado momentáneamente.' },
    ];
    setInterval(() => {
        const n = randomNotifs[Math.floor(Math.random() * randomNotifs.length)];
        pushNotif(n.type, n.label, n.text);
    }, 30000);

    /* ═══════════════════════════════════════════
       6. POSICIÓN DEL ROBOT (ROS2 via rosbridge)
    ═══════════════════════════════════════════ */
    const posXEl = document.getElementById('posX');
    const posYEl = document.getElementById('posY');
    let rosListenerAttached = false;

    function tryAttachRosListener() {
        if (rosListenerAttached) return;
        if (typeof window.data === 'undefined' || !window.data.ros || !window.data.connected) return;
        rosListenerAttached = true;

        // /odom  (nav_msgs/Odometry)
        new ROSLIB.Topic({
            ros: window.data.ros,
            name: '/odom',
            messageType: 'nav_msgs/Odometry',
        }).subscribe(msg => {
            if (posXEl) posXEl.textContent = msg.pose.pose.position.x.toFixed(2);
            if (posYEl) posYEl.textContent = msg.pose.pose.position.y.toFixed(2);
        });

        // /robot_position  (geometry_msgs/Point) — topic personalizado opcional
        new ROSLIB.Topic({
            ros: window.data.ros,
            name: '/robot_position',
            messageType: 'geometry_msgs/Point',
        }).subscribe(msg => {
            if (posXEl) posXEl.textContent = msg.x.toFixed(2);
            if (posYEl) posYEl.textContent = msg.y.toFixed(2);
        });
    }
    setInterval(tryAttachRosListener, 1000);

    /* Inicializar badge */
    updateBadge();

});