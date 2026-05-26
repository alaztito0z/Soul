import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, getDocs, writeBatch } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvgTHO9WZA8_DnVPNzKFelwURtyGqlKAs",
    authDomain: "soul-joyeria.firebaseapp.com",
    projectId: "soul-joyeria",
    storageBucket: "soul-joyeria.appspot.com",
    messagingSenderId: "120513073976",
    appId: "1:120513073976:web:3ec1f3cd09c30de68d67cd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

let currentUser = null;
let productos = [];
let pedidos = [];
let filtroPedidosActivo = 'todos';

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    loginError.textContent = 'Conectando...';
    loginError.style.color = '#f39c12';
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const adminQuery = query(collection(db, 'admins'), where('uid', '==', userCredential.user.uid));
        const adminSnapshot = await getDocs(adminQuery);
        
        if (!adminSnapshot.empty) {
            loginScreen.style.display = 'none';
            dashboard.style.display = 'flex';
            currentUser = userCredential.user;
            initDashboard();
        } else {
            await signOut(auth);
            loginError.textContent = 'No tienes permisos de administrador';
            loginError.style.color = '#e74c3c';
        }
    } catch (error) {
        loginError.textContent = 'Error: ' + error.message;
        loginError.style.color = '#e74c3c';
    }
});

document.getElementById('btnLogout').addEventListener('click', async () => {
    await signOut(auth);
    currentUser = null;
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
});

onAuthStateChanged(auth, (user) => {
    if (!user && dashboard.style.display === 'flex') {
        dashboard.style.display = 'none';
        loginScreen.style.display = 'flex';
    }
});

function initDashboard() {
    loadProductos();
    loadPedidos();
    setupNavigation();
    setupProductoForm();
    updateLastUpdate();
    setInterval(updateLastUpdate, 30000);
}

function loadProductos() {
    const q = query(collection(db, 'productos'), orderBy('nombre'));
    onSnapshot(q, (snapshot) => {
        productos = [];
        snapshot.forEach((doc) => {
            productos.push({ id: doc.id, ...doc.data() });
        });
        renderProductos();
        updateStats();
    });
}

function renderProductos(filter = '') {
    const tbody = document.getElementById('productosTableBody');
    if (!tbody) return;
    const searchTerm = filter.toLowerCase();
    
    const filtered = productos.filter(p => 
        (p.nombre || '').toLowerCase().includes(searchTerm) ||
        (p.categoria || '').toLowerCase().includes(searchTerm)
    );
    
    tbody.innerHTML = filtered.map(p => `
        <tr>
            <td><img src="${p.imagen || ''}" class="table-img" alt="${p.nombre || ''}"></td>
            <td>${p.nombre || ''}</td>
            <td>${p.categoria || ''}</td>
            <td>Bs ${(p.precio || 0).toLocaleString()}</td>
            <td>${p.precioAnterior ? 'Bs ' + p.precioAnterior.toLocaleString() : '-'}</td>
            <td><span class="status-badge ${p.activo !== false ? 'status-activo' : 'status-inactivo'}">${p.activo !== false ? 'Activo' : 'Inactivo'}</span></td>
            <td>
                <button class="action-btn btn-edit" data-id="${p.id}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                </button>
                <button class="action-btn btn-delete" data-id="${p.id}">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                </button>
            </td>
        </tr>
    `).join('');

    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => editProducto(btn.dataset.id));
    });
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => deleteProducto(btn.dataset.id));
    });
}

document.getElementById('searchProducto').addEventListener('input', (e) => {
    renderProductos(e.target.value);
});

async function saveProducto(e) {
    e.preventDefault();
    const id = document.getElementById('productoId').value;
    
    const productoData = {
        nombre: document.getElementById('prodNombre').value,
        categoria: document.getElementById('prodCategoria').value,
        precio: parseFloat(document.getElementById('prodPrecio').value),
        precioAnterior: document.getElementById('prodPrecioAnterior').value ? parseFloat(document.getElementById('prodPrecioAnterior').value) : null,
        imagen: document.getElementById('prodImagen').value,
        descripcion: document.getElementById('prodDescripcion').value,
        activo: document.getElementById('prodActivo').checked,
        updatedAt: new Date().toISOString()
    };
    
    try {
        if (id) {
            await updateDoc(doc(db, 'productos', id), productoData);
        } else {
            await setDoc(doc(collection(db, 'productos')), productoData);
        }
        closeProductoModal();
    } catch (error) {
        alert('Error al guardar: ' + error.message);
    }
}

function editProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;
    
    document.getElementById('productoId').value = id;
    document.getElementById('prodNombre').value = producto.nombre || '';
    document.getElementById('prodCategoria').value = producto.categoria || '';
    document.getElementById('prodPrecio').value = producto.precio || 0;
    document.getElementById('prodPrecioAnterior').value = producto.precioAnterior || '';
    document.getElementById('prodImagen').value = producto.imagen || '';
    document.getElementById('prodDescripcion').value = producto.descripcion || '';
    document.getElementById('prodActivo').checked = producto.activo !== false;
    
    document.getElementById('modalTitle').textContent = 'Editar Producto';
    document.getElementById('productoModal').classList.add('active');
}

