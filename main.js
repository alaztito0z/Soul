document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;
    let cartCount = 0;

    (function() {
        emailjs.init("a3M2W-KszQDQnTOyj");
    })();

    const loader = document.querySelector('.loader');
    body.classList.add('loading');

    window.addEventListener('load', function() {
        setTimeout(function() {
            loader.classList.add('hidden');
            body.classList.remove('loading');
        }, 1200);
    });

    const cursor = document.querySelector('.cursor');
    const cursorDot = document.querySelector('.cursor-dot');
    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;

    if (window.innerWidth > 768) {
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

        const hoverElements = document.querySelectorAll('a, button, .cat-item, .btn');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
        });
    }

    const particlesContainer = document.getElementById('particles');

    function createParticle() {
        const particle = document.createElement('div');
        particle.classList.add('particula');
        const size = Math.random() * 4 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = Math.random() * 10 + 10 + 's';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particlesContainer.appendChild(particle);
        setTimeout(() => { particle.remove(); }, 15000);
    }

    setInterval(createParticle, 800);
    for (let i = 0; i < 15; i++) {
        setTimeout(createParticle, Math.random() * 2000);
    }

    const header = document.querySelector('.header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.createElement('div');
    overlay.classList.add('menu-overlay');
    document.body.appendChild(overlay);

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        body.style.overflow = body.style.overflow === 'hidden' ? '' : 'hidden';
    });

    overlay.addEventListener('click', closeMenu);

    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    function closeMenu() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    }

    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', function() {
        if (heroBg) {
            const scrollY = window.scrollY;
            heroBg.style.transform = `translateY(${scrollY * 0.5}px)`;
        }
    });

    const scrollTopBtn = document.querySelector('.scroll-top');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });

    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    const soundToggle = document.querySelector('.sound-toggle');
    const soundIcon = document.querySelector('.sound-icon');
    const ambientSound = document.getElementById('ambientSound');
    let soundOn = false;

    if (soundToggle) {
        soundToggle.addEventListener('click', function() {
            if (!soundOn) {
                ambientSound.play().catch(() => {});
                soundIcon.textContent = '🔊';
                soundOn = true;
            } else {
                ambientSound.pause();
                soundIcon.textContent = '🔇';
                soundOn = false;
            }
        });
    }

    const cartCountEl = document.querySelector('.cart-count');
    const stickyCart = document.getElementById('stickyCart');
    const stickyCartCount = document.querySelector('.sticky-cart-count');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');
    const addToCartModal = document.querySelector('.add-to-cart-modal');

    function updateCart() {
        cartCount++;
        cartCountEl.textContent = cartCount;
        stickyCartCount.textContent = cartCount + ' producto' + (cartCount > 1 ? 's' : '');
    }

    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            updateCart();
            btn.textContent = 'Añadido';
            btn.style.backgroundColor = 'var(--color-gold)';
            btn.style.color = 'var(--color-white)';
            setTimeout(() => {
                btn.textContent = 'Anadir al Carrito';
                btn.style.backgroundColor = 'transparent';
                btn.style.color = 'var(--color-gold)';
            }, 1500);
        });
    });

    if (addToCartModal) {
        addToCartModal.addEventListener('click', function(e) {
            if (this.textContent === 'Finalizar Pedido') {
                e.preventDefault();
                modal.classList.remove('active');
                body.style.overflow = '';
                const contactoSection = document.getElementById('contacto');
                if (contactoSection) {
                    contactoSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                const mensajeField = document.getElementById('mensaje');
                if (mensajeField) {
                    mensajeField.value = 'Quiero finalizar mi pedido de ' + cartCount + ' producto' + (cartCount > 1 ? 's' : '') + '. Por favor contactenme.';
                }
                setTimeout(() => {
                    addToCartModal.textContent = 'Anadir al Carrito';
                    document.querySelector('.modal-descripcion').textContent = 'Cada pieza Soul es unica, creada con materiales de la mas alta calidad y un diseno que trasciende tendencias.';
                }, 500);
            } else {
                e.preventDefault();
                updateCart();
                this.textContent = 'Añadido';
                setTimeout(() => {
                    this.textContent = 'Anadir al Carrito';
                }, 1500);
            }
        });
    }

    window.addEventListener('scroll', function() {
        if (cartCount > 0 && window.scrollY > 800) {
            stickyCart.classList.add('visible');
        } else {
            stickyCart.classList.remove('visible');
        }
    });

    const modal = document.getElementById('productoModal');
    const modalImg = document.getElementById('modalImg');
    const modalCategoria = document.getElementById('modalCategoria');
    const modalNombre = document.getElementById('modalNombre');
    const modalPrecio = document.getElementById('modalPrecio');
    const modalClose = document.querySelector('.modal-close');

    function restaurarModal() {
        const desc = document.querySelector('.modal-descripcion');
        if (desc) desc.textContent = 'Cada pieza Soul es unica, creada con materiales de la mas alta calidad y un diseno que trasciende tendencias.';
        if (addToCartModal) {
            addToCartModal.textContent = 'Anadir al Carrito';
            addToCartModal.style.display = 'inline-block';
        }
    }

    if (modalClose) {
        modalClose.addEventListener('click', function() {
            modal.classList.remove('active');
            body.style.overflow = '';
            restaurarModal();
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                body.style.overflow = '';
                restaurarModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            modal.classList.remove('active');
            body.style.overflow = '';
            restaurarModal();
        }
    });

    const contactoForm = document.getElementById('contactoForm');
    const formMensaje = document.getElementById('formMensaje');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');

    if (contactoForm) {
        contactoForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const email = document.getElementById('email').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            if (!nombre || !email) {
                formMensaje.textContent = 'Por favor completa todos los campos obligatorios.';
                formMensaje.className = 'form-mensaje error';
                return;
            }

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                formMensaje.textContent = 'Por favor ingresa un email valido.';
                formMensaje.className = 'form-mensaje error';
                return;
            }

            btnText.style.display = 'none';
            btnLoader.style.display = 'inline';
            submitBtn.disabled = true;

            const templateParams = {
                nombre: nombre,
                email: email,
                mensaje: mensaje || 'No especificado',
                fecha: new Date().toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            emailjs.send('service_r2vdxb7', 'template_a7whhvg', templateParams)
                .then(function(response) {
                    console.log('Email enviado:', response.status);
                    formMensaje.textContent = 'Gracias ' + nombre + '. Nos pondremos en contacto contigo pronto.';
                    formMensaje.className = 'form-mensaje success';
                    contactoForm.reset();
                    btnText.style.display = 'inline';
                    btnLoader.style.display = 'none';
                    submitBtn.disabled = false;

                    setTimeout(() => {
                        formMensaje.textContent = '';
                        formMensaje.className = 'form-mensaje';
                    }, 5000);
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    formMensaje.textContent = 'Hubo un error. Intenta de nuevo o contactanos directamente.';
                    formMensaje.className = 'form-mensaje error';
                    btnText.style.display = 'inline';
                    btnLoader.style.display = 'none';
                    submitBtn.disabled = false;
                });
        });
    }

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const animar = [
        '.filosofia-texto',
        '.destacado-info',
        '.esencia-item',
        '.testimonio-texto',
        '.contacto-info'
    ];

    animar.forEach(selector => {
        const elementos = document.querySelectorAll(selector);
        elementos.forEach((el, index) => {
            el.classList.add('fade-up');
            el.style.transitionDelay = `${index * 0.1}s`;
            observer.observe(el);
        });
    });

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    const btnMasDetalles = document.getElementById('btnMasDetalles');
    if (btnMasDetalles) {
        btnMasDetalles.addEventListener('click', function(e) {
            e.preventDefault();
            restaurarModal();
            const destacadoImg = document.querySelector('.destacado-img img');
            if (destacadoImg && modal) {
                modalImg.src = destacadoImg.getAttribute('src');
                modalCategoria.textContent = 'Destacado';
                modalNombre.textContent = 'Pulsera de Plata';
                modalPrecio.textContent = 'Bs 1.250';
                modal.classList.add('active');
                body.style.overflow = 'hidden';
            }
        });
    }

    const btnVerCarrito = document.getElementById('btnVerCarrito');
    const btnCarritoNav = document.getElementById('btnCarritoNav');

    function abrirCarrito() {
        restaurarModal();
        if (cartCount === 0) {
            if (modalImg) modalImg.src = 'anillos.jpg';
            if (modalCategoria) modalCategoria.textContent = '';
            if (modalNombre) modalNombre.textContent = 'Tu carrito esta vacio';
            if (modalPrecio) modalPrecio.textContent = '';
            const desc = document.querySelector('.modal-descripcion');
            if (desc) desc.textContent = 'Anade productos desde nuestras categorias o desde la seccion destacada.';
            if (addToCartModal) addToCartModal.style.display = 'none';
            if (modal) modal.classList.add('active');
            body.style.overflow = 'hidden';
        } else {
            if (modalImg) modalImg.src = 'pulsera.jpg';
            if (modalCategoria) modalCategoria.textContent = 'Tu Carrito';
            if (modalNombre) modalNombre.textContent = cartCount + ' producto' + (cartCount > 1 ? 's' : '');
            if (modalPrecio) modalPrecio.textContent = 'Total estimado: Bs ' + (cartCount * 1250).toLocaleString();
            const desc = document.querySelector('.modal-descripcion');
            if (desc) desc.textContent = 'Tus joyas Soul te esperan. Finaliza tu pedido y las recibiras en 3-5 dias habiles.';
            if (addToCartModal) {
                addToCartModal.style.display = 'inline-block';
                addToCartModal.textContent = 'Finalizar Pedido';
            }
            if (modal) modal.classList.add('active');
            body.style.overflow = 'hidden';
        }
    }

    if (btnVerCarrito) {
        btnVerCarrito.addEventListener('click', function(e) {
            e.preventDefault();
            abrirCarrito();
        });
    }

    if (btnCarritoNav) {
        btnCarritoNav.addEventListener('click', function(e) {
            e.preventDefault();
            abrirCarrito();
        });
    }

    document.querySelectorAll('.footer-col ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            const texto = this.textContent.trim();
            const href = this.getAttribute('href');
            if (href && href !== '#' && !href.startsWith('index')) {
                return;
            }
            e.preventDefault();
            if (texto === 'Contacto' || texto === 'FAQ' || texto === 'Envios' || texto === 'Cuidados') {
                const contactoSection = document.getElementById('contacto');
                if (contactoSection) {
                    contactoSection.scrollIntoView({ behavior: 'smooth' });
                }
            } else if (texto === 'Anillos' || texto === 'Aretes' || texto === 'Collares' || texto === 'Relojes') {
                window.location.href = 'catalogo.html?categoria=' + texto.toLowerCase();
            }
        });
    });

    function initCarrusel() {
        const gridCategorias = document.getElementById('gridCategorias');
        const flechaPrev = document.getElementById('flechaPrev');
        const flechaNext = document.getElementById('flechaNext');
        const carruselDots = document.getElementById('carruselDots');

        if (!gridCategorias || !flechaPrev || !flechaNext || !carruselDots) return;

        const catItems = gridCategorias.querySelectorAll('.cat-item');
        const totalItems = catItems.length;
        let currentIndex = 0;
        let startX = 0;
        let isDragging = false;

        function getPositionClass(index, current) {
            const diff = index - current;
            if (diff === 0) return 'centro';
            if (diff === -1 || diff === totalItems - 1) return 'izquierda';
            if (diff === 1 || diff === -(totalItems - 1)) return 'derecha';
            if (diff < -1) return 'oculto-izquierda';
            return 'oculto-derecha';
        }

        function updateCarousel() {
            if (window.innerWidth <= 768) {
                const itemWidth = catItems[0].offsetWidth;
                const gap = 16;
                const wrapperWidth = gridCategorias.parentElement.offsetWidth;
                const centerOffset = (wrapperWidth - itemWidth) / 2;
                const offset = currentIndex * (itemWidth + gap) - centerOffset;
                gridCategorias.style.transform = 'translateX(-' + offset + 'px)';
            } else {
                gridCategorias.style.transform = 'translateX(0)';
                catItems.forEach((item, index) => {
                    item.className = 'cat-item';
                    const posClass = getPositionClass(index, currentIndex);
                    item.classList.add(posClass);
                });
            }
            updateDots();
        }

        function updateDots() {
            carruselDots.innerHTML = '';
            for (let i = 0; i < totalItems; i++) {
                const dot = document.createElement('span');
                dot.classList.add('carrusel-dot');
                if (i === currentIndex) dot.classList.add('active');
                dot.addEventListener('click', function() {
                    currentIndex = i;
                    updateCarousel();
                });
                carruselDots.appendChild(dot);
            }
        }

        flechaPrev.addEventListener('click', function() {
            currentIndex = (currentIndex - 1 + totalItems) % totalItems;
            updateCarousel();
        });

        flechaNext.addEventListener('click', function() {
            currentIndex = (currentIndex + 1) % totalItems;
            updateCarousel();
        });

        gridCategorias.addEventListener('touchstart', function(e) {
            if (window.innerWidth > 768) return;
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        gridCategorias.addEventListener('touchmove', function(e) {
            if (window.innerWidth > 768) return;
            if (!isDragging) return;
            const diff = startX - e.touches[0].clientX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    currentIndex = (currentIndex + 1) % totalItems;
                } else {
                    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
                }
                updateCarousel();
                isDragging = false;
            }
        });

        gridCategorias.addEventListener('touchend', function() {
            isDragging = false;
        });

        updateCarousel();
    }

    setTimeout(initCarrusel, 200);

    console.log('Soul - Joyeria con Alma cargada correctamente.');
});
