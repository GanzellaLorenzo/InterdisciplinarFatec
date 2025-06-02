document.addEventListener('DOMContentLoaded', function() {
    carregarEstatisticas();
});

async function carregarEstatisticas() {
    try {
        document.getElementById('totalProdutos').textContent = '0';
        document.getElementById('totalEntradas').textContent = '0';
        document.getElementById('totalSaidas').textContent = '0';
        document.getElementById('totalUsuarios').textContent = '0';

        const produtos = await Utils.fetchAPI('/produtos');
        const produtosAtivos = produtos.filter(p => p.ativo).length;
        document.getElementById('totalProdutos').textContent = produtosAtivos.toString();

        const movimentacoes = await Utils.fetchAPI('/acoes');
        
        const entradas = movimentacoes.filter(m => m.acao === 'ENTRADA').length;
        const saidas = movimentacoes.filter(m => m.acao === 'SAIDA').length;
        
        document.getElementById('totalEntradas').textContent = entradas.toString();
        document.getElementById('totalSaidas').textContent = saidas.toString();

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario.tipo === 'GESTOR') {
            const colaboradores = await Utils.fetchAPI('/colaboradores');
            const colaboradoresAtivos = colaboradores.filter(c => 
                c.ativo && c.gestor && c.gestor.userId === parseInt(usuario.id)
            ).length;
            
            document.getElementById('totalUsuarios').textContent = colaboradoresAtivos.toString();
        }
    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}