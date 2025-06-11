async function carregarMovimentacoes() {
    try {
        if (!Utils.validarAutenticacao()) return;

        document.getElementById('carregandoMovimentacoes').classList.remove('d-none');
        document.getElementById('nenhumRegistro').classList.add('d-none');
        
        const movimentacoes = await Utils.fetchAPI('/acoes');
        
        const registros = movimentacoes.map(mov => ({
            id: mov.id,
            tipo: 'MOVIMENTACAO',
            dataHora: mov.data || new Date().toISOString(),
            usuario: mov.usuario?.nomeColaborador || 'Sistema',
            acao: mov.acao,
            detalhes: `${mov.acao === 'ENTRADA' ? 'Entrada' : 'Saída'} de ${mov.quantidade} unidade(s) de ${mov.produto?.prodNome || 'Produto'}`,
            produto: mov.produto,
            quantidade: mov.quantidade
        })).sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora)); // Garantir ordem decrescente por data
        
        const tabelaMovimentacoes = document.getElementById('tabelaMovimentacoes');
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        
        document.getElementById('carregandoMovimentacoes').classList.add('d-none');
        
        if (registros.length === 0) {
            document.getElementById('nenhumRegistro').classList.remove('d-none');
            return;
        }

        tabelaMovimentacoes.innerHTML = '';
        
        const registrosFiltrados = searchTerm 
            ? registros.filter(reg => 
                reg.usuario.toLowerCase().includes(searchTerm) || 
                reg.acao.toLowerCase().includes(searchTerm) || 
                reg.detalhes.toLowerCase().includes(searchTerm))
            : registros;
            
        if (registrosFiltrados.length === 0) {
            document.getElementById('nenhumRegistro').classList.remove('d-none');
            return;
        }
        
        registrosFiltrados.forEach(registro => {
            const tr = document.createElement('tr');
            
            if (registro.acao === 'ENTRADA') {
                tr.classList.add('table-success-light');
            } else if (registro.acao === 'SAIDA') {
                tr.classList.add('table-danger-light');
            }
            
            const dataFormatada = formatarData(registro.dataHora);
            
            tr.innerHTML = `
                <td>${dataFormatada}</td>
                <td>${registro.usuario}</td>
                <td>
                    <span class="badge ${registro.acao === 'ENTRADA' ? 'bg-success' : 'bg-danger'}">
                        ${registro.acao === 'ENTRADA' ? 'Entrada' : 'Saída'}
                    </span>
                </td>
                <td>${registro.detalhes}</td>
                <td>
                    <button class="btn btn-sm btn-info view-details" data-id="${registro.id}">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            `;
            tabelaMovimentacoes.appendChild(tr);
        });
        
        adicionarEventListenersDetalhes();
        
    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar movimentações');
        document.getElementById('carregandoMovimentacoes').classList.add('d-none');
    }
}

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

function exibirDetalhesRegistro(registro) {
    document.getElementById('detalheDataHora').textContent = formatarData(registro.dataHora);
    document.getElementById('detalheUsuario').textContent = registro.usuario;
    document.getElementById('detalheTipoAcao').textContent = registro.acao === 'ENTRADA' ? 'Entrada de Produto' : 'Saída de Produto';
    document.getElementById('detalheDescricao').textContent = registro.detalhes;
    
    document.getElementById('secaoDetalheProduto').classList.remove('d-none');
    document.getElementById('detalheProduto').textContent = 
        `${registro.produto.prodNome} (ID: ${registro.produto.prodId})`;
    
    document.getElementById('secaoDetalheAntes').classList.add('d-none');
    document.getElementById('secaoDetalheDepois').classList.add('d-none');
    
    const detalhesModal = new bootstrap.Modal(document.getElementById('detalhesModal'));
    detalhesModal.show();
}

function adicionarEventListenersDetalhes() {
    document.querySelectorAll('.view-details').forEach(btn => {
        btn.addEventListener('click', async function() {
            const id = this.getAttribute('data-id');
            
            try {
                const registro = await Utils.fetchAPI(`/acoes/${id}`);
                
                const registroFormatado = {
                    id: registro.id,
                    dataHora: registro.data,
                    usuario: registro.usuario?.nomeColaborador || 'Sistema',
                    acao: registro.acao,
                    detalhes: `${registro.acao === 'ENTRADA' ? 'Entrada' : 'Saída'} de ${registro.quantidade} unidade(s) de ${registro.produto?.prodNome || 'Produto'}`,
                    produto: registro.produto,
                    quantidade: registro.quantidade
                };
                
                exibirDetalhesRegistro(registroFormatado);
            } catch (error) {
                Utils.handleError(error, 'Erro ao carregar detalhes da movimentação');
            }
        });
    });
}

function exportarRegistros() {
    Utils.notifications.info('Funcionalidade de exportação em desenvolvimento');
}

document.addEventListener('DOMContentLoaded', function() {
    if (Utils.validarAutenticacao()) {
        carregarMovimentacoes();
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            carregarMovimentacoes();
        });
    }
    
    const btnExportar = document.getElementById('btnExportar');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarRegistros);
    }
    
    const btnFiltrarPeriodo = document.getElementById('btnFiltrarPeriodo');
    if (btnFiltrarPeriodo) {
        btnFiltrarPeriodo.addEventListener('click', function() {
            Utils.notifications.info('Funcionalidade de filtro por período em desenvolvimento');
        });
    }
});