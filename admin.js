import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, where, getDocs } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyCvgTHO9WZA8_DnVPNzKFelwURtyGqlKAs",
    authDomain: "soul-joyeria.firebaseapp.com",
    projectId: "soul-joyeria",
    storageBucket: "soul-joyeria.firebasestorage.app",
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

loginForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    loginError.textContent = 'Conectando...';
    loginError.style.color = '#f39c12';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        loginError.textContent = 'Verificando permisos...';

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
        console.error('Login error:', error);
    }
});

document.getElementById('btnLogout').addEventListener('click', async() => {
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
    }, (error) => {
        console.error('Error loading products:', error);
    });
}

function renderProductos(filter = '') {
    const tbody = document.getElementById('productosTableBody');
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
        precioAnterior: document.getElementById('prodPrecioAnterior').value ?
            parseFloat(document.getElementById('prodPrecioAnterior').value) : null,
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
    const now = new Date();
    document.getElementById('lastUpdate').textContent =
        `Actualizado: ${now.toLocaleTimeString()}`;
}

function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const section = btn.dataset.section;
            document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

            const sectionMap = {
                'productos': 'sectionProductos',
                'ofertas': 'sectionOfertas',
                'pedidos': 'sectionPedidos',
                'estadisticas': 'sectionEstadisticas'
            };

            document.getElementById(sectionMap[section]).classList.add('active');
            document.getElementById('sectionTitle').textContent = btn.textContent.trim();
        });
    });
}

function setupProductoForm() {
    document.getElementById('btnAddProducto').addEventListener('click', () => {
        document.getElementById('productoId').value = '';
        document.getElementById('productoForm').reset();
        document.getElementById('modalTitle').textContent = 'Nuevo Producto';
        document.getElementById('productoModal').classList.add('active');
    });

    document.querySelector('#productoModal .modal-close').addEventListener('click', closeProductoModal);
    document.getElementById('productoForm').addEventListener('submit', saveProducto);
    document.querySelector('#productoModal .btn-cancel').addEventListener('click', closeProductoModal);
}

function closeProductoModal() {
    document.getElementById('productoModal').classList.remove('active');
}

function loadPedidos() {
    const q = query(collection(db, 'pedidos'), orderBy('timestamp', 'desc'));
    onSnapshot(q, (snapshot) => {
        pedidos = [];
        snapshot.forEach((doc) => {
            pedidos.push({ id: doc.id, ...doc.data() });
        });
        renderPedidos();
        updatePedidosBadge();
    });
}

function renderPedidos(filter = 'todos') {
    const container = document.getElementById('pedidosList');
    const filtered = filter === 'todos' ? pedidos : pedidos.filter(p => p.estado === filter);

    container.innerHTML = filtered.map(p => `
        <div class="pedido-card">
            <h3>Pedido #${p.id.slice(-6)}</h3>
            <p>Cliente: ${p.cliente?.nombre || 'N/A'}</p>
            <p>Email: ${p.cliente?.email || 'N/A'}</p>
            <p>Total: Bs ${(p.total || 0).toLocaleString()}</p>
            <p>Estado: ${p.estado || 'pendiente'}</p>
            <p>Fecha: ${p.timestamp ? new Date(p.timestamp).toLocaleString('es-BO', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
        </div>
    `).join('');
}

document.querySelectorAll('.filtro-pedido').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filtro-pedido').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderPedidos(btn.dataset.estado);
    });
});

function updatePedidosBadge() {
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    document.getElementById('pedidosPendientes').textContent = pendientes;
}

function updateStats() {
    const ofertas = productos.filter(p => p.precioAnterior !== null);
    document.getElementById('ofertasActivas').textContent = ofertas.length;
    document.getElementById('productosEnOferta').textContent = ofertas.length;

    const descuentoPromedio = ofertas.length > 0 ?
        Math.round(ofertas.reduce((sum, p) => sum + (1 - p.precio / p.precioAnterior) * 100, 0) / ofertas.length) :
        0;
    document.getElementById('descuentoPromedio').textContent = descuentoPromedio + '%';
}
