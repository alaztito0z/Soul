const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com';

document.addEventListener('DOMContentLoaded', function() {

    const body = document.body;
    const loginSection = document.getElementById('loginSection');
    const perfilSection = document.getElementById('perfilSection');
    let usuarioActual = JSON.parse(localStorage.getItem('soul_usuario') || 'null');

    if (usuarioActual) {
        mostrarPerfil(usuarioActual);
    } else {
        inicializarGoogleSignIn();
    }

    function inicializarGoogleSignIn() {
        if (typeof google === 'undefined' || !google.accounts) {
            document.getElementById('googleBtnContainer').innerHTML =
                '<p style="color:var(--color-gray);">Cargando Google Sign-In...</p>';
            return;
        }

        google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
        });

        google.accounts.id.renderButton(
            document.getElementById('googleBtnContainer'), {
                theme: 'outline',
                size: 'large',
                text: 'signin_with',
                shape: 'pill',
                width: 280
            }
        );

        google.accounts.id.prompt();
    }

    function handleCredentialResponse(response) {
        const responsePayload = decodeJwtResponse(response.credential);

        const usuario = {
            nombre: responsePayload.name,
            email: responsePayload.email,
            avatar: responsePayload.picture,
            googleId: responsePayload.sub,
            fechaRegistro: new Date().toISOString(),
            primerPedido: true,
            puntos: 0,
            nivel: 'Nuevo',
            descuento: 10,
            pedidos: [],
            deseos: []
        };

        localStorage.setItem('soul_usuario', JSON.stringify(usuario));
        usuarioActual = usuario;
        mostrarPerfil(usuario);
    }

    function decodeJwtResponse(token) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')));
    }

    function mostrarPerfil(usuario) {
        loginSection.style.display = 'none';
        perfilSection.style.display = 'block';

        document.getElementById('perfilAvatar').src = usuario.avatar;
        document.getElementById('perfilNombre').textContent = usuario.nombre;
        document.getElementById('perfilEmail').textContent = usuario.email;
        document.getElementById('totalPedidos').textContent = usuario.pedidos.length;
        document.getElementById('totalPuntos').textContent = usuario.puntos;
        document.getElementById('nivelCliente').textContent = usuario.nivel;
        document.getElementById('descuentoActivo').textContent = usuario.descuento + '%';

        document.getElementById('configNombre').value = usuario.nombre;
        document.getElementById('configEmail').value = usuario.email;

        const configGuardado = JSON.parse(localStorage.getItem('soul_config') || '{}');
        if (configGuardado.telefono) document.getElementById('configTelefono').value = configGuardado.telefono;
        if (configGuardado.direccion) document.getElementById('configDireccion').value = configGuardado.direccion;
    }

    document.querySelectorAll('.perfil-menu a[data-tab]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.getAttribute('data-tab');

            document.querySelectorAll('.perfil-menu a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.perfil-tab').forEach(t => t.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
        });
    });

    document.getElementById('btnCerrarSesion').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('soul_usuario');
        google.accounts.id.disableAutoSelect();
        location.reload();
    });

    document.getElementById('btnGuardarConfig').addEventListener('click', function() {
        const config = {
            telefono: document.getElementById('configTelefono').value,
            direccion: document.getElementById('configDireccion').value
        };
        localStorage.setItem('soul_config', JSON.stringify(config));
        alert('Configuración guardada correctamente.');
    });

    const btnUsuarioNav = document.getElementById('btnUsuarioNav');
    if (btnUsuarioNav) {
        if (usuarioActual) {
            btnUsuarioNav.querySelector('.user-icon').textContent = '✅';
            btnUsuarioNav.title = 'Mi Cuenta';
        }
        btnUsuarioNav.addEventListener('click', function() {
            window.location.href = 'cuenta.html';
        });
    }

    console.log('✨ Soul Cuenta cargado.');
});