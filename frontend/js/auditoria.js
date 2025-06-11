// Variáveis globais
let paginaAtual = 0;
let tamanhoPagina = 10;
let totalPaginas = 0;
let filtros = {};

// Carregar logs de auditoria
async function carregarLogsAuditoria() {
    try {
        if (!Utils.validarAutenticacao()) return;

        document.getElementById('carregandoAuditoria').classList.remove('d-none');
        document.getElementById('nenhumRegistro').classList.add('d-none');
        
        // Construir URL com parâmetros de paginação e filtros
        let url = `/logs?page=${paginaAtual}&size=${tamanhoPagina}`;
        
        // Adicionar filtros se existirem
        if (filtros.tipoAcao) url += `&tipoAcao=${filtros.tipoAcao}`;
        if (filtros.dataInicio) url += `&dataInicio=${filtros.dataInicio}`;
        if (filtros.dataFim) url += `&dataFim=${filtros.dataFim}`;
        if (filtros.gestorId) url += `&gestorId=${filtros.gestorId}`;
        if (filtros.colaboradorId) url += `&colaboradorId=${filtros.colaboradorId}`;
        
        const response = await Utils.fetchAPI(url);
        
        document.getElementById('carregandoAuditoria').classList.add('d-none');
        
        // Processar resposta da API
        const { content, totalPages, number } = response;
        paginaAtual = number;
        totalPaginas = totalPages;
        
        if (!content || content.length === 0) {
            document.getElementById('nenhumRegistro').classList.remove('d-none');
            document.getElementById('paginacao').innerHTML = '';
            return;
        }

        // Renderizar registros na tabela
        renderizarRegistros(content);
        
        // Atualizar paginação
        renderizarPaginacao();
        
    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar logs de auditoria');
        document.getElementById('carregandoAuditoria').classList.add('d-none');
    }
}

// Renderizar registros na tabela
function renderizarRegistros(registros) {
    // Garantir que os registros estejam ordenados por data decrescente
    registros.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora));
    
    const tabelaAuditoria = document.getElementById('tabelaAuditoria');
    tabelaAuditoria.innerHTML = '';
    
    registros.forEach(registro => {
        const tr = document.createElement('tr');
        
        // Aplicar classes conforme o tipo de ação
        aplicarClasseRegistro(tr, registro.tipoAcao);
        
        const dataFormatada = formatarData(registro.dataHora);
        const usuario = obterNomeUsuario(registro);
        
        tr.innerHTML = `
            <td>${dataFormatada}</td>
            <td>${usuario}</td>
            <td>
                <span class="badge ${obterCorTipoAcao(registro.tipoAcao)}">
                    ${formatarTipoAcao(registro.tipoAcao)}
                </span>
            </td>
            <td>${registro.descricao || 'Sem descrição'}</td>
            <td>${registro.ipUsuario || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-info view-details" data-id="${registro.id}">
                    <i class="bi bi-eye"></i>
                </button>
            </td>
        `;
        tabelaAuditoria.appendChild(tr);
    });
    
    // Adicionar event listeners para botões de detalhes
    adicionarEventListenersDetalhes();
}

// Aplicar classe ao registro conforme o tipo de ação
function aplicarClasseRegistro(tr, tipoAcao) {
    if (tipoAcao.includes('ENTRADA')) {
        tr.classList.add('table-success-light');
    } else if (tipoAcao.includes('SAIDA')) {
        tr.classList.add('table-danger-light');
    } else if (tipoAcao === 'LOGIN') {
        tr.classList.add('table-info-light');
    } else if (tipoAcao === 'LOGOUT') {
        tr.classList.add('table-warning-light');
    }
}

// Obter nome do usuário (gestor ou colaborador)
function obterNomeUsuario(registro) {
    if (registro.gestor) {
        // GestorEntity pode ter diferentes campos para nome
        return `${registro.gestor.nome || registro.gestor.nomeGestor || 'N/A'} (Gestor)`;
    } else if (registro.colaborador) {
        return `${registro.colaborador.nomeColaborador || 'N/A'} (Colaborador)`;
    }
    return 'Sistema';
}

// Obter cor para o badge de tipo de ação
function obterCorTipoAcao(tipoAcao) {
    const cores = {
        'LOGIN': 'bg-info',
        'LOGOUT': 'bg-warning',
        'CRIAR_PRODUTO': 'bg-primary',
        'EDITAR_PRODUTO': 'bg-secondary',
        'ENTRADA_ESTOQUE': 'bg-success',
        'SAIDA_ESTOQUE': 'bg-danger'
    };
    
    return cores[tipoAcao] || 'bg-dark';
}

// Formatar tipo de ação para exibição
function formatarTipoAcao(tipoAcao) {
    const formatacoes = {
        'LOGIN': 'Login',
        'LOGOUT': 'Logout',
        'CRIAR_PRODUTO': 'Criação de Produto',
        'EDITAR_PRODUTO': 'Edição de Produto',
        'ENTRADA_ESTOQUE': 'Entrada de Estoque',
        'SAIDA_ESTOQUE': 'Saída de Estoque'
    };
    
    return formatacoes[tipoAcao] || tipoAcao;
}