async function deleteProducto(id) {
    if (confirm('Eliminar este producto?')) {
        try {
            await deleteDoc(doc(db, 'productos', id));
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    }
}

function updateLastUpdate() {
    const el = document.getElementById('lastUpdate');
    if (!el) return;
    el.textContent = 'Actualizado: ' + new Date().toLocaleTimeString();
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
            
            const sectionMap = {
                'productos': 'sectionProductos',
                'ofertas': 'sectionOfertas',
                'pedidos': 'sectionPedidos',
                'estadisticas': 'sectionEstadisticas'
            };
            
            const targetSection = document.getElementById(sectionMap[btn.dataset.section]);
            if (targetSection) targetSection.classList.add('active');
            
            const titleEl = document.getElementById('sectionTitle');
            if (titleEl) titleEl.textContent = btn.textContent.trim();
            
            if (btn.dataset.section === 'estadisticas') actualizarEstadisticasDOM();
        });
    });
}

function setupProductoForm() {
    const btnAdd = document.getElementById('btnAddProducto');
    const modal = document.getElementById('productoModal');
    const form = document.getElementById('productoForm');
    const closeBtn = document.querySelector('#productoModal .modal-close');
    const cancelBtn = document.querySelector('#productoModal .btn-cancel');

    if (btnAdd) {
        btnAdd.addEventListener('click', function() {
            document.getElementById('productoId').value = '';
            form.reset();
            document.getElementById('prodActivo').checked = true;
            document.getElementById('modalTitle').textContent = 'Nuevo Producto';
            modal.classList.add('active');
        });
    }

    if (closeBtn) closeBtn.addEventListener('click', closeProductoModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeProductoModal);
    if (form) form.addEventListener('submit', saveProducto);
}

function closeProductoModal() {
    document.getElementById('productoModal').classList.remove('active');
}

function loadPedidos() {
    const q = query(collection(db, 'pedidos'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        pedidos = [];
        snapshot.forEach((doc) => pedidos.push({ id: doc.id, ...doc.data() }));
        renderPedidos(filtroPedidosActivo);
        updatePedidosBadge();
        actualizarEstadisticasDOM();
    });
}

function actualizarEstadisticasDOM() {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const pedidosDelMes = pedidos.filter(p => p.timestamp && new Date(p.timestamp) >= inicioMes);
    const pedidosMes = pedidosDelMes.length;
    const ventasMes = pedidosDelMes.reduce((t, p) => t + (p.total || 0), 0);
    
    const ventasMesEl = document.getElementById('ventasMes');
    const pedidosMesEl = document.getElementById('pedidosMes');
    const topContainer = document.getElementById('topProductos');
    
    if (ventasMesEl) ventasMesEl.textContent = 'Bs ' + ventasMes.toLocaleString();
    if (pedidosMesEl) pedidosMesEl.textContent = pedidosMes;
    
    if (topContainer) {
        const productosVendidos = {};
        pedidosDelMes.forEach(p => {
            if (p.items) p.items.forEach(i => {
                const n = i.nombre || 'Desconocido';
                productosVendidos[n] = (productosVendidos[n] || 0) + (i.cantidad || 1);
            });
        });
        const top = Object.entries(productosVendidos).sort((a, b) => b[1] - a[1]).slice(0, 5);
        topContainer.innerHTML = top.length === 0 ? '<p style="color:#999;">Sin ventas este mes</p>' : top.map((item, i) => '<p>' + (i + 1) + '. ' + item[0] + ' - ' + item[1] + ' vendido' + (item[1] > 1 ? 's' : '') + '</p>').join('');
    }
}

