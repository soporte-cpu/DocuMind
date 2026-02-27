const API_BASE = window.location.origin;
let currentSessionId = localStorage.getItem('documind_session') || `session_${Date.now()}`;
let areas = [];
let currentArea = null;
let currentUser = null;

// Auth Helper
async function authFetch(url, options = {}) {
    const token = localStorage.getItem('documind_token');
    if (!options.headers) options.headers = {};
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(url, options);

    if (res.status === 401 || res.status === 403) {
        logout();
        throw new Error("No autorizado");
    }
    return res;
}

function logout() {
    localStorage.removeItem('documind_token');
    localStorage.removeItem('documind_session');
    document.getElementById('view-login').style.display = 'flex';
    document.getElementById('view-login').style.opacity = '1';
}

// Selectores
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const historyContainer = document.getElementById('history-container');
const chatAreaSelector = document.getElementById('chat-area-selector');
const kAreaList = document.getElementById('k-area-list');
const kFileGrid = document.getElementById('k-file-grid');

document.addEventListener('DOMContentLoaded', async () => {
    localStorage.setItem('documind_session', currentSessionId);

    // Mobile Menu Toggle Logic (JS-driven for reliability)
    const menuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');

    function applyMobileLayout() {
        if (window.innerWidth <= 768) {
            // Show the hamburger button
            if (menuBtn) menuBtn.style.display = 'block';
        } else {
            // Desktop: hide button, ensure sidebar is visible
            if (menuBtn) menuBtn.style.display = 'none';
            if (sidebar) {
                sidebar.classList.remove('open');
                sidebar.style.left = '';
            }
        }
    }

    if (menuBtn && sidebar) {
        menuBtn.onclick = () => {
            sidebar.classList.toggle('open');
        };
        // Close sidebar when tapping outside
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 &&
                sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                e.target !== menuBtn) {
                sidebar.classList.remove('open');
            }
        });
    }

    applyMobileLayout();
    window.addEventListener('resize', applyMobileLayout);

    if (!localStorage.getItem('documind_token')) {
        document.getElementById('view-login').style.display = 'flex';
    } else {
        await initApp();
    }
    setupAutoResize();
});

async function initApp() {
    try {
        const res = await authFetch(`${API_BASE}/me`);
        currentUser = await res.json();
        document.getElementById('view-login').style.opacity = '0';
        setTimeout(() => document.getElementById('view-login').style.display = 'none', 500);

        // Aplicar clase de admin al body para mostrar elementos admin-only
        if (currentUser.role === 'admin') {
            document.body.classList.add('is-admin');
        } else {
            document.body.classList.remove('is-admin');
        }

        await loadAreas();
        loadHistory();
        loadChat(currentSessionId);
    } catch (e) {
        logout();
    }
}

// User Management Functions
async function loadUsers() {
    try {
        const res = await authFetch(`${API_BASE}/users`);
        const users = await res.json();
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';

        users.forEach(u => {
            const tr = document.createElement('tr');
            const statusClass = u.is_active ? 'active' : 'inactive';
            const statusText = u.is_active ? 'Activo' : 'Inactivo';

            tr.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div class="user-avatar-small">${u.full_name ? u.full_name.charAt(0).toUpperCase() : u.username.charAt(0).toUpperCase()}</div>
                        <div style="font-weight:600;">${u.full_name || 'Sin nombre'}</div>
                    </div>
                </td>
                <td class="text-secondary">${u.username}</td>
                <td class="text-secondary" style="font-size:0.85rem;">${u.email || '-'}</td>
                <td><span class="role-badge ${u.role}">${u.role.toUpperCase()}</span></td>
                <td>
                    <span class="status-indicator ${statusClass}"></span>
                    <span style="font-size:0.85rem;">${statusText}</span>
                </td>
                <td>
                    <div style="display:flex; gap:8px;">
                        <button class="btn-icon-sm" onclick="openEditUserModal(${JSON.stringify(u).replace(/"/g, '&quot;')})" title="Editar">✏️</button>
                        <button class="btn-icon-sm" onclick="openChangePasswordModal(${u.id}, '${u.username}')" title="Contraseña">🔑</button>
                        <button class="btn-icon-sm" style="color:#ef4444;" onclick="deleteUser(${u.id})" title="Eliminar">🗑️</button>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (e) { console.error(e); }
}

