let paginaAtual = 0;
let tamanhoPagina = 10;
let totalPaginas = 0;
let filtros = {};

const tiposAcao = {
    'LOGIN': { label: 'Login', cor: 'bg-info' },
    'LOGOUT': { label: 'Logout', cor: 'bg-warning' },
    'CRIAR_PRODUTO': { label: 'Criação de Produto', cor: 'bg-primary' },
    'EDITAR_PRODUTO': { label: 'Edição de Produto', cor: 'bg-secondary' },
    'ENTRADA_ESTOQUE': { label: 'Entrada de Estoque', cor: 'bg-success' },
    'SAIDA_ESTOQUE': { label: 'Saída de Estoque', cor: 'bg-danger' }
};

function gerarQueryParams(baseUrl, filtros) {
    const params = new URLSearchParams();
    params.set('page', paginaAtual);
    params.set('size', tamanhoPagina);
    for (const chave in filtros) {
        if (filtros[chave]) params.set(chave, filtros[chave]);
    }
    return `${baseUrl}?${params.toString()}`;
}

async function carregarLogsAuditoria() {
    try {
        if (!Utils.validarAutenticacao()) return;
        document.getElementById('carregandoAuditoria').classList.remove('d-none');
        document.getElementById('nenhumRegistro').classList.add('d-none');
        const url = gerarQueryParams('/logs', filtros);
        const response = await Utils.fetchAPI(url);
        document.getElementById('carregandoAuditoria').classList.add('d-none');
        const { content, totalPages, number } = response;
        paginaAtual = number;
        totalPaginas = totalPages;
        if (!content || content.length === 0) {
            document.getElementById('nenhumRegistro').classList.remove('d-none');
            document.getElementById('paginacao').innerHTML = '';
            return;
        }
        renderizarRegistros(content);
        renderizarPaginacao();
    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar logs de auditoria');
        document.getElementById('carregandoAuditoria').classList.add('d-none');
    }
}

function renderizarRegistros(registros) {
    registros.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    const tabelaAuditoria = document.getElementById('tabelaAuditoria');
    tabelaAuditoria.innerHTML = '';
    registros.forEach(registro => {
        const tr = document.createElement('tr');
        aplicarClasseRegistro(tr, registro.tipoAcao);
        const dataFormatada = formatarData(registro.dataHora);
        const usuario = obterNomeUsuario(registro);
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${usuario}</td>
            <td><span class="badge ${obterCorTipoAcao(registro.tipoAcao)}">${formatarTipoAcao(registro.tipoAcao)}</span></td>
            <td>${registro.descricao || 'Sem descrição'}</td>
            <td>${registro.ipUsuario || 'N/A'}</td>
            <td><button class="btn btn-sm btn-info view-details" data-id="${registro.id}"><i class="bi bi-eye"></i></button></td>
        `;
        tabelaAuditoria.appendChild(tr);
    });
    adicionarEventListenersDetalhes();
}

function aplicarClasseRegistro(tr, tipoAcao) {
    if (tipoAcao.includes('ENTRADA')) tr.classList.add('table-success-light');
    else if (tipoAcao.includes('SAIDA')) tr.classList.add('table-danger-light');
    else if (tipoAcao === 'LOGIN') tr.classList.add('table-info-light');
    else if (tipoAcao === 'LOGOUT') tr.classList.add('table-warning-light');
}

function obterNomeUsuario(registro) {
    if (registro.gestor) return `${registro.gestor.nome || registro.gestor.nomeGestor || 'N/A'} (Gestor)`;
    if (registro.colaborador) return `${registro.colaborador.nomeColaborador || 'N/A'} (Colaborador)`;
    return 'Sistema';
}

function obterCorTipoAcao(tipoAcao) {
    return tiposAcao[tipoAcao]?.cor || 'bg-dark';
}

function formatarTipoAcao(tipoAcao) {
    return tiposAcao[tipoAcao]?.label || tipoAcao;
}

function renderizarPaginacao() {
    const paginacao = document.getElementById('paginacao');
    paginacao.innerHTML = '';
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${paginaAtual === 0 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `
        <button class="page-link" ${paginaAtual === 0 ? 'disabled' : ''} data-page="${paginaAtual - 1}">
            <i class="bi bi-chevron-left"></i>
        </button>
    `;
    paginacao.appendChild(liAnterior);

    const maxPaginas = 5;
    const metade = Math.floor(maxPaginas / 2);
    let inicio = Math.max(0, paginaAtual - metade);
    let fim = Math.min(totalPaginas - 1, inicio + maxPaginas - 1);
    if (fim - inicio + 1 < maxPaginas) inicio = Math.max(0, fim - maxPaginas + 1);

    for (let i = inicio; i <= fim; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaAtual ? 'active' : ''}`;
        li.innerHTML = `<button class="page-link" data-page="${i}">${i + 1}</button>`;
        paginacao.appendChild(li);
    }

    const liProximo = document.createElement('li');
    liProximo.className = `page-item ${paginaAtual === totalPaginas - 1 ? 'disabled' : ''}`;
    liProximo.innerHTML = `
        <button class="page-link" ${paginaAtual === totalPaginas - 1 ? 'disabled' : ''} data-page="${paginaAtual + 1}">
            <i class="bi bi-chevron-right"></i>
        </button>
    `;
    paginacao.appendChild(liProximo);

    document.querySelectorAll('#paginacao button').forEach(btn => {
        btn.addEventListener('click', function () {
            if (!this.hasAttribute('disabled')) {
                paginaAtual = parseInt(this.getAttribute('data-page'));
                carregarLogsAuditoria();
            }
        });
    });
}

function formatarData(dataString) {
    const data = new Date(dataString);
    return isNaN(data.getTime()) ? 'Data não disponível' : `${data.toLocaleDateString('pt-BR')} ${data.toLocaleTimeString('pt-BR')}`;
}

function adicionarEventListenersDetalhes() {
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', async function () {
            const id = this.getAttribute('data-id');
            try {
                const registros = await Utils.fetchAPI(`/logs?size=100`);
                const registro = registros.content.find(r => r.id == id);
                if (registro) exibirDetalhesRegistro(registro);
            } catch (error) {
                Utils.handleError(error, 'Erro ao carregar detalhes do log');
            }
        });
    });
}

