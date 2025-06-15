document.addEventListener('DOMContentLoaded', function () {
    if (window.location.href.includes('listar.html')) {
        carregarColaboradores();

        const checkboxInativo = document.getElementById('mostrarInativos');
        if (checkboxInativo) {
            checkboxInativo.addEventListener('change', carregarColaboradores);
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', aplicarFiltroBuscaColaboradores);
        }
    }

    const colaboradorForm = document.getElementById('colaboradorForm');
    if (colaboradorForm) {
        colaboradorForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const userId = document.getElementById('userId')?.value;
            const isEditing = !!userId;

            const colaborador = {
                nomeColaborador: document.getElementById('nomeColaborador').value,
                emailColaborador: document.getElementById('emailColaborador').value,
                senhaColaborador: document.getElementById('senhaColaborador').value,
                confirmarSenha: document.getElementById('confirmarSenha').value,
                ativo: document.getElementById('ativo').checked
            };

            if (isEditing) {
                colaborador.userId = userId;
            }

            salvarColaborador(colaborador, isEditing)
                .then(() => {
                    Utils.notifications.success(isEditing ? 'Colaborador atualizado com sucesso!' : 'Colaborador cadastrado com sucesso!');
                    window.location.href = 'listar.html';
                })
                .catch(error => {
                    Utils.notifications.error('Erro ao ' + (isEditing ? 'atualizar' : 'cadastrar') + ' colaborador: ' + error.message);
                });
        });
    }
});

async function carregarColaboradores() {
    try {
        if (!Utils.validarAutenticacao()) return;

        document.getElementById('carregandoColaboradores').classList.remove('d-none');
        document.getElementById('nenhumColaborador').classList.add('d-none');

        const colaboradores = await Utils.fetchAPI('/colaboradores');
        const tabelaColaboradores = document.getElementById('tabelaColaboradores');
        const mostrarInativos = document.getElementById('mostrarInativos')?.checked || false;

        document.getElementById('carregandoColaboradores').classList.add('d-none');

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        let colaboradoresFiltrados = colaboradores;

        if (usuario.tipo === 'GESTOR') {
            colaboradoresFiltrados = colaboradores.filter(c => c.gestor && c.gestor.userId === parseInt(usuario.id));
        }

        const colaboradoresAtivos = mostrarInativos ? colaboradoresFiltrados : colaboradoresFiltrados.filter(c => c.ativo);

        if (colaboradoresAtivos.length === 0) {
            document.getElementById('nenhumColaborador').classList.remove('d-none');
            return;
        }

        tabelaColaboradores.innerHTML = '';

        colaboradoresAtivos.forEach(colaborador => {
            const tr = document.createElement('tr');

            if (!colaborador.ativo) tr.classList.add('table-secondary');

            tr.innerHTML = `
                <td>${colaborador.nomeColaborador}</td>
                <td>${colaborador.emailColaborador}</td>
                <td>
                    <span class="badge bg-${colaborador.ativo ? 'success' : 'danger'}">
                        ${colaborador.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                </td>
                <td>
                    <a href="editar.html?id=${colaborador.userId}" class="btn btn-sm btn-primary">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm btn-${colaborador.ativo ? 'danger' : 'success'} toggle-status" data-id="${colaborador.userId}" data-status="${colaborador.ativo}">
                        <i class="bi bi-${colaborador.ativo ? 'person-x' : 'person-check'}"></i>
                    </button>
                </td>
            `;
            tabelaColaboradores.appendChild(tr);
        });

        adicionarEventListenersColaboradores();

    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar colaboradores');
        document.getElementById('carregandoColaboradores').classList.add('d-none');
    }
}

function adicionarEventListenersColaboradores() {
    document.querySelectorAll('.toggle-status').forEach(btn => {
        btn.addEventListener('click', function () {
            const colaboradorId = this.getAttribute('data-id');
            const isAtivo = this.getAttribute('data-status') === 'true';
            const mensagem = isAtivo ? 'Tem certeza que deseja desativar este colaborador?' : 'Deseja reativar este colaborador?';

            if (Utils.confirm(mensagem)) {
                toggleStatusColaborador(colaboradorId, !isAtivo);
            }
        });
    });
}

async function carregarColaborador(id) {
    try {
        const colaborador = await Utils.fetchAPI(`/colaboradores/${id}`);
        document.getElementById('userId').value = colaborador.userId;
        document.getElementById('nomeColaborador').value = colaborador.nomeColaborador;
        document.getElementById('emailColaborador').value = colaborador.emailColaborador;
        document.getElementById('ativo').checked = colaborador.ativo;
        document.getElementById('senhaColaborador').value = '';
        document.getElementById('confirmarSenha').value = '';
    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar dados do colaborador');
        window.location.href = 'listar.html';
    }
}

async function salvarColaborador(colaborador, isEditing = false) {
    try {
        const usuarioLogado = JSON.parse(localStorage.getItem('usuario') || '{}');

        if (colaborador.senhaColaborador && colaborador.senhaColaborador !== colaborador.confirmarSenha) {
            throw new Error('As senhas não correspondem');
        }

        delete colaborador.confirmarSenha;

        if (isEditing && !colaborador.senhaColaborador) {
            delete colaborador.senhaColaborador;
        }

        if (!isEditing) {
            colaborador.gestor = { userId: usuarioLogado.id };
        }

        const endpoint = isEditing ? `/colaboradores/${colaborador.userId}` : `/colaboradores`;
        const method = isEditing ? 'PUT' : 'POST';

        return await Utils.fetchAPI(endpoint, method, colaborador);
    } catch (error) {
        Utils.handleError(error, 'Erro ao salvar colaborador');
        throw error;
    }
}

async function toggleStatusColaborador(id, novoStatus) {
    try {
        const colaborador = await Utils.fetchAPI(`/colaboradores/${id}`);
        colaborador.ativo = novoStatus;
        await Utils.fetchAPI(`/colaboradores/${id}`, 'PUT', colaborador);
        Utils.notifications.success(`Colaborador ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
        carregarColaboradores();
    } catch (error) {
        Utils.handleError(error, 'Erro ao atualizar status do colaborador');
    }
}

function aplicarFiltroBuscaColaboradores() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tabelaColaboradores tr');

    rows.forEach(row => {
        const nome = row.querySelector('td:first-child').textContent.toLowerCase();
        const email = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        row.style.display = nome.includes(searchTerm) || email.includes(searchTerm) ? '' : 'none';
    });
}