function openCreateUserModal() {
    document.getElementById('user-modal-title').innerText = 'Nuevo Usuario';
    document.getElementById('user-id-edit').value = '';
    document.getElementById('user-fullname-input').value = '';
    document.getElementById('user-name-input').value = '';
    document.getElementById('user-email-input').value = '';
    document.getElementById('user-pass-input').value = '';
    document.getElementById('pwd-field-container').style.display = 'block';
    document.getElementById('user-role-input').value = 'viewer';
    document.getElementById('user-active-input').checked = true;
    document.getElementById('user-save-btn').innerText = 'Crear Usuario';
    document.getElementById('user-modal').style.display = 'flex';
}

function openEditUserModal(user) {
    document.getElementById('user-modal-title').innerText = 'Editar Usuario';
    document.getElementById('user-id-edit').value = user.id;
    document.getElementById('user-fullname-input').value = user.full_name || '';
    document.getElementById('user-name-input').value = user.username;
    document.getElementById('user-email-input').value = user.email || '';
    document.getElementById('pwd-field-container').style.display = 'none'; // No se cambia pass aquí
    document.getElementById('user-role-input').value = user.role;
    document.getElementById('user-active-input').checked = user.is_active === 1;
    document.getElementById('user-save-btn').innerText = 'Guardar Cambios';
    document.getElementById('user-modal').style.display = 'flex';
}

function openChangePasswordModal(id, username) {
    document.getElementById('pwd-user-id').value = id;
    document.getElementById('pwd-user-target').innerText = `Usuario: ${username}`;
    document.getElementById('new-password-input').value = '';
    document.getElementById('password-modal').style.display = 'flex';
}

function closeUserModal() { document.getElementById('user-modal').style.display = 'none'; }

async function saveUser() {
    const id = document.getElementById('user-id-edit').value;
    const userData = {
        full_name: document.getElementById('user-fullname-input').value,
        username: document.getElementById('user-name-input').value,
        email: document.getElementById('user-email-input').value,
        role: document.getElementById('user-role-input').value,
        is_active: document.getElementById('user-active-input').checked ? 1 : 0
    };

    if (!id) {
        userData.password = document.getElementById('user-pass-input').value;
        if (!userData.username || !userData.password) return alert("Usuario y contraseña requeridos");
    }

    try {
        const method = id ? 'PATCH' : 'POST';
        const url = id ? `${API_BASE}/users/${id}` : `${API_BASE}/users`;

        const res = await authFetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (res.ok) {
            closeUserModal();
            loadUsers();
        } else {
            const data = await res.json();
            alert(data.detail || "Error en la operación");
        }
    } catch (e) { console.error(e); }
}

