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
            `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ` +
            `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
    setInterval(updateTimestamp, 1000);
    updateTimestamp();

    /* ═══════════════════════════════════════════
       2. ÍNDICE DE RIESGO (simulado)
    ═══════════════════════════════════════════ */
    const riskLevels = [
        { label: 'BAJO', angle: -90, color: '#27ae60' },
        { label: 'MODERADO', angle: -45, color: '#d4ac0d' },
        { label: 'ALTO', angle: 0, color: '#e67e22' },
        { label: 'MUY ALTO', angle: 40, color: '#e74c3c' },
        { label: 'EXTREMO', angle: 75, color: '#8e44ad' },
    ];
    const riskNeedle = document.getElementById('riskNeedle');
    const riskLabel = document.getElementById('riskLabel');

    function setRiskLevel(idx) {
        if (!riskNeedle || !riskLabel) return;
        const lvl = riskLevels[idx];
        riskNeedle.setAttribute('transform', `rotate(${lvl.angle},100,100)`);
        riskLabel.textContent = lvl.label;
        riskLabel.style.color = lvl.color;
    }

    setRiskLevel(0);

    /* ═══════════════════════════════════════════
       3. LOG DE ANÁLISIS EN DIRECTO (simulado)
    ═══════════════════════════════════════════ */
    const analysisLog = document.getElementById('analysisLog');

    const logPool = [
        { text: 'Temperatura del suelo actualizada: 23°C.', risk: '' },
        { text: 'Señal de vigilancia estable. Transmitiendo datos.', risk: '' },
        { text: 'Obstáculo identificado. El robot continúa la ruta.', risk: '' },
        { text: 'Batería al 78%. Autonomía calculada: 9 horas.', risk: '' },
        { text: 'Patrulla continuando por Sector Este.', risk: '' },
        { text: 'Zona de pasto seco revisada. Sin anomalías.', risk: '' },
        { text: 'GPS recalibrado. Precisión: ±0.5 m.', risk: '' },
        { text: 'Velocidad de viento: 12 km/h. Ajustando trayectoria.', risk: '' },
    ];

    /* ═══════════════════════════════════════════
       4. POPUP SOS
    ═══════════════════════════════════════════ */
    const sosOverlay = document.getElementById('sosOverlay');
    const btnSos = document.getElementById('btn_sos');
    const btnConfirmar = document.getElementById('btn_confirmar');
    const btnAlarmaSonora = document.getElementById('btn_alarma_sonora');
    const btnCancelar = document.getElementById('btn_cancelar');

    function openSos() { if (sosOverlay) sosOverlay.style.display = 'flex'; }
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
        if (risk === 'med') p.classList.add('log-risk-med');
        analysisLog.appendChild(p);
        analysisLog.scrollTop = analysisLog.scrollHeight;
    }

    /* ═══════════════════════════════════════════
       5. POPUP NOTIFICACIONES
    ═══════════════════════════════════════════ */
    const notifOverlay = document.getElementById('notifOverlay');
    const notifPopupList = document.getElementById('notifPopupList');
    const btnCloseNotif = document.getElementById('btn_closeNotifPopup');
    const btnCloseNotif2 = document.getElementById('btn_closeNotifPopup2');
    const btnClearNotif = document.getElementById('btn_clearNotifPopup');
    const notificationBtn = document.getElementById('notificationBtn');
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

    /* ═══════════════════════════════════════════
       MONITORIZACIÓN Y CÁLCULO DE RIESGO DE IA
    ═══════════════════════════════════════════ */
    // Lista de objetos a buscar para determinar el riesgo (latas y botellas)
    const threatObjects = ['bottle', 'can', 'cup', 'botella', 'lata', 'vaso'];

    // Traducciones de los nombres de los objetos detectados
    const threatTranslations = {
        'bottle': 'Botella',
        'botella': 'Botella',
        'can': 'Lata',
        'lata': 'Lata',
        'cup': 'Lata/Vaso',
        'vaso': 'Vaso'
    };

    let currentRiskIdx = 0;

    async function checkIADetections() {
        // Solo consultar si la IA está activa
        if (typeof window.data === 'undefined' || !window.data.ia_activa) {
            if (currentRiskIdx !== 0) {
                currentRiskIdx = 0;
                setRiskLevel(0);
            }
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/status');
            const result = await response.json();

            if (result.active && result.detections) {
                // Loguear detecciones recibidas para depuración
                console.log('IA Detections (raw):', result.detections);

                // Filtrar las detecciones que están en nuestra lista de amenazas (insensible a mayúsculas/minúsculas y espacios)
                const detectedThreats = result.detections.filter(item => 
                    threatObjects.includes(item.toLowerCase().trim())
                );
                
                console.log('Amenazas filtradas:', detectedThreats);

                // El nivel de riesgo sube 1 nivel por cada objeto detectado de la lista
                // Mapea a: 0 (BAJO), 1 (MODERADO), 2 (ALTO), 3 (MUY ALTO), 4 (EXTREMO)
                const newRiskIdx = Math.min(detectedThreats.length, riskLevels.length - 1);
                console.log('Índice de riesgo calculado:', newRiskIdx, 'Índice actual anterior:', currentRiskIdx);

                if (newRiskIdx !== currentRiskIdx) {
                    const oldLevel = riskLevels[currentRiskIdx].label;
                    const newLevel = riskLevels[newRiskIdx].label;

                    console.log('Cambiando nivel de riesgo a:', newLevel);
                    setRiskLevel(newRiskIdx);

                    if (newRiskIdx > currentRiskIdx) {
                        // El peligro ha aumentado: enviar alerta al chat
                        const namesInSpanish = detectedThreats.map(t => {
                            const key = t.toLowerCase().trim();
                            return threatTranslations[key] || t;
                        }).join(', ');
                        pushNotif(
                            newRiskIdx >= 3 ? 'emergency' : 'error',
                            'PELIGRO DETECTADO',
                            `Objetos detectados: ${namesInSpanish}. Nivel de riesgo sube a ${newLevel}.`
                        );
                        appendLog(`⚠️ RIESGO ELEVADO a ${newLevel} por detección de: ${namesInSpanish}.`, newRiskIdx >= 3 ? 'high' : 'med');
                    } else {
                        // El peligro ha disminuido: notificar reducción
                        pushNotif(
                            'info',
                            'RIESGO REDUCIDO',
                            `Zona despejada. Nivel de riesgo bajó a ${newLevel}.`
                        );
                        appendLog(` Nivel de riesgo estabilizado en ${newLevel}.`, '');
                    }

                    currentRiskIdx = newRiskIdx;
                }
            }
        } catch (error) {
            console.warn('Error al conectar con ia_server para leer detecciones:', error);
        }
    }

    // Polling cada 1.5 segundos para rastrear cambios en tiempo real
    setInterval(checkIADetections, 1500);

    /* ═══════════════════════════════════════════
       6. POSICIÓN DEL ROBOT (ROS2 via rosbridge)
    ═══════════════════════════════════════════ */
    const posXEl = document.getElementById('pos_x');
    const posYEl = document.getElementById('pos_y');
    let rosListenerAttached = false;

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
            const x = msg.pose.pose.position.x;
            const y = msg.pose.pose.position.y;
            if (posXEl) posXEl.textContent = x.toFixed(2);
            if (posYEl) posYEl.textContent = y.toFixed(2);
            updateZoneDisplay(x, y);
        });

        // /robot_position  (geometry_msgs/Point) — topic personalizado opcional
        new ROSLIB.Topic({
            ros: window.data.ros,
            name: '/robot_position',
            messageType: 'geometry_msgs/Point',
        }).subscribe(msg => {
            if (posXEl) posXEl.textContent = msg.x.toFixed(2);
            if (posYEl) posYEl.textContent = msg.y.toFixed(2);
            updateZoneDisplay(msg.x, msg.y);
        });
    }
    setInterval(tryAttachRosListener, 1000);

    /* Inicializar badge */
    updateBadge();

});