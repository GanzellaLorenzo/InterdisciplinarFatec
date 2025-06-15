document.addEventListener('DOMContentLoaded', function() {
    carregarEstatisticas();
});

async function carregarEstatisticas() {
    try {
        const elTotalProdutos = document.getElementById('totalProdutos');
        const elTotalEntradas = document.getElementById('totalEntradas');
        const elTotalSaidas = document.getElementById('totalSaidas');
        const elTotalUsuarios = document.getElementById('totalUsuarios');

        if (elTotalProdutos) elTotalProdutos.textContent = '0';
        if (elTotalEntradas) elTotalEntradas.textContent = '0';
        if (elTotalSaidas) elTotalSaidas.textContent = '0';
        if (elTotalUsuarios) elTotalUsuarios.textContent = '0';

        const produtos = await Utils.fetchAPI('/produtos');
        const produtosAtivos = produtos.filter(p => p.ativo).length;
        if (elTotalProdutos) elTotalProdutos.textContent = produtosAtivos.toString();

        const movimentacoes = await Utils.fetchAPI('/acoes');
        const entradas = movimentacoes.filter(m => m.acao === 'ENTRADA').length;
        const saidas = movimentacoes.filter(m => m.acao === 'SAIDA').length;

        if (elTotalEntradas) elTotalEntradas.textContent = entradas.toString();
        if (elTotalSaidas) elTotalSaidas.textContent = saidas.toString();

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario.tipo === 'GESTOR') {
            const colaboradores = await Utils.fetchAPI('/colaboradores');
            const colaboradoresAtivos = colaboradores.filter(c =>
                c.ativo && c.gestor && c.gestor.userId === parseInt(usuario.id)
            ).length;
            if (elTotalUsuarios) elTotalUsuarios.textContent = colaboradoresAtivos.toString();
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}