async function confirmPasswordChange() {
    const id = document.getElementById('pwd-user-id').value;
    const password = document.getElementById('new-password-input').value;
    if (!password) return alert("Ingresa la nueva contraseña");

    try {
        const res = await authFetch(`${API_BASE}/users/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            alert("Contraseña actualizada correctamente");
            document.getElementById('password-modal').style.display = 'none';
        } else {
            const data = await res.json();
            alert(data.detail || "Error al actualizar");
        }
    } catch (e) { console.error(e); }
}

async function deleteUser(id) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
        const res = await authFetch(`${API_BASE}/users/${id}`, { method: 'DELETE' });
        if (res.ok) loadUsers();
        else {
            const data = await res.json();
            alert(data.detail || "Error al eliminar");
        }
    } catch (e) { console.error(e); }
}

async function handleLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const err = document.getElementById('login-error');

    if (!user || !pass) return;

    try {
        const formData = new FormData();
        formData.append('username', user);
        formData.append('password', pass);

        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            const data = await res.json();
            localStorage.setItem('documind_token', data.access_token);
            await initApp();
        } else {
            let errorMessage = "Error al iniciar sesión";
            try {
                const data = await res.json();
                errorMessage = data.detail || errorMessage;
            } catch (e) { }

            err.innerHTML = `<span style="font-size:1.1rem; margin-right:8px;">⚠️</span> ${errorMessage}`;
            err.style.display = 'block';

            // Animación de sacudida para feedback táctil-visual
            const card = document.querySelector('.login-card');
            card.style.animation = 'none';
            void card.offsetWidth; // Trigger reflow
            card.style.animation = 'shake 0.4s cubic-bezier(.36,.07,.19,.97) both';
        }
    } catch (e) {
        err.innerHTML = `<span style="font-size:1.1rem; margin-right:8px;">📡</span> Sin conexión con el servidor`;
        err.style.display = 'block';
    }
}

// View Management
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(v => v.classList.remove('active'));

    document.getElementById(`view-${viewName}`).classList.add('active');
    const navItem = document.getElementById(`nav-${viewName}`);
    if (navItem) navItem.classList.add('active');

    if (viewName === 'knowledge') loadAreas();
    if (viewName === 'users') loadUsers();
}

async function loadAreas() {
    try {
        const res = await authFetch(`${API_BASE}/areas`);
        areas = await res.json();

        chatAreaSelector.innerHTML = '<option value="">🏢 Todas las Áreas</option>';
        kAreaList.innerHTML = '';

        areas.forEach(a => {
            const opt = document.createElement('option');
            opt.value = a.name;
            opt.textContent = `${a.icon} ${a.name}`;
            chatAreaSelector.appendChild(opt);

            const card = document.createElement('div');
            card.className = `area-card ${currentArea?.id === a.id ? 'active' : ''}`;
            card.innerHTML = `
                <span class="area-icon">${a.icon}</span> 
                <span class="area-name">${a.name}</span>
                <button class="delete-area-btn" onclick="event.stopPropagation(); deleteArea(${a.id})">×</button>
            `;
            card.onclick = () => selectArea(a);
            kAreaList.appendChild(card);
        });

        if (!currentArea && areas.length > 0) {
            const procArea = areas.find(a => a.name === "Procedimientos Técnicos");
            selectArea(procArea || areas[0]);
        }
    } catch (e) { console.error("Areas fail:", e); }
}

function selectArea(area) {
    currentArea = area;
    document.querySelectorAll('.area-card').forEach(c => c.classList.remove('active'));
    const cards = document.querySelectorAll('.area-card');
    const idx = areas.findIndex(a => a.id === area.id);
    if (cards[idx]) cards[idx].classList.add('active');

    document.getElementById('current-area-icon').textContent = area.icon;
    document.getElementById('current-area-name').textContent = area.name;
    loadFilesForArea(area.name);
    loadAreaIntelligence(area.name);
}

async function loadAreaIntelligence(areaName) {
    const container = document.getElementById('area-intelligence-container');
    const summaryText = document.getElementById('area-summary-text');
    const topicsList = document.getElementById('area-topics-list');
    const questionsList = document.getElementById('area-questions-list');

    // Reset UI
    container.style.display = 'block';
    summaryText.innerHTML = '<span class="loading-dots">Generando resumen estratégico...</span>';
    topicsList.innerHTML = '';
    questionsList.innerHTML = '';

    try {
        const res = await authFetch(`${API_BASE}/areas/${encodeURIComponent(areaName)}/summary`);
        const data = await res.json();

        summaryText.innerText = data.summary || "No se pudo generar el resumen.";

        if (data.topics) {
            data.topics.forEach(t => {
                const badge = document.createElement('span');
                badge.className = 'intel-tag';
                badge.innerText = `# ${t}`;
                topicsList.appendChild(badge);
            });
        }

        if (data.questions) {
            data.questions.forEach(q => {
                const btn = document.createElement('button');
                btn.className = 'intel-question-btn';
                btn.innerText = q;
                btn.onclick = () => {
                    switchView('chat');
                    chatAreaSelector.value = areaName;
                    userInput.value = q;
                    userInput.focus();
                    // Opcional: auto-enviar
                    // sendMessage();
                };
                questionsList.appendChild(btn);
            });
        }
    } catch (e) {
        console.error("Intel fail:", e);
        summaryText.innerText = "Panel de inteligencia no disponible en este momento.";
    }
}