// Renderizar paginação
function renderizarPaginacao() {
    const paginacao = document.getElementById('paginacao');
    paginacao.innerHTML = '';
    
    // Botão anterior
    const liAnterior = document.createElement('li');
    liAnterior.className = `page-item ${paginaAtual === 0 ? 'disabled' : ''}`;
    liAnterior.innerHTML = `
        <button class="page-link" ${paginaAtual === 0 ? 'disabled' : ''} data-page="${paginaAtual - 1}">
            <i class="bi bi-chevron-left"></i>
        </button>
    `;
    paginacao.appendChild(liAnterior);
    
    // Páginas
    const maxPaginas = 5;
    const metade = Math.floor(maxPaginas / 2);
    let inicio = Math.max(0, paginaAtual - metade);
    let fim = Math.min(totalPaginas - 1, inicio + maxPaginas - 1);
    
    if (fim - inicio + 1 < maxPaginas) {
        inicio = Math.max(0, fim - maxPaginas + 1);
    }
    
    for (let i = inicio; i <= fim; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === paginaAtual ? 'active' : ''}`;
        li.innerHTML = `
            <button class="page-link" data-page="${i}">${i + 1}</button>
        `;
        paginacao.appendChild(li);
    }
    
    // Botão próximo
    const liProximo = document.createElement('li');
    liProximo.className = `page-item ${paginaAtual === totalPaginas - 1 ? 'disabled' : ''}`;
    liProximo.innerHTML = `
        <button class="page-link" ${paginaAtual === totalPaginas - 1 ? 'disabled' : ''} data-page="${paginaAtual + 1}">
            <i class="bi bi-chevron-right"></i>
        </button>
    `;
    paginacao.appendChild(liProximo);
    
    // Adicionar event listeners para paginação
    document.querySelectorAll('#paginacao button').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.hasAttribute('disabled')) {
                paginaAtual = parseInt(this.getAttribute('data-page'));
                carregarLogsAuditoria();
            }
        });
    });
}

// Formatar data para exibição
function formatarData(dataString) {
    if (!dataString) return 'Data não disponível';
    
    try {
        const data = new Date(dataString);
        if (!isNaN(data.getTime())) {
            return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
        }
        return dataString;
    } catch (e) {
        return 'Data não disponível';
    }
}

// Adicionar event listeners para botões de detalhes
function adicionarEventListenersDetalhes() {
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            
            try {
                // Na prática, você teria um endpoint para buscar detalhes específicos
                // Aqui vamos simular isso buscando todos os logs e filtrando
                const registros = await Utils.fetchAPI(`/logs?size=100`);
                const registro = registros.content.find(r => r.id == id);
                
                if (registro) {
                    exibirDetalhesRegistro(registro);
                }
            } catch (error) {
                Utils.handleError(error, 'Erro ao carregar detalhes do log');
            }
        });
    });
}

// Exibir detalhes do registro no modal
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

// Carregar usuários para o filtro
async function carregarUsuarios() {
    try {
        const selectUsuario = document.getElementById('usuario');
        
        // Carregar gestores
        const gestores = await Utils.fetchAPI('/gestores');
        if (gestores && gestores.length > 0) {
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
        
        // Carregar colaboradores
        const colaboradores = await Utils.fetchAPI('/colaboradores');
        if (colaboradores && colaboradores.length > 0) {
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

// Inicializar funcionalidades da página
document.addEventListener('DOMContentLoaded', function() {
    if (!Utils.validarAutenticacao()) return;
    
    // Carregar logs iniciais
    carregarLogsAuditoria();
    
    // Carregar usuários para o filtro
    carregarUsuarios();
    
    // Event listener para formulário de filtros
    document.getElementById('filtrosForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const tipoAcao = document.getElementById('tipoAcao').value;
        const usuario = document.getElementById('usuario').value;
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        
        filtros = {};
        
        if (tipoAcao) filtros.tipoAcao = tipoAcao;
        
        if (usuario) {
            const [tipo, id] = usuario.split('_');
            if (tipo === 'gestor') {
                filtros.gestorId = id;
            } else if (tipo === 'colaborador') {
                filtros.colaboradorId = id;
            }
        }
        
        if (dataInicio) filtros.dataInicio = new Date(dataInicio).toISOString();
        if (dataFim) filtros.dataFim = new Date(dataFim).toISOString();
        
        // Resetar para a primeira página ao aplicar filtros
        paginaAtual = 0;
        carregarLogsAuditoria();
        
        // Fechar collapse de filtros
        const bsCollapse = bootstrap.Collapse.getInstance(document.getElementById('filtrosCollapse'));
        if (bsCollapse) bsCollapse.hide();
    });
    
    // Event listener para botão de limpar filtros
    document.getElementById('btnLimparFiltros').addEventListener('click', function() {
        document.getElementById('tipoAcao').value = '';
        document.getElementById('usuario').value = '';
        document.getElementById('dataInicio').value = '';
        document.getElementById('dataFim').value = '';
        
        filtros = {};
        paginaAtual = 0;
        carregarLogsAuditoria();
    });
    
    // Event listener para botão de exportar
    document.getElementById('btnExportar').addEventListener('click', function() {
        exportarRegistros();
    });
});

// Função para exportar registros
function exportarRegistros() {
    Utils.notifications.info('Funcionalidade de exportação em desenvolvimento');
    // Aqui você implementaria a lógica para exportar os registros em CSV, PDF, etc.
}