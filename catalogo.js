import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import { getFirestore, collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

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

document.addEventListener('DOMContentLoaded', function() {

    let productos = [];
    let categoriaActiva = 'todos';
    let ordenActivo = 'default';

    const catalogoGrid = document.getElementById('catalogoGrid');
    const noResultados = document.getElementById('noResultados');
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    const ordenSelect = document.getElementById('ordenSelect');

    function actualizarUI() {
        const t = window.obtenerCarrito ? window.obtenerCarrito() : 0;
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = t);
    }

    function renderProductos(lista) {
        if (!catalogoGrid) return;
        catalogoGrid.innerHTML = '';
        if (lista.length === 0) {
            noResultados.style.display = 'block';
            return;
        }
        noResultados.style.display = 'none';

        lista.forEach(prod => {
            const card = document.createElement('div');
            card.classList.add('producto-card');
            card.innerHTML = `
                <div class="producto-card-img"><img src="${prod.imagen}" alt="${prod.nombre}"></div>
                <div class="producto-card-body">
                    <span class="producto-card-categoria">${prod.categoria}</span>
                    <h3 class="producto-card-nombre">${prod.nombre}</h3>
                    <div class="producto-card-precio">
                        <span class="precio-actual">Bs ${prod.precio.toLocaleString()}</span>
                        ${prod.precioAnterior ? `<span class="precio-anterior">Bs ${prod.precioAnterior.toLocaleString()}</span>` : ''}
                    </div>
                    <div class="producto-card-actions">
                        <button class="btn-card add-btn" data-nombre="${prod.nombre}" data-precio="${prod.precio}" data-imagen="${prod.imagen}">Añadir</button>
                        <button class="btn-card detail-btn" data-id="${prod.id}">Detalle</button>
                    </div>
                </div>`;
            catalogoGrid.appendChild(card);
        });

        document.querySelectorAll('.add-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                window.actualizarCarrito(this.dataset.nombre, parseInt(this.dataset.precio), this.dataset.imagen);
                actualizarUI();
                this.textContent = 'Añadido';
                this.style.backgroundColor = 'var(--color-gold)';
                this.style.color = 'white';
                setTimeout(() => {
                    this.textContent = 'Añadir';
                    this.style.backgroundColor = 'transparent';
                    this.style.color = 'var(--color-gold)';
                }, 1200);
            });
        });

        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const prod = productos.find(p => p.id === this.dataset.id);
                if (prod && window.abrirModalProducto) window.abrirModalProducto(prod);
            });
        });

        document.querySelectorAll('.producto-card').forEach(card => {
            card.addEventListener('click', function() {
                const btn = this.querySelector('.detail-btn');
                if (btn) btn.click();
            });
        });
    }

    function aplicarFiltros() {
        let f = [...productos];
        if (categoriaActiva === 'ofertas') {
            f = f.filter(p => p.precioAnterior !== null && p.precioAnterior !== undefined);
        } else if (categoriaActiva !== 'todos') {
            f = f.filter(p => p.categoria === categoriaActiva);
        }
        if (ordenActivo === 'precio-asc') f.sort((a, b) => a.precio - b.precio);
        else if (ordenActivo === 'precio-desc') f.sort((a, b) => b.precio - a.precio);
        else if (ordenActivo === 'nombre-asc') f.sort((a, b) => a.nombre.localeCompare(b.nombre));
        else if (ordenActivo === 'nombre-desc') f.sort((a, b) => b.nombre.localeCompare(a.nombre));
        renderProductos(f);
    }

    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filtroBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            categoriaActiva = this.dataset.categoria;
            aplicarFiltros();
        });
    });

    if (ordenSelect) {
        ordenSelect.addEventListener('change', function() {
            ordenActivo = this.value;
            aplicarFiltros();
        });
    }

    function cargarProductosFirestore() {
        const q = query(collection(db, 'productos'), orderBy('nombre'));
        onSnapshot(q, (snapshot) => {
            productos = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.activo !== false) {
                    productos.push({
                        id: doc.id,
                        nombre: data.nombre,
                        categoria: data.categoria,
                        precio: data.precio,
                        precioAnterior: data.precioAnterior || null,
                        imagen: data.imagen,
                        descripcion: data.descripcion || ''
                    });
                }
            });

            const ofertas = productos.filter(p => p.precioAnterior !== null && p.precioAnterior !== undefined);
            const ofertasGrid = document.getElementById('ofertasGrid');
            if (ofertasGrid && ofertas.length > 0) {
                ofertasGrid.innerHTML = '';
                ofertas.forEach(prod => {
                    const desc = Math.round((1 - prod.precio / prod.precioAnterior) * 100);
                    const card = document.createElement('div');
                    card.classList.add('oferta-card');
                    card.innerHTML = `
                        <div class="oferta-tag">-${desc}%</div>
                        <div class="oferta-img"><img src="${prod.imagen}" alt="${prod.nombre}"></div>
                        <div class="oferta-info">
                            <h3>${prod.nombre}</h3>
                            <div class="oferta-precio">
                                <span class="precio-anterior">Bs ${prod.precioAnterior.toLocaleString()}</span>
                                <span class="precio-actual">Bs ${prod.precio.toLocaleString()}</span>
                            </div>
                            <button class="btn btn-dorado btn-sm oferta-btn" data-nombre="${prod.nombre}" data-precio="${prod.precio}" data-imagen="${prod.imagen}" style="margin-top:10px;">Comprar</button>
                        </div>`;
                    ofertasGrid.appendChild(card);
                });

                document.querySelectorAll('.oferta-btn').forEach(btn => {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        window.actualizarCarrito(this.dataset.nombre, parseInt(this.dataset.precio), this.dataset.imagen);
                        actualizarUI();
                        this.textContent = 'Añadido';
                        this.style.backgroundColor = 'var(--color-gold)';
                        this.style.color = 'white';
                        setTimeout(() => {
                            this.textContent = 'Comprar';
                            this.style.backgroundColor = 'transparent';
                            this.style.color = 'var(--color-gold)';
                        }, 1200);
                    });
                });
            }

            const params = new URLSearchParams(window.location.search);
            const catURL = params.get('categoria');
            if (catURL) {
                categoriaActiva = catURL;
                filtroBtns.forEach(b => {
                    b.classList.remove('active');
                    if (b.dataset.categoria === catURL) b.classList.add('active');
                });
                aplicarFiltros();
            } else {
                aplicarFiltros();
            }
        });
    }

    cargarProductosFirestore();

    document.querySelectorAll('.add-combo').forEach(btn => {
        btn.addEventListener('click', function() {
            const nombre = this.closest('.combo-card').querySelector('h3').textContent;
            const precioTexto = this.closest('.combo-card').querySelector('.combo-precio-oferta').textContent;
            const precio = parseInt(precioTexto.replace(/[^0-9]/g, '')) || 799;
            const imagen = this.closest('.combo-card').querySelector('img').getAttribute('src');
            window.actualizarCarrito(nombre, precio, imagen);
            actualizarUI();
            this.textContent = 'Añadido';
            this.style.backgroundColor = 'var(--color-gold)';
            this.style.color = 'white';
            setTimeout(() => {
                this.textContent = 'Añadir Set';
                this.style.backgroundColor = 'transparent';
                this.style.color = 'var(--color-gold)';
            }, 1200);
        });
    });

    actualizarUI();
});