async function loadFilesForArea(areaName) {
    try {
        const res = await authFetch(`${API_BASE}/files`);
        const allFiles = await res.json();
        const filtered = allFiles.filter(f => f.area === areaName);

        kFileGrid.innerHTML = '';
        filtered.forEach(f => {
            const ext = f.name.split('.').pop().toUpperCase();
            const card = document.createElement('div');
            card.className = 'file-card';
            card.setAttribute('data-ext', ext);
            card.innerHTML = `
                <div class="file-card-actions">
                    <button class="file-action-btn dl" onclick="downloadFile('${f.area}', '${f.name}')" title="Descargar">⬇️</button>
                    <button class="file-action-btn del is-admin-only" onclick="deleteFile('${f.area}', '${f.name}')" title="Borrar">×</button>
                </div>
                <div class="file-icon-box">
                    <span class="file-tag">${ext}</span>
                </div>
                <span class="file-name" title="${f.name}">${f.name}</span>
            `;
            kFileGrid.appendChild(card);
        });

        if (filtered.length === 0) {
            kFileGrid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:100px; color:#94a3b8;">No hay documentos en este área.</div>';
        }
    } catch (e) { console.error(e); }
}

function openCreateAreaModal() {
    document.getElementById('area-modal-title').textContent = "Nueva Área";
    document.getElementById('area-name-input').value = "";
    document.getElementById('area-icon-input').value = "📁";
    document.getElementById('area-modal').style.display = 'flex';
}

function closeAreaModal() { document.getElementById('area-modal').style.display = 'none'; }

async function saveArea() {
    const name = document.getElementById('area-name-input').value;
    const icon = document.getElementById('area-icon-input').value;
    if (!name) return;
    try {
        const res = await authFetch(`${API_BASE}/areas?name=${encodeURIComponent(name)}&icon=${encodeURIComponent(icon)}`, { method: 'POST' });
        if (res.ok) {
            closeAreaModal();
            await loadAreas();
        }
    } catch (e) { console.error(e); }
}

async function uploadToCurrentArea(files) {
    if (!currentArea || files.length === 0) return;

    const panel = document.getElementById('upload-progress-panel');
    const statusText = document.getElementById('progress-status-text');
    const barFill = document.getElementById('progress-bar-fill');
    const fileList = document.getElementById('progress-file-list');

    panel.style.display = 'flex';
    fileList.innerHTML = '';
    barFill.style.width = '0%';
    document.getElementById('progress-percentage').innerText = '0%';
    statusText.innerText = `Subiendo ${files.length} archivo(s)...`;

    let uploadedCount = 0;
    const uploadFile = async (file) => {
        const item = document.createElement('li');
        item.className = 'progress-file-item';
        item.innerHTML = `<span>${file.name}</span><span class="file-status">⏳</span>`;
        fileList.appendChild(item);

        const formData = new FormData();
        formData.append('file', file);
        let url = `${API_BASE}/upload?area=${encodeURIComponent(currentArea.name)}`;
        if (file.webkitRelativePath) {
            const relPath = file.webkitRelativePath;
            const subfolder = relPath.substring(0, relPath.lastIndexOf('/'));
            if (subfolder) url += `&subfolder=${encodeURIComponent(subfolder)}`;
        }

        try {
            const res = await authFetch(url, { method: 'POST', body: formData });
            if (res.ok) {
                item.querySelector('.file-status').innerHTML = '✅';
                uploadedCount++;
                const pct = Math.round((uploadedCount / files.length) * 100);
                barFill.style.width = `${pct}%`;
                document.getElementById('progress-percentage').innerText = `${pct}%`;
            } else {
                const data = await res.json();
                item.querySelector('.file-status').innerHTML = '❌';
                item.title = data.detail || "Error de servidor";
            }
        } catch (e) {
            item.querySelector('.file-status').innerHTML = '⚠️';
            item.title = e.message || "Error de red";
        }
    };

    // Subida paralela controlada (máximo 3 al mismo tiempo para no saturar)
    const queue = Array.from(files);
    const workers = Array.from({ length: Math.min(3, queue.length) }, async () => {
        while (queue.length > 0) {
            await uploadFile(queue.shift());
        }
    });

    await Promise.all(workers);

    // Iniciar indexación una sola vez al terminar todo el lote
    statusText.innerText = "Registrando cambios...";
    try {
        await authFetch(`${API_BASE}/index`, { method: 'POST' });
    } catch (e) {
        console.error("Fallo al pedir indexación:", e);
    }

    // Iniciar polling de indexación
    statusText.innerText = "Indexando documentos (RAG)...";
    checkIndexingStatus();
}

