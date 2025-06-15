async function login(email, senha) {
    try {
        document.getElementById('loginError').classList.add('d-none');

        let response = await fetch(`${Utils.API_URL}/gestores/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const gestor = await response.json();
            localStorage.setItem('usuario', JSON.stringify({
                id: gestor.userId,
                nome: gestor.nomeGestor,
                email: gestor.emailGestor,
                empresa: gestor.empresaGestor,
                tipo: 'GESTOR'
            }));
            localStorage.setItem('token', gestor.token || 'Bearer-token');
            localStorage.setItem('tipoToken', 'Bearer');
            window.location.href = 'dashboard.html';
            return;
        }

        response = await fetch(`${Utils.API_URL}/colaboradores/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        if (response.ok) {
            const colaborador = await response.json();
            localStorage.setItem('usuario', JSON.stringify({
                id: colaborador.userId,
                nome: colaborador.nomeColaborador,
                email: colaborador.emailColaborador,
                gestorId: colaborador.gestor.userId,
                tipo: 'COLABORADOR'
            }));
            localStorage.setItem('token', colaborador.token || 'Bearer-token');
            localStorage.setItem('tipoToken', 'Bearer');
            window.location.href = 'dashboard.html';
            return;
        }

        document.getElementById('loginError').classList.remove('d-none');
    } catch {
        document.getElementById('loginError').classList.remove('d-none');
    }
}

function verificarAutenticacao() {
    return Utils.validarAutenticacao();
}

document.addEventListener('DOMContentLoaded', function () {
    if (!window.location.href.includes('index.html') && !window.location.href.includes('cadastro-gestor.html')) {
        if (!verificarAutenticacao()) return;
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            login(email, senha);
        });
    }
});
