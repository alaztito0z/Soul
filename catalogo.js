document.addEventListener('DOMContentLoaded', function() {

            const productos = [
                { id: 1, nombre: 'Anillo Solitario Diamante', categoria: 'anillos', precio: 890, precioAnterior: null, imagen: 'assets/images/productos/anillo-01.jpg' },
                { id: 2, nombre: 'Anillo Promesa Oro Rosa', categoria: 'anillos', precio: 450, precioAnterior: 550, imagen: 'assets/images/productos/anillo-02.jpg' },
                { id: 3, nombre: 'Anillo Eternidad Mini Mouse', categoria: 'anillos', precio: 320, precioAnterior: null, imagen: 'assets/images/productos/anillo-03.jpg' },
                { id: 4, nombre: 'Anillo Vintage Zafiro', categoria: 'anillos', precio: 1100, precioAnterior: 1350, imagen: 'assets/images/productos/anillo-04.jpg' },
                { id: 5, nombre: 'Aretes Perla Natural', categoria: 'aretes', precio: 350, precioAnterior: null, imagen: 'assets/images/productos/arete-01.jpg' },
                { id: 6, nombre: 'Aretes Colgantes Oro', categoria: 'aretes', precio: 520, precioAnterior: 620, imagen: 'assets/images/productos/arete-02.jpg' },
                { id: 7, nombre: 'Aretes Botón Brillante', categoria: 'aretes', precio: 280, precioAnterior: null, imagen: 'assets/images/productos/arete-03.jpg' },
                { id: 8, nombre: 'Collar Delicado Corazón', categoria: 'collares', precio: 420, precioAnterior: null, imagen: 'assets/images/productos/collar-01.jpg' },
                { id: 9, nombre: 'Collar Gargantilla Oro', categoria: 'collares', precio: 650, precioAnterior: 790, imagen: 'assets/images/productos/collar-02.jpg' },
                { id: 10, nombre: 'Collar Largo Bohemio', categoria: 'collares', precio: 380, precioAnterior: null, imagen: 'assets/images/productos/collar-03.jpg' },
                { id: 11, nombre: 'Reloj Minimalista Cuero', categoria: 'relojes', precio: 890, precioAnterior: null, imagen: 'assets/images/productos/reloj-01.jpg' },
                { id: 12, nombre: 'Reloj Clásico Dorado', categoria: 'relojes', precio: 1250, precioAnterior: 1500, imagen: 'assets/images/productos/reloj-02.jpg' },
            ];

            const ofertas = productos.filter(p => p.precioAnterior !== null);

            const catalogoGrid = document.getElementById('catalogoGrid');
            const noResultados = document.getElementById('noResultados');
            const filtroBtns = document.querySelectorAll('.filtro-btn');
            const ordenSelect = document.getElementById('ordenSelect');
            let categoriaActiva = 'todos',
                ordenActivo = 'default';

            function actualizarUI() {
                const t = window.obtenerCarrito ? window.obtenerCarrito() : 0;
                document.querySelectorAll('.cart-count').forEach(el => el.textContent = t);
            }

            function renderProductos(lista) {
                if (!catalogoGrid) return;
                catalogoGrid.innerHTML = '';
                if (lista.length === 0) { noResultados.style.display = 'block'; return; }
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
                        <span class="precio-actual">€ ${prod.precio.toLocaleString()}</span>
                        ${prod.precioAnterior ? `<span class="precio-anterior">€ ${prod.precioAnterior.toLocaleString()}</span>` : ''}
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
                this.textContent = '✓ Añadido'; this.style.backgroundColor = 'var(--color-gold)'; this.style.color = 'white';
                setTimeout(() => { this.textContent = 'Añadir'; this.style.backgroundColor = 'transparent'; this.style.color = 'var(--color-gold)'; }, 1200);
            });
        });

        document.querySelectorAll('.detail-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const prod = productos.find(p => p.id === parseInt(this.dataset.id));
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
        if (categoriaActiva === 'ofertas') f = f.filter(p => p.precioAnterior !== null);
        else if (categoriaActiva !== 'todos') f = f.filter(p => p.categoria === categoriaActiva);
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

    if (ordenSelect) ordenSelect.addEventListener('change', function() { ordenActivo = this.value; aplicarFiltros(); });

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
                        <span class="precio-anterior">€ ${prod.precioAnterior.toLocaleString()}</span>
                        <span class="precio-actual">€ ${prod.precio.toLocaleString()}</span>
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
                this.textContent = '✓ Añadido'; this.style.backgroundColor = 'var(--color-gold)'; this.style.color = 'white';
                setTimeout(() => { this.textContent = 'Comprar'; this.style.backgroundColor = 'transparent'; this.style.color = 'var(--color-gold)'; }, 1200);
            });
        });
    }

    // Combos
    document.querySelectorAll('.add-combo').forEach(btn => {
        btn.addEventListener('click', function() {
            const nombre = this.closest('.combo-card').querySelector('h3').textContent;
            const precioTexto = this.closest('.combo-card').querySelector('.combo-precio-oferta').textContent;
            const precio = parseInt(precioTexto.replace(/[^0-9]/g, '')) || 799;
            const imagen = this.closest('.combo-card').querySelector('img').getAttribute('src');
            window.actualizarCarrito(nombre, precio, imagen);
            actualizarUI();
            this.textContent = '✓ Añadido'; this.style.backgroundColor = 'var(--color-gold)'; this.style.color = 'white';
            setTimeout(() => { this.textContent = 'Añadir Set'; this.style.backgroundColor = 'transparent'; this.style.color = 'var(--color-gold)'; }, 1200);
        });
    });

    const params = new URLSearchParams(window.location.search);
    const catURL = params.get('categoria');
    if (catURL) {
        categoriaActiva = catURL;
        filtroBtns.forEach(b => { b.classList.remove('active'); if (b.dataset.categoria === catURL) b.classList.add('active'); });
        aplicarFiltros();
    } else renderProductos(productos);

    actualizarUI();
    console.log(' Catálogo Soul cargado - ' + productos.length + ' productos.');
});