async function checkIndexingStatus() {
    const statusText = document.getElementById('progress-status-text');
    const panel = document.getElementById('upload-progress-panel');
    const barFill = document.getElementById('progress-bar-fill');

    try {
        const res = await authFetch(`${API_BASE}/indexing-status`);
        const data = await res.json();

        if (data.is_indexing) {
            // Seguir esperando
            setTimeout(checkIndexingStatus, 2000);
        } else {
            // Finalizado
            statusText.innerText = "¡Todo listo! Índice actualizado.";
            barFill.style.width = '100%';
            loadFilesForArea(currentArea.name);

            setTimeout(() => {
                panel.style.display = 'none';
            }, 3000);
        }
    } catch (e) {
        console.error("Status check fail:", e);
        panel.style.display = 'none';
        loadFilesForArea(currentArea.name);
    }
}

async function deleteFile(area, filename) {
    if (!confirm("¿Eliminar archivo?")) return;
    await authFetch(`${API_BASE}/files/${encodeURIComponent(area)}/${encodeURIComponent(filename)}`, { method: 'DELETE' });
    loadFilesForArea(area);
}

async function deleteArea(areaId) {
    if (!confirm("¿Eliminar este espacio por completo? Se borrarán todos los archivos dentro.")) return;
    try {
        const res = await authFetch(`${API_BASE}/areas/${areaId}`, { method: 'DELETE' });
        if (res.ok) {
            currentArea = null;
            await loadAreas();
        }
    } catch (e) { console.error("Error al borrar área:", e); }
}

async function reprocessDocuments() {
    if (!confirm("Esto borrará el índice actual y volverá a leer TODOS los documentos físicos para aplicar las mejoras de precisión. ¿Continuar?")) return;

    const panel = document.getElementById('upload-progress-panel');
    const statusText = document.getElementById('progress-status-text');
    const barFill = document.getElementById('progress-bar-fill');
    const fileList = document.getElementById('upload-file-list');

    panel.style.display = 'block';
    statusText.innerText = "Iniciando reprocesamiento integral...";
    barFill.style.width = '10%';
    fileList.innerHTML = '<li>Limpiando índices antiguos...</li>';

    try {
        const res = await authFetch(`${API_BASE}/reprocess`, { method: 'POST' });
        if (res.ok) {
            statusText.innerText = "Reprocesando archivos físicos...";
            checkIndexingStatus();
        } else {
            const data = await res.json();
            alert("Error: " + (data.detail || "No se pudo iniciar."));
            panel.style.display = 'none';
        }
    } catch (e) {
        console.error(e);
        panel.style.display = 'none';
    }
}

function downloadFile(area, name) {
    const token = localStorage.getItem('documind_token');
    if (!token) {
        alert("Su sesión ha expirado.");
        return;
    }
    const encodedArea = encodeURIComponent(area);
    const encodedName = encodeURIComponent(name);
    const url = `${API_BASE}/document/download/${encodedArea}/${encodedName}?token=${token}`;
    window.open(url, '_blank');
}

