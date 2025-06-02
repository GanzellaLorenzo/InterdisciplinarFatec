async function carregarMovimentacoes() {
    await Utils.carregarDados(
        '/acoes',
        'tabelaMovimentacoes',
        (movimentacao) => `
            <td>${movimentacao.id}</td>
            <td>${movimentacao.produto.prodNome}</td>
            <td class="${movimentacao.acao === 'ENTRADA' ? 'text-success' : 'text-danger'}">
                ${movimentacao.acao === 'ENTRADA' ? 'Entrada' : 'Saída'}
            </td>
            <td>${movimentacao.quantidade}</td>
            <td>
                <a href="#" class="btn btn-sm btn-info">
                    <i class="bi bi-eye"></i>
                </a>
            </td>
        `,
        null,
        {
            loadingId: 'carregandoMovimentacoes',
            emptyId: 'nenhumaMovimentacao'
        }
    );
}

async function carregarProdutosSelect() {
    try {
        const produtos = await Utils.fetchAPI('/produtos');
        const selectProduto = document.getElementById('produtoId');
        
        selectProduto.innerHTML = '<option value="">Selecione um produto</option>';
        
        produtos.forEach(produto => {
            if (produto.ativo) {
                const option = document.createElement('option');
                option.value = produto.prodId;
                option.textContent = `${produto.prodNome} (Estoque: ${produto.quantidade})`;
                option.dataset.estoque = produto.quantidade;
                selectProduto.appendChild(option);
            }
        });
        
        adicionarEventListenersMovimentacao();
    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar produtos');
    }
}

function adicionarEventListenersMovimentacao() {
    const tipoMovimentacao = document.getElementById('tipoMovimentacao');
    const produtoSelect = document.getElementById('produtoId');
    const quantidadeInput = document.getElementById('quantidade');
    
    if (tipoMovimentacao && produtoSelect && quantidadeInput) {
        const atualizarQuantidadeMaxima = function() {
            if (tipoMovimentacao.value === 'SAIDA' && produtoSelect.selectedIndex > 0) {
                const option = produtoSelect.options[produtoSelect.selectedIndex];
                const estoqueDisponivel = parseInt(option.dataset.estoque);
                quantidadeInput.max = estoqueDisponivel;
                document.getElementById('quantidadeMax').textContent = `Máximo: ${estoqueDisponivel}`;
            } else {
                quantidadeInput.removeAttribute('max');
                document.getElementById('quantidadeMax').textContent = '';
            }
        };
        
        tipoMovimentacao.addEventListener('change', atualizarQuantidadeMaxima);
        produtoSelect.addEventListener('change', atualizarQuantidadeMaxima);
    }
}

async function registrarMovimentacao(movimentacao) {
    try {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        
        const movimentacaoFormatada = {
            acao: movimentacao.tipo,
            produto: {
                prodId: parseInt(movimentacao.produtoId)
            },
            quantidade: parseInt(movimentacao.quantidade),
            usuario: {
                userId: parseInt(usuario.id) 
            }
        };
        
        console.log('Enviando movimentação:', movimentacaoFormatada);
        
        await Utils.fetchAPI('/acoes', 'POST', movimentacaoFormatada);
        
        Utils.notifications.success('Movimentação registrada com sucesso!');
        window.location.href = 'listar.html';
    } catch (error) {
        Utils.handleError(error, 'Erro ao registrar movimentação');
        throw error;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (window.location.href.includes('movimentacoes/listar.html')) {
        carregarMovimentacoes();
    }
    
    if (window.location.href.includes('movimentacoes/cadastrar.html')) {
        carregarProdutosSelect();
        
        const movimentacaoForm = document.getElementById('movimentacaoForm');
        if (movimentacaoForm) {
            movimentacaoForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const movimentacao = {
                    tipo: document.getElementById('tipoMovimentacao').value,
                    produtoId: document.getElementById('produtoId').value,
                    quantidade: document.getElementById('quantidade').value
                };
                
                registrarMovimentacao(movimentacao)
                    .catch(error => {
                        Utils.notifications.error('Erro ao registrar movimentação: ' + error.message);
                    });
            });
        }
    }
});