function renderPedidos(filter = 'todos') {
    const container = document.getElementById('pedidosList');
    if (!container) return;
    let filtered = filter === 'todos' ? pedidos : pedidos.filter(p => p.estado === filter);
    
    if (filtered.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:3rem;">No hay pedidos en esta categoria</p>';
        updateExportAndDeleteButtons(filter, false);
        return;
    }
    
    container.innerHTML = filtered.map(p => `
        <div class="pedido-card">
            <div class="pedido-header">
                <h3>Pedido #${p.id.slice(-6)}</h3>
                <span class="pedido-estado estado-${p.estado || 'pendiente'}">${p.estado || 'pendiente'}</span>
            </div>
            <div class="pedido-body">
                <div class="pedido-info">
                    <p><strong>Cliente:</strong> ${p.cliente?.nombre || 'N/A'}</p>
                    <p><strong>Email:</strong> ${p.cliente?.email || 'N/A'}</p>
                    <p><strong>Total:</strong> Bs ${(p.total || 0).toLocaleString()}</p>
                    <p><strong>Fecha:</strong> ${p.timestamp ? new Date(p.timestamp).toLocaleString('es-BO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                </div>
                <div class="pedido-items">
                    <h4>Productos:</h4>
                    ${p.items ? p.items.map(i => `
                        <div class="pedido-item">
                            <span>${i.nombre} x${i.cantidad}</span>
                            <span>Bs ${(i.subtotal || i.precio * i.cantidad).toLocaleString()}</span>
                        </div>
                    `).join('') : ''}
                </div>
            </div>
            <div class="pedido-actions">
                ${p.estado === 'pendiente' ? `<button class="btn-confirmar" data-id="${p.id}">Confirmar Pedido</button>` : ''}
                ${p.estado === 'confirmado' ? `<button class="btn-enviar" data-id="${p.id}">Marcar como Enviado</button>` : ''}
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.btn-confirmar').forEach(btn => {
        btn.addEventListener('click', async () => {
            await updateDoc(doc(db, 'pedidos', btn.dataset.id), { estado: 'confirmado', confirmadoAt: new Date().toISOString() });
        });
    });
    document.querySelectorAll('.btn-enviar').forEach(btn => {
        btn.addEventListener('click', async () => {
            await updateDoc(doc(db, 'pedidos', btn.dataset.id), { estado: 'enviado', enviadoAt: new Date().toISOString() });
        });
    });

    updateExportAndDeleteButtons(filter, true);
}

document.querySelectorAll('.filtro-pedido').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filtro-pedido').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filtroPedidosActivo = btn.dataset.estado;
        renderPedidos(btn.dataset.estado);
    });
});

function updateExportAndDeleteButtons(estado, mostrar) {
    let eb = document.getElementById('btnExportar');
    let dbBtn = document.getElementById('btnEliminarEnviados');
    if (eb) eb.remove();
    if (dbBtn) dbBtn.remove();
    
    if (estado === 'enviado' && mostrar) {
        const pedidosList = document.getElementById('pedidosList');
        
        const exportBtn = document.createElement('button');
        exportBtn.id = 'btnExportar';
        exportBtn.className = 'btn-exportar';
        exportBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Exportar a Hoja de Calculo`;
        exportBtn.addEventListener('click', exportarEnviados);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.id = 'btnEliminarEnviados';
        deleteBtn.className = 'btn-eliminar-enviados';
        deleteBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg> Eliminar Todos los Enviados`;
        deleteBtn.addEventListener('click', eliminarTodosEnviados);
        
        pedidosList.parentNode.insertBefore(deleteBtn, pedidosList);
        pedidosList.parentNode.insertBefore(exportBtn, pedidosList);
    }
}

async function eliminarTodosEnviados() {
    const enviados = pedidos.filter(p => p.estado === 'enviado');
    if (enviados.length === 0) return alert('No hay pedidos enviados');
    if (!confirm('Eliminar ' + enviados.length + ' pedidos enviados?')) return;
    const batch = writeBatch(db);
    enviados.forEach(p => batch.delete(doc(db, 'pedidos', p.id)));
    await batch.commit();
    alert(enviados.length + ' pedidos eliminados');
}

function exportarEnviados() {
    const enviados = pedidos.filter(p => p.estado === 'enviado');
    if (enviados.length === 0) return alert('No hay pedidos enviados');
    
    let csv = 'ID Pedido,Fecha,Cliente,Email,Total,Estado\n';
    enviados.forEach(p => {
        csv += `${p.id.slice(-6)},${p.timestamp ? new Date(p.timestamp).toLocaleDateString('es-BO') : 'N/A'},${p.cliente?.nombre || 'N/A'},${p.cliente?.email || 'N/A'},Bs ${p.total},${p.estado}\n`;
    });
    csv += '\n\nDetalle de Productos\nID Pedido,Producto,Cantidad,Precio Unitario,Subtotal\n';
    enviados.forEach(p => {
        if (p.items) p.items.forEach(i => {
            csv += `${p.id.slice(-6)},${i.nombre},${i.cantidad},Bs ${i.precio},Bs ${i.subtotal || i.precio * i.cantidad}\n`;
        });
    });
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'pedidos_enviados_' + new Date().toISOString().slice(0, 10) + '.csv';
    link.click();
}

function updatePedidosBadge() {
    const badge = document.getElementById('pedidosPendientes');
    if (badge) badge.textContent = pedidos.filter(p => p.estado === 'pendiente').length;
}

function updateStats() {
    const ofertas = productos.filter(p => p.precioAnterior !== null);
    const oa = document.getElementById('ofertasActivas');
    const po = document.getElementById('productosEnOferta');
    const dp = document.getElementById('descuentoPromedio');
    if (oa) oa.textContent = ofertas.length;
    if (po) po.textContent = ofertas.length;
    if (dp) dp.textContent = (ofertas.length > 0 ? Math.round(ofertas.reduce((s, p) => s + (1 - p.precio / p.precioAnterior) * 100, 0) / ofertas.length) : 0) + '%';
}