// Chat functions
async function loadHistory() {
    try {
        const res = await authFetch(`${API_BASE}/history`);
        const history = await res.json();
        historyContainer.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = `history-item ${item.session_id === currentSessionId ? 'active' : ''}`;
            div.innerHTML = `
                <span class="history-name" title="${item.title}">${item.title}</span>
                <button class="delete-chat-btn" onclick="event.stopPropagation(); deleteHistoryItem('${item.session_id}')">✕</button>
            `;
            div.onclick = () => switchChat(item.session_id);
            historyContainer.appendChild(div);
        });
    } catch (e) { console.error(e); }
}

async function deleteHistoryItem(sid) {
    if (!confirm("¿Eliminar esta conversación?")) return;
    try {
        const res = await authFetch(`${API_BASE}/history/${sid}`, { method: 'DELETE' });
        if (res.ok || res.status === 404) {
            if (currentSessionId === sid) {
                currentSessionId = `session_${Date.now()}`;
                localStorage.setItem('documind_session', currentSessionId);
                chatBox.innerHTML = '<div class="message-bubble assistant"><div class="bubble-avatar">DM</div><div class="bubble-content">Sesión eliminada. ¿En qué puedo ayudarte?</div></div>';
            }
            await loadHistory();
        } else {
            console.error("Error del servidor al borrar chat:", res.status);
            alert("No se pudo eliminar el chat. Intente de nuevo.");
        }
    } catch (e) {
        console.error("Error al borrar chat:", e);
    }
}

function switchChat(sid) {
    currentSessionId = sid;
    localStorage.setItem('documind_session', sid);
    loadChat(sid);
    loadHistory();
}

document.getElementById('new-chat-btn').onclick = () => {
    currentSessionId = `session_${Date.now()}`;
    localStorage.setItem('documind_session', currentSessionId);
    sessionUsage = { tokens: 0, cost: 0 };
    updateSessionStats();
    chatBox.innerHTML = '<div class="message-bubble assistant"><div class="bubble-avatar">DM</div><div class="bubble-content">Nueva sesión. ¿En qué puedo ayudarte?</div></div>';
    loadHistory();
};

async function loadChat(sid) {
    if (!sid) return;
    try {
        const res = await authFetch(`${API_BASE}/history/${sid}`);
        if (res.status === 404) {
            // Es un chat nuevo sin mensajes aún, no hacemos nada o mostramos bienvenida
            chatBox.innerHTML = '<div class="message-bubble assistant"><div class="bubble-avatar">DM</div><div class="bubble-content">¡Hola! Soy DocuMind. ¿En qué puedo ayudarte hoy?</div></div>';
            return;
        }
        if (!res.ok) return;
        const messages = await res.json();
        chatBox.innerHTML = '';
        if (messages.length === 0) {
            chatBox.innerHTML = '<div class="message-bubble assistant"><div class="bubble-avatar">DM</div><div class="bubble-content">¡Hola! Soy DocuMind. ¿En qué puedo ayudarte hoy?</div></div>';
        } else {
            messages.forEach(msg => appendMessage(msg.role, msg.content));
        }
    } catch (e) { console.error("LoadChat fail:", e); }
}

