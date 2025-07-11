async function carregarProdutos() {
    try {
        if (!Utils.validarAutenticacao()) return;

        const carregandoProdutosEl = document.getElementById('carregandoProdutos');
        const nenhumProdutoEl = document.getElementById('nenhumProduto');
        const tabelaProdutos = document.getElementById('tabelaProdutos');
        const mostrarInativos = document.getElementById('mostrarInativos')?.checked || false;

        carregandoProdutosEl.classList.remove('d-none');
        nenhumProdutoEl.classList.add('d-none');

        const produtos = await Utils.fetchAPI('/produtos');

        carregandoProdutosEl.classList.add('d-none');

        const produtosFiltrados = mostrarInativos 
            ? produtos 
            : produtos.filter(produto => produto.ativo);

        if (produtosFiltrados.length === 0) {
            nenhumProdutoEl.classList.remove('d-none');
            tabelaProdutos.innerHTML = '';
            return;
        }

        produtosFiltrados.sort((a, b) => b.prodId - a.prodId);

        tabelaProdutos.innerHTML = '';

        produtosFiltrados.forEach(produto => {
            const tr = document.createElement('tr');

            if (!produto.ativo) {
                tr.classList.add('table-secondary');
            }

            tr.innerHTML = `
                <td>${produto.prodNome}</td>
                <td>${produto.prodDescricao || '-'}</td>
                <td>R$ ${produto.prodPrecoCompra ? parseFloat(produto.prodPrecoCompra).toFixed(2) : '-'}</td>
                <td>R$ ${parseFloat(produto.prodPrecoVenda).toFixed(2)}</td>
                <td>${produto.quantidade}</td>
                <td>
                    ${produto.ativo ? `
                    <button class="btn btn-sm btn-success gerar-movimentacao" data-id="${produto.prodId}" data-nome="${produto.prodNome}" data-estoque="${produto.quantidade}">
                        <i class="bi bi-arrow-left-right"></i>
                    </button>
                    ` : ''}
                    <a href="editar.html?id=${produto.prodId}" class="btn btn-sm btn-primary gestor-only">
                        <i class="bi bi-pencil"></i>
                    </a>
                    <button class="btn btn-sm gestor-only ${produto.ativo ? 'btn-danger' : 'btn-success'} toggle-status" data-id="${produto.prodId}" data-status="${produto.ativo}">
                        <i class="bi bi-${produto.ativo ? 'trash' : 'arrow-counterclockwise'}"></i>
                    </button>
                </td>
            `;
            tabelaProdutos.appendChild(tr);
        });

        adicionarEventListenersBotoes();

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario.tipo !== 'GESTOR') {
            document.querySelectorAll('.gestor-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar produtos');
        document.getElementById('carregandoProdutos').classList.add('d-none');
    }
}

function adicionarEventListenersBotoes() {
    document.querySelectorAll('.toggle-status').forEach(btn => {
        btn.addEventListener('click', function() {
            const prodId = this.dataset.id;
            const isAtivo = this.dataset.status === 'true';
            const mensagem = isAtivo 
                ? 'Tem certeza que deseja desativar este produto?' 
                : 'Deseja reativar este produto?';

            if (Utils.confirm(mensagem)) {
                toggleStatusProduto(prodId, !isAtivo);
            }
        });
    });

    document.querySelectorAll('.gerar-movimentacao').forEach(btn => {
        btn.addEventListener('click', function() {
            const prodId = this.dataset.id;
            const prodNome = this.dataset.nome;
            const estoque = parseInt(this.dataset.estoque);

            document.getElementById('movProdutoId').value = prodId;
            document.getElementById('movProdutoNome').textContent = prodNome;
            document.getElementById('movEstoqueAtual').textContent = estoque;
            document.getElementById('movQuantidade').value = '';
            document.getElementById('movTipo').value = '';
            document.getElementById('movEstoqueFinal').textContent = '-';

            const movimentacaoModal = new bootstrap.Modal(document.getElementById('movimentacaoModal'));
            movimentacaoModal.show();
        });
    });
}

async function toggleStatusProduto(id, novoStatus) {
    try {
        const produto = await Utils.fetchAPI(`/produtos/${id}`);

        produto.ativo = novoStatus;

        await Utils.fetchAPI(`/produtos/${id}`, 'PUT', produto);

        Utils.notifications.success(`Produto ${novoStatus ? 'ativado' : 'desativado'} com sucesso!`);
        carregarProdutos();

    } catch (error) {
        Utils.handleError(error, 'Erro ao atualizar status do produto');
    }
}

async function salvarProduto(produto, isEditing = false) {
    try {
        if (!produto.prodNome || !produto.prodPrecoVenda) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

        produto.usuario = {
            userId: usuario.id
        };

        const endpoint = isEditing 
            ? `/produtos/${produto.prodId}` 
            : `/produtos`;

        const method = isEditing ? 'PUT' : 'POST';

        return await Utils.fetchAPI(endpoint, method, produto);
    } catch (error) {
        Utils.handleError(error, 'Erro ao salvar produto');
        throw error;
    }
}

async function carregarProduto(id) {
    try {
        const produto = await Utils.fetchAPI(`/produtos/${id}`);

        if (!produto) {
            throw new Error('Produto não encontrado');
        }

        return produto;
    } catch (error) {
        Utils.handleError(error, 'Erro ao carregar dados do produto');
        throw error;
    }
}

