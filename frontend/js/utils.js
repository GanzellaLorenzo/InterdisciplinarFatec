// Utilitários globais para o sistema
const Utils = {
    // URL base da API
    API_URL: 'http://localhost:8080/api',
    
    // Formata um valor como moeda brasileira
    formatarMoeda: function(valor) {
        return 'R$ ' + parseFloat(valor).toFixed(2);
    },
    
    // Formata uma data para o padrão brasileiro
    formatarData: function(data) {
        if (!data) return '-';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR');
    },
    
    // Valida se um token está presente e redireciona para login se não estiver
    validarAutenticacao: function() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = this.getBasePath() + 'index.html';
            return false;
        }
        
        // Verificar se o usuário está na página correta de acordo com seu tipo
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const path = window.location.pathname;
        
        // Redirecionar se estiver na página errada
        if (usuario.tipo === 'COLABORADOR' && path.includes('/dashboard.html')) {
            window.location.href = 'painelColaborador/dashboardColaborador.html';
            return false;
        } else if (usuario.tipo === 'GESTOR' && path.includes('/painelColaborador/')) {
            window.location.href = '../dashboard.html';
            return false;
        }
        
        return true;
    },
    
    // Retorna cabeçalhos padrão para requisições à API
    getHeaders: function(includeContentType = true) {
        const token = localStorage.getItem('token');
        const tipoToken = localStorage.getItem('tipoToken');
        
        const headers = {
            'Authorization': `${tipoToken} ${token}`
        };
        
        if (includeContentType) {
            headers['Content-Type'] = 'application/json';
        }
        
        return headers;
    },
    
    // Faz uma requisição à API com tratamento de erros padronizado
    async fetchAPI(endpoint, method = 'GET', data = null) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : this.API_URL + endpoint;
            
            // Lista de endpoints que não precisam de autenticação
            const publicEndpoints = [
                '/login', 
                '/gestores/login', 
                '/colaboradores/login', 
                '/gestores'
            ];
            
            // Verificar se o endpoint atual está na lista de endpoints públicos
            const isPublicEndpoint = publicEndpoints.some(publicPath => 
                endpoint.includes(publicPath)
            );
            
            // Verificar se há token antes de fazer a requisição a um endpoint protegido
            const token = localStorage.getItem('token');
            if (!token && !isPublicEndpoint) {
                throw new Error('Usuário não autenticado');
            }
            
            // Configurar opções da requisição
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('tipoToken')} ${token}`
                }
            };
            
            // Adicionar corpo da requisição para métodos que o suportam
            if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
                options.body = JSON.stringify(data);
            }
            
            console.log(`Enviando requisição para ${url} com método ${method}`);
            if (data) console.log('Dados:', data);
            
            const response = await fetch(url, options);
            
            if (!response.ok) {
                let errorMessage = `Erro ao processar requisição: ${response.status}`;
                
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // Falha ao parsear resposta como JSON
                }
                
                throw new Error(errorMessage);
            }
            
            // Verificar se a resposta tem conteúdo
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return await response.text();
        } catch (error) {
            console.error('Erro API:', error);
            throw error;
        }
    },
    
    // Exibe uma mensagem de alerta padronizada
    showAlert: function(message, type = 'info') {
        alert(message);
    },
    
    // Confirma uma ação com o usuário
    confirm: function(message) {
        return window.confirm(message);
    },
    
    // Determina o caminho base para os links
    getBasePath: function() {
        const path = window.location.pathname;
        if (path.includes('/produtos/') || path.includes('/colaboradores/') || path.includes('/movimentacoes/')) {
            return '../';
        }
        return '';
    },
    
    // Função genérica para carregar lista de dados da API
    async carregarDados(endpoint, tabelaId, renderFunction, filtroFunction = null, configObj = {}) {
        try {
            if (!Utils.validarAutenticacao()) return;
            
            const loadingElement = document.getElementById(configObj.loadingId || 'carregando');
            const emptyElement = document.getElementById(configObj.emptyId || 'nenhum');
            
            if (loadingElement) loadingElement.classList.remove('d-none');
            if (emptyElement) emptyElement.classList.add('d-none');
            
            const dados = await this.fetchAPI(endpoint);
            const tabela = document.getElementById(tabelaId);
            
            if (loadingElement) loadingElement.classList.add('d-none');
            
            // Filtrar dados se houver função de filtro
            const dadosFiltrados = filtroFunction ? filtroFunction(dados) : dados;
            
            if (dadosFiltrados.length === 0) {
                if (emptyElement) emptyElement.classList.remove('d-none');
                return;
            }
            
            tabela.innerHTML = '';
            
            dadosFiltrados.forEach(item => {
                const tr = document.createElement('tr');
                
                // Adicionar classe para destacar itens inativos
                if (item.hasOwnProperty('ativo') && !item.ativo) {
                    tr.classList.add('table-secondary');
                }
                
                tr.innerHTML = renderFunction(item);
                tabela.appendChild(tr);
            });
            
            // Executar função de callback se fornecida
            if (configObj.callback) {
                configObj.callback(dadosFiltrados);
            }
        } catch (error) {
            console.error('Erro:', error);
            const loadingElement = document.getElementById(configObj.loadingId || 'carregando');
            if (loadingElement) loadingElement.classList.add('d-none');
            
            this.showAlert('Erro ao carregar dados. ' + error.message, 'error');
        }
    },
    
    // Sistema de notificações para mensagens ao usuário (alternativa aos alerts)
    notifications: {
        show: function(message, type = 'info', duration = 5000) {
            // Criar container de notificações se não existir
            let container = document.getElementById('notification-container');
            if (!container) {
                container = document.createElement('div');
                container.id = 'notification-container';
                container.style.position = 'fixed';
                container.style.top = '20px';
                container.style.right = '20px';
                container.style.zIndex = '9999';
                document.body.appendChild(container);
            }
            
            // Criar a notificação
            const notification = document.createElement('div');
            notification.className = `alert alert-${type} alert-dismissible fade show`;
            notification.role = 'alert';
            notification.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            // Adicionar ao container
            container.appendChild(notification);
            
            // Auto-remover após o tempo definido
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, duration);
            
            return notification;
        },
        
        error: function(message, duration = 5000) {
            return this.show(message, 'danger', duration);
        },
        
        success: function(message, duration = 5000) {
            return this.show(message, 'success', duration);
        },
        
        warning: function(message, duration = 5000) {
            return this.show(message, 'warning', duration);
        },
        
        info: function(message, duration = 5000) {
            return this.show(message, 'info', duration);
        }
    },
    
    // Tratamento de erros padronizado
    handleError: function(error, defaultMessage = 'Ocorreu um erro na operação') {
        console.error('Erro:', error);
        
        // Determinar mensagem apropriada
        let message = defaultMessage;
        if (error && error.message) {
            message = error.message;
        }
        
        // Mostrar notificação de erro
        this.notifications.error(message);
        
        // Se for erro de autenticação, redirecionar para login
        if (error.status === 401 || error.message?.includes('autenticação') || error.message?.includes('token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('tipoToken');
            localStorage.removeItem('usuario');
            
            setTimeout(() => {
                window.location.href = this.getBasePath() + 'index.html';
            }, 2000);
        }
        
        return error;
    },
    
    ordenarPorDataDecrescente: function(array, campoData = 'dataHora') {
        return array.sort((a, b) => {
            const dataA = new Date(a[campoData] || 0);
            const dataB = new Date(b[campoData] || 0);
            return dataB - dataA; // Ordem decrescente (mais novo primeiro)
        });
    }
};