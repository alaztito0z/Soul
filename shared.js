document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;
    const loader = document.querySelector('.loader');
    if (loader) {
        body.classList.add('loading');
        window.addEventListener('load', function() {
            setTimeout(function() {
                loader.classList.add('hidden');
                body.classList.remove('loading');
            }, 1200);
        });
    }

    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    let mouseX = 0,
        mouseY = 0,
        dotX = 0,
        dotY = 0;

    if (cursor && cursorDot && window.innerWidth > 768) {
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animateDot() {
            dotX += (mouseX - dotX) * 0.2;
            dotY += (mouseY - dotY) * 0.2;
            cursorDot.style.left = dotX + 'px';
            cursorDot.style.top = dotY + 'px';
            requestAnimationFrame(animateDot);
        }
        animateDot();
        document.querySelectorAll('a, button, .cat-item, .btn, .producto-card, .filtro-btn, .combo-card, .oferta-card').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    const particlesContainer = document.getElementById('particles');
    if (particlesContainer) {
        function createParticle() {
            const p = document.createElement('div');
            p.classList.add('particula');
            const s = Math.random() * 4 + 2;
            p.style.width = s + 'px';
            p.style.height = s + 'px';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = Math.random() * 10 + 10 + 's';
            p.style.animationDelay = Math.random() * 5 + 's';
            particlesContainer.appendChild(p);
            setTimeout(() => p.remove(), 15000);
        }
        setInterval(createParticle, 800);
        for (let i = 0; i < 15; i++) setTimeout(createParticle, Math.random() * 2000);
    }

    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', function() {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        const overlay = document.createElement('div');
        overlay.classList.add('menu-overlay');
        document.body.appendChild(overlay);

        function closeMenu() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        }
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            body.style.overflow = body.style.overflow === 'hidden' ? '' : 'hidden';
        });
        overlay.addEventListener('click', closeMenu);
        document.querySelectorAll('.nav-menu a').forEach(link => link.addEventListener('click', closeMenu));
    }
    const themeToggle = document.querySelector('.theme-toggle');
    const themeIcon = document.querySelector('.theme-icon');
    if (themeToggle && themeIcon) {
        themeToggle.addEventListener('click', function() {
            body.classList.toggle('dark');
            themeIcon.textContent = body.classList.contains('dark') ? '☀️' : '🌙';
            localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
        });
        if (localStorage.getItem('theme') === 'dark') {
            body.classList.add('dark');
            themeIcon.textContent = '☀️';
        }
    }

    const scrollTopBtn = document.querySelector('.scroll-top');
    if (scrollTopBtn) {
        window.addEventListener('scroll', function() {
            scrollTopBtn.classList.toggle('visible', window.scrollY > 500);
        });
        scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    let cartItems = JSON.parse(localStorage.getItem('soul_cart_items') || '[]');
    let cartCount = cartItems.reduce((s, i) => s + i.cantidad, 0);

    function guardar() {
        localStorage.setItem('soul_cart_items', JSON.stringify(cartItems));
        localStorage.setItem('soul_cart_count', cartCount);
    }

    function updateUI() {
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = cartCount);
    }

    function notificar(nombre) {
        const n = document.createElement('div');
        n.className = 'notificacion-carrito';
        n.innerHTML = '✓ <strong>' + nombre + '</strong> añadido al carrito';
        n.style.cssText = 'position:fixed;bottom:30px;right:30px;background:var(--color-dark);color:var(--color-white);padding:15px 25px;border-left:3px solid var(--color-gold);font-family:var(--font-sans);font-size:0.85rem;z-index:9999;opacity:0;transform:translateX(100px);transition:all 0.4s ease;border-radius:2px;box-shadow:0 5px 20px rgba(0,0,0,0.2);pointer-events:none;';
        document.body.appendChild(n);
        setTimeout(() => {
            n.style.opacity = '1';
            n.style.transform = 'translateX(0)';
        }, 100);
        setTimeout(() => {
            n.style.opacity = '0';
            n.style.transform = 'translateX(100px)';
            setTimeout(() => n.remove(), 400);
        }, 2500);
    }

    window.actualizarCarrito = function(nombre, precio, imagen) {
        const exist = cartItems.find(i => i.nombre === nombre);
        if (exist) exist.cantidad++;
        else cartItems.push({ nombre, precio, imagen: imagen || 'anillo-01.jpg', cantidad: 1 });
        cartCount++;
        guardar();
        updateUI();
        notificar(nombre);
    };
    window.obtenerCarrito = () => cartCount;
    window.obtenerItemsCarrito = () => cartItems;
    window.eliminarDelCarrito = function(nombre) {
        const idx = cartItems.findIndex(i => i.nombre === nombre);
        if (idx !== -1) {
            cartCount -= cartItems[idx].cantidad;
            cartItems.splice(idx, 1);
            guardar();
            updateUI();
        }
    };


    const btnCarrito = document.getElementById('btnCarritoNav');
    const modalCarrito = document.getElementById('carritoModal');
    const cerrarCarrito = document.getElementById('cerrarCarrito');
    const cuerpoCarrito = document.getElementById('carritoCuerpo');
    const btnFinalizar = document.getElementById('btnFinalizarPedido');

    function renderCarrito() {
        if (!cuerpoCarrito) return;
        if (cartItems.length === 0) {
            cuerpoCarrito.innerHTML = '<div class="carrito-vacio"><span class="carrito-vacio-icono">🛒</span><p>Tu carrito está vacío</p><p style="font-size:0.8rem;margin-top:5px;">Añade productos desde nuestro catálogo</p></div>';
            if (btnFinalizar) btnFinalizar.style.display = 'none';
            return;
        }
        if (btnFinalizar) btnFinalizar.style.display = 'inline-block';
        let html = '',
            total = 0;
        cartItems.forEach(item => {
            const sub = item.precio * item.cantidad;
            total += sub;
            html += `<div class="carrito-item">
                <div class="carrito-item-info">
                    <img src="${item.imagen}" class="carrito-item-img">
                    <div><p class="carrito-item-nombre">${item.nombre}</p><p style="font-size:0.7rem;color:#999;">x${item.cantidad}</p></div>
                </div>
                <span class="carrito-item-precio">€ ${sub.toLocaleString()}</span>
                <button class="carrito-item-eliminar" data-nombre="${item.nombre}">✕</button>
            </div>`;
        });
        html += `<div class="carrito-total"><span>Total</span><span class="carrito-total-precio">€ ${total.toLocaleString()}</span></div>`;
        cuerpoCarrito.innerHTML = html;
        document.querySelectorAll('.carrito-item-eliminar').forEach(b => {
            b.addEventListener('click', function() {
                window.eliminarDelCarrito(this.getAttribute('data-nombre'));
                renderCarrito();
                updateUI();
            });
        });
    }

    function abrirCarrito(e) {
        if (e) e.preventDefault();
        renderCarrito();
        if (modalCarrito) {
            modalCarrito.classList.add('active');
            body.style.overflow = 'hidden';
        }
    }

    function cerrarModalCarrito() {
        if (modalCarrito) {
            modalCarrito.classList.remove('active');
            body.style.overflow = '';
        }
    }

    if (btnCarrito) btnCarrito.addEventListener('click', abrirCarrito);
    if (cerrarCarrito) cerrarCarrito.addEventListener('click', cerrarModalCarrito);
    if (modalCarrito) modalCarrito.addEventListener('click', function(e) { if (e.target === modalCarrito) cerrarModalCarrito(); });

    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', function() {
            if (cartItems.length === 0) return;
            let msg = 'Hola Soul, quiero finalizar mi pedido:%0A%0A';
            let total = 0;
            cartItems.forEach(i => {
                const sub = i.precio * i.cantidad;
                total += sub;
                msg += '• ' + i.nombre + ' x' + i.cantidad + ' = €' + sub.toLocaleString() + '%0A';
            });
            msg += '%0A*Total: €' + total.toLocaleString() + '*%0A%0ANombre:%0AEmail:%0ADirección:%0A%0APor favor contáctenme.';
            window.open('https://wa.me/59162669099?text=' + msg, '_blank');
            cerrarModalCarrito();
        });
    }

    const modalProd = document.getElementById('productoModal');
    const modalImg = document.getElementById('modalImg');
    const modalCat = document.getElementById('modalCategoria');
    const modalNom = document.getElementById('modalNombre');
    const modalPre = document.getElementById('modalPrecio');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalAddBtn = document.getElementById('modalAddToCart');

    let productoActual = null;

    window.abrirModalProducto = function(producto) {
        if (!modalProd) return;
        productoActual = producto;
        if (modalImg) modalImg.src = producto.imagen;
        if (modalCat) modalCat.textContent = producto.categoria;
        if (modalNom) modalNom.textContent = producto.nombre;
        if (modalPre) modalPre.textContent = '€ ' + producto.precio.toLocaleString();
        if (modalAddBtn) {
            modalAddBtn.textContent = 'Añadir al Carrito';
            modalAddBtn.onclick = function() {
                window.actualizarCarrito(producto.nombre, producto.precio, producto.imagen);
                modalAddBtn.textContent = '✓ Añadido';
                modalAddBtn.style.backgroundColor = 'var(--color-gold)';
                modalAddBtn.style.color = 'white';
                setTimeout(() => {
                    modalAddBtn.textContent = 'Añadir al Carrito';
                    modalAddBtn.style.backgroundColor = 'transparent';
                    modalAddBtn.style.color = 'var(--color-gold)';
                }, 1200);
            };
        }
        modalProd.classList.add('active');
        body.style.overflow = 'hidden';
    };

    function cerrarModalProd() {
        if (modalProd) {
            modalProd.classList.remove('active');
            body.style.overflow = '';
        }
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', cerrarModalProd);
    if (modalProd) modalProd.addEventListener('click', function(e) { if (e.target === modalProd) cerrarModalProd(); });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarModalProd();
            cerrarModalCarrito();
        }
    });

    window.addEventListener('storage', function(e) {
        if (e.key === 'soul_cart_items' || e.key === 'soul_cart_count') {
            cartItems = JSON.parse(localStorage.getItem('soul_cart_items') || '[]');
            cartCount = cartItems.reduce((s, i) => s + i.cantidad, 0);
            updateUI();
        }
    });
    const btnUsuario = document.getElementById('btnUsuarioNav');
    if (btnUsuario) {
        const usuario = JSON.parse(localStorage.getItem('soul_usuario') || 'null');
        if (usuario) {
            btnUsuario.querySelector('.user-icon').textContent = '✅';
        }
        btnUsuario.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'cuenta.html';
        });
    }
    updateUI();
    console.log(' Soul - Shared cargado correctamente.');
});