function atualizarEstoqueFinal() {
    const estoqueAtual = parseInt(document.getElementById('movEstoqueAtual').textContent);
    const quantidade = parseInt(document.getElementById('movQuantidade').value) || 0;
    const tipo = document.getElementById('movTipo').value;

    let estoqueFinal = estoqueAtual;

    if (tipo === 'ENTRADA') {
        estoqueFinal += quantidade;
        document.getElementById('quantidadeMax').textContent = '';
        document.getElementById('movQuantidade').removeAttribute('max');
    } else if (tipo === 'SAIDA') {
        estoqueFinal -= quantidade;
        document.getElementById('quantidadeMax').textContent = `Máximo: ${estoqueAtual}`;
        document.getElementById('movQuantidade').setAttribute('max', estoqueAtual);
    }

    document.getElementById('movEstoqueFinal').textContent =
        (estoqueFinal >= 0) ? estoqueFinal : 'Estoque insuficiente';

    if (estoqueFinal < 0) {
        document.getElementById('movEstoqueFinal').classList.add('text-danger');
        document.getElementById('btnConfirmarMovimentacao').disabled = true;
    } else {
        document.getElementById('movEstoqueFinal').classList.remove('text-danger');
        document.getElementById('btnConfirmarMovimentacao').disabled = false;
    }
}

async function registrarMovimentacao() {
    try {
        const produtoId = document.getElementById('movProdutoId').value;
        const tipo = document.getElementById('movTipo').value;
        const quantidade = parseInt(document.getElementById('movQuantidade').value);

        if (!tipo || !quantidade || quantidade <= 0) {
            Utils.notifications.warning('Por favor, preencha todos os campos corretamente.');
            return;
        }

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

        const movimentacao = {
            acao: tipo,
            produto: {
                prodId: parseInt(produtoId)
            },
            quantidade: quantidade,
            usuario: {
                userId: parseInt(usuario.id)
            }
        };

        await Utils.fetchAPI('/acoes', 'POST', movimentacao);

        const movimentacaoModal = bootstrap.Modal.getInstance(document.getElementById('movimentacaoModal'));
        movimentacaoModal.hide();

        Utils.notifications.success('Movimentação registrada com sucesso!');

        carregarProdutos();

    } catch (error) {
        Utils.handleError(error, 'Erro ao registrar movimentação');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const usuarioNomeElement = document.getElementById('usuarioNome');
    if (usuarioNomeElement) {
        usuarioNomeElement.textContent = usuario.nome || 'Usuário';
    }

    const empresaNomeElement = document.getElementById('empresaNome');
    if (empresaNomeElement && usuario.tipo === 'GESTOR') {
        empresaNomeElement.textContent = usuario.empresa || '';
    }

    if (usuario.tipo !== 'GESTOR') {
        document.querySelectorAll('.gestor-only').forEach(el => {
            el.style.display = 'none';
        });
    }

    if (window.location.href.includes('listar.html')) {
        carregarProdutos();
    }

    if (window.location.href.includes('editar.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const produtoId = urlParams.get('id');

        if (produtoId) {
            carregarProduto(produtoId).then(produto => {
                document.getElementById('prodId').value = produto.prodId;
                document.getElementById('prodNome').value = produto.prodNome;
                document.getElementById('prodDescricao').value = produto.prodDescricao || '';
                document.getElementById('prodPrecoCompra').value = produto.prodPrecoCompra || '';
                document.getElementById('prodPrecoVenda').value = produto.prodPrecoVenda;
                document.getElementById('quantidade').value = produto.quantidade;

                const ativoElement = document.getElementById('ativo');
                if (ativoElement) {
                    ativoElement.checked = produto.ativo;
                }
            });
        }
    }

    const produtoForm = document.getElementById('produtoForm');
    if (produtoForm) {
        produtoForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const prodId = document.getElementById('prodId')?.value;
            const isEditing = !!prodId;

            const produto = {
                prodNome: document.getElementById('prodNome').value,
                prodDescricao: document.getElementById('prodDescricao').value,
                prodPrecoCompra: document.getElementById('prodPrecoCompra').value,
                prodPrecoVenda: document.getElementById('prodPrecoVenda').value,
                quantidade: document.getElementById('quantidade').value,
                ativo: document.getElementById('ativo')?.checked ?? true
            };

            if (isEditing) {
                produto.prodId = prodId;
            }

            salvarProduto(produto, isEditing)
                .then(() => {
                    Utils.notifications.success(isEditing ? 'Produto atualizado com sucesso!' : 'Produto cadastrado com sucesso!');
                    window.location.href = 'listar.html';
                })
                .catch(() => {
                    Utils.notifications.error('Erro ao ' + (isEditing ? 'atualizar' : 'cadastrar') + ' produto. Verifique os dados e tente novamente.');
                });
        });
    }

    const movTipo = document.getElementById('movTipo');
    const movQuantidade = document.getElementById('movQuantidade');

    if (movTipo && movQuantidade) {
        movTipo.addEventListener('change', atualizarEstoqueFinal);
        movQuantidade.addEventListener('input', atualizarEstoqueFinal);

        document.getElementById('btnConfirmarMovimentacao').addEventListener('click', registrarMovimentacao);
    }

    const checkboxInativo = document.getElementById('mostrarInativos');
    if (checkboxInativo) {
        checkboxInativo.addEventListener('change', carregarProdutos);
    }

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltroBusca);
    }
});

function aplicarFiltroBusca() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const rows = document.querySelectorAll('#tabelaProdutos tr');

    rows.forEach(row => {
        const nome = row.querySelector('td:first-child').textContent.toLowerCase();
        const descricao = row.querySelector('td:nth-child(2)').textContent.toLowerCase();

        row.style.display = (nome.includes(searchTerm) || descricao.includes(searchTerm)) ? '' : 'none';
    });
}