function exibirDetalhesRegistro(registro) {
    document.getElementById('detalheDataHora').textContent = formatarData(registro.dataHora);
    document.getElementById('detalheUsuario').textContent = obterNomeUsuario(registro);
    document.getElementById('detalheTipoAcao').textContent = formatarTipoAcao(registro.tipoAcao);
    document.getElementById('detalheDescricao').textContent = registro.descricao || 'Sem descrição';
    document.getElementById('detalheIP').textContent = registro.ipUsuario || 'N/A';
    const secaoDetalheRegistro = document.getElementById('secaoDetalheRegistro');
    if (registro.idRegistro) {
        secaoDetalheRegistro.classList.remove('d-none');
        document.getElementById('detalheRegistroId').textContent = registro.idRegistro;
    } else {
        secaoDetalheRegistro.classList.add('d-none');
    }
    const detalhesModal = new bootstrap.Modal(document.getElementById('detalhesModal'));
    detalhesModal.show();
}

async function carregarUsuarios() {
    try {
        const selectUsuario = document.getElementById('usuario');
        const gestores = await Utils.fetchAPI('/gestores');
        if (gestores?.length) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Gestores';
            gestores.forEach(gestor => {
                const option = document.createElement('option');
                option.value = `gestor_${gestor.id}`;
                option.textContent = gestor.nome;
                optgroup.appendChild(option);
            });
            selectUsuario.appendChild(optgroup);
        }
        const colaboradores = await Utils.fetchAPI('/colaboradores');
        if (colaboradores?.length) {
            const optgroup = document.createElement('optgroup');
            optgroup.label = 'Colaboradores';
            colaboradores.forEach(colaborador => {
                const option = document.createElement('option');
                option.value = `colaborador_${colaborador.id}`;
                option.textContent = colaborador.nomeColaborador;
                optgroup.appendChild(option);
            });
            selectUsuario.appendChild(optgroup);
        }
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (!Utils.validarAutenticacao()) return;
    carregarLogsAuditoria();
    carregarUsuarios();

    document.getElementById('filtrosForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const tipoAcao = document.getElementById('tipoAcao').value;
        const usuario = document.getElementById('usuario').value;
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        filtros = {};
        if (tipoAcao) filtros.tipoAcao = tipoAcao;
        if (usuario) {
            const [tipo, id] = usuario.split('_');
            if (tipo === 'gestor') filtros.gestorId = id;
            else if (tipo === 'colaborador') filtros.colaboradorId = id;
        }
        if (dataInicio) filtros.dataInicio = new Date(dataInicio).toISOString();
        if (dataFim) filtros.dataFim = new Date(dataFim).toISOString();
        paginaAtual = 0;
        carregarLogsAuditoria();
        const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById('filtrosCollapse'));
        if (bsCollapse) bsCollapse.hide();
    });

    document.getElementById('btnLimparFiltros').addEventListener('click', function () {
        document.getElementById('tipoAcao').value = '';
        document.getElementById('usuario').value = '';
        document.getElementById('dataInicio').value = '';
        document.getElementById('dataFim').value = '';
        filtros = {};
        paginaAtual = 0;
        carregarLogsAuditoria();
    });

    document.getElementById('btnExportar').addEventListener('click', function () {
        exportarRegistros();
    });
});

function exportarRegistros() {
    Utils.notifications.info('Funcionalidade de exportação em desenvolvimento');
}