let currentSourceMetadata = {};
let lastUserQuery = '';
let sourceStore = [];
let sessionUsage = { tokens: 0, cost: 0 };

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;
    lastUserQuery = text;
    appendMessage('user', text);
    userInput.value = '';
    userInput.style.height = 'auto';
    const loading = appendMessage('assistant', 'Consultando...', true);
    try {
        const res = await authFetch(`${API_BASE}/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prompt: text,
                session_id: currentSessionId,
                area: chatAreaSelector.value || null
            })
        });
        const data = await res.json();
        const answer = data.answer || "La IA no ha devuelto una respuesta válida.";
        appendMessage('assistant', answer, false, data.sources, data.usage);
        loading.remove();
        loadHistory();
    } catch (e) {
        console.error("Chat Error:", e);
        if (loading && loading.parentNode) {
            loading.innerHTML = `<span style="color:#ef4444;">⚠️ Error al procesar respuesta.</span>`;
        }
    }
}

function appendMessage(role, content, isLoading = false, sources = [], usage = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message-bubble ${role}`;

    let usageHtml = '';
    let sourcesHtml = '';
    if (usage) {
        // Precios GPT-4o: $2.50/M in, $10.00/M out
        const cost = (usage.prompt_tokens * 0.0000025) + (usage.completion_tokens * 0.00001);
        sessionUsage.tokens += usage.total_tokens;
        sessionUsage.cost += cost;

        usageHtml = `
            <div class="usage-badge" title="Costo estimado de esta respuesta">
                <span>⚡ ${usage.total_tokens} tokens</span>
                <span style="margin-left:8px; opacity:0.7;">$${cost.toFixed(4)}</span>
            </div>
        `;
        updateSessionStats();
    }
    if (sources && sources.length > 0) {
        sourcesHtml = `<div class="source-container" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">`;
        sources.forEach((s) => {
            const sName = s.name || "Desconocido";
            const sArea = s.area || "General";
            const sContent = s.content || "";
            const displayName = sName.split(/[\\/]/).pop();

            const storeIdx = sourceStore.length;
            sourceStore.push({ name: sName, area: sArea, snippet: sContent, query: lastUserQuery });

            sourcesHtml += `<span class="source-tag" onclick="showSourceStoreDetail(${storeIdx})" title="Ver verificación Pro">📄 ${displayName}</span>`;
        });
        sourcesHtml += `</div>`;
    }

    // Configurar Marked para renderizar Markdown (con fallback de seguridad)
    let renderedContent = content.replace(/\n/g, '<br>');
    if (role === 'assistant' && !isLoading) {
        try {
            if (typeof marked !== 'undefined' && marked.parse) {
                renderedContent = marked.parse(content);
            } else if (typeof marked === 'function') {
                renderedContent = marked(content);
            }
        } catch (e) {
            console.warn("Markdown parse failed, using text fallback");
        }
    }

    msgDiv.innerHTML = `
        <div class="bubble-avatar">${role === 'assistant' ? 'DM' : 'YO'}</div>
        <div class="bubble-content">
            <div class="markdown-body">${renderedContent}</div>
            ${sourcesHtml}
            ${usageHtml}
        </div>
    `;

    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    // Renderizado de Mermaid si existen bloques de código mermaid
    if (role === 'assistant' && !isLoading && content.includes('```mermaid')) {
        setTimeout(async () => {
            try {
                await mermaid.run({
                    nodes: msgDiv.querySelectorAll('.language-mermaid')
                });
            } catch (e) {
                console.error("Mermaid check fail:", e);
            }
        }, 100);
    }

    return msgDiv;
}

function updateSessionStats() {
    const tkn = document.getElementById('session-tokens');
    const cst = document.getElementById('session-cost');
    if (tkn) tkn.innerText = `⚡ ${sessionUsage.tokens} tkn`;
    if (cst) cst.innerText = `$${sessionUsage.cost.toFixed(3)}`;
}

function showSourceStoreDetail(idx) {
    const data = sourceStore[idx];
    if (data) {
        showSourceDetail(data.name, data.area, data.snippet, data.query);
    }
}

async function showSourceDetail(name, area, snippet, query = '') {
    const modal = document.getElementById('source-modal');
    const displayName = name.split(/[\\/]/).pop();

    currentSourceMetadata = { name, area, snippet, query };

    document.getElementById('source-modal-filename').innerText = `${area} / ${displayName}`;
    document.getElementById('source-modal-content').innerText = snippet;

    // Reset tabs
    switchSourceTab('fragment');

    // Configurar descarga
    const downloadBtn = document.getElementById('download-source-btn');
    downloadBtn.onclick = () => {
        const token = localStorage.getItem('documind_token');
        if (!token) {
            alert("Su sesión ha expirado o no es válida. Por favor, inicie sesión nuevamente.");
            return;
        }
        const encodedArea = encodeURIComponent(area);
        const encodedName = encodeURIComponent(name);
        const url = `${API_BASE}/document/download/${encodedArea}/${encodedName}?token=${token}`;
        window.open(url, '_blank');
    };

    modal.style.display = 'flex';
}

async function switchSourceTab(tab) {
    const fragmentTab = document.getElementById('source-modal-fragment');
    const fullTab = document.getElementById('source-modal-full');
    const btns = document.querySelectorAll('.tab-btn');

    btns.forEach(b => b.classList.remove('active'));
    fragmentTab.classList.remove('active');
    fullTab.classList.remove('active');

    if (tab === 'fragment') {
        btns[0].classList.add('active');
        fragmentTab.classList.add('active');
    } else {
        btns[1].classList.add('active');
        fullTab.classList.add('active');

        const contentDiv = document.getElementById('source-modal-full-content');
        contentDiv.innerHTML = '<div style="text-align:center; padding:40px;">🔍 Extrayendo texto original y resaltando cita...</div>';

        try {
            const res = await authFetch(`${API_BASE}/document/text/${currentSourceMetadata.area}/${currentSourceMetadata.name}`);
            const data = await res.json();

            let fullText = data.text;
            const snippet = currentSourceMetadata.snippet;
            const query = currentSourceMetadata.query || '';

            // MOTOR DE RESALTADO V6 (FOCUS TÉCNICO)
            const words = snippet.split(/\s+/).filter(w => w.length > 2);

            // 1. Filtrar palabras "vacías" de la pregunta y gramática común
            const questionStops = [
                'que', 'qué', 'como', 'cómo', 'donde', 'dónde', 'cual', 'cuál',
                'quien', 'quién', 'cuando', 'cuándo', 'esta', 'estos', 'este',
                'puedes', 'podrías', 'sobre', 'decirme', 'existe'
            ];
            const queryTerms = query.toLowerCase().replace(/[?¿!¡]/g, '').split(/\s+/).filter(w =>
                w.length >= 3 && !questionStops.includes(w)
            );

            // 2. Intentar bloque exacto primero (Máxima fidelidad)
            const searchBlock = words.slice(0, 10).join(' ');
            const blockPattern = searchBlock.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+');
            const blockRegex = new RegExp(blockPattern, 'i');

            if (blockRegex.test(fullText)) {
                fullText = fullText.replace(blockRegex, (match) => `<span class="highlight-match">${match}</span>`);
            } else {
                // 3. Fallback inteligente: Prioridad a PALABRAS CLAVE
                const highlightGroup = words.filter(w => {
                    const lowW = w.toLowerCase().replace(/[.,()]/g, '');
                    const isTechnical = /([A-Z]{2,}|[a-z]+[A-Z][a-z]+|[A-Z][a-z]+[A-Z])/.test(w);
                    const isInQuery = queryTerms.some(qt => lowW === qt || lowW.includes(qt));
                    return isInQuery || isTechnical;
                });

                [...new Set(highlightGroup)].sort((a, b) => {
                    const aInQ = queryTerms.includes(a.toLowerCase());
                    const bInQ = queryTerms.includes(b.toLowerCase());
                    return bInQ - aInQ;
                }).slice(0, 12).forEach(word => {
                    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const wordRegex = new RegExp(`\\b(${escaped})\\b`, 'gi');
                    fullText = fullText.replace(wordRegex, `<span class="highlight-match">$1</span>`);
                });
            }

            contentDiv.innerHTML = fullText;

            setTimeout(() => {
                const hl = contentDiv.querySelector('.highlight-match');
                if (hl) {
                    hl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    hl.style.animation = 'pulse-highlight 2s infinite';
                }
            }, 300);

        } catch (e) {
            contentDiv.innerText = "Error al cargar el documento completo.";
        }
    }
}

function setupAutoResize() {
    userInput.oninput = function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    };
}

document.getElementById('file-search').oninput = function () {
    const term = this.value.toLowerCase();
    document.querySelectorAll('.file-card').forEach(c => {
        const name = c.querySelector('.file-name').textContent.toLowerCase();
        c.style.display = name.includes(term) ? 'flex' : 'none';
    });
};

sendBtn.onclick = sendMessage;
userInput.onkeydown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
window.onclick = (e) => {
    if (e.target.classList.contains('modal-bg')) {
        e.target.style.display = 'none';
        if (e.target.id === 'area-modal') closeAreaModal();
        if (e.target.id === 'user-modal') closeUserModal();
    }
};
