const Utils = {
    API_URL: 'http://localhost:8080/api',
    
    formatarMoeda: function(valor) {
        return 'R$ ' + parseFloat(valor).toFixed(2);
    },
    
    formatarData: function(data) {
        if (!data) return '-';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR');
    },
    
    validarAutenticacao: function() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = this.getBasePath() + 'index.html';
            return false;
        }
        
        return true;
    },
    
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
    
    async fetchAPI(endpoint, method = 'GET', data = null) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : this.API_URL + endpoint;
            
            const publicEndpoints = [
                '/login', 
                '/gestores/login', 
                '/colaboradores/login', 
                '/gestores'
            ];
            
            const isPublicEndpoint = publicEndpoints.some(publicPath => 
                endpoint.includes(publicPath)
            );
            
            const token = localStorage.getItem('token');
            if (!token && !isPublicEndpoint) {
                throw new Error('Usuário não autenticado');
            }
            
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `${localStorage.getItem('tipoToken')} ${token}`
                }
            };
            
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
                }
                
                throw new Error(errorMessage);
            }
            
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
    
    showAlert: function(message, type = 'info') {
        alert(message);
    },
    
    confirm: function(message) {
        return window.confirm(message);
    },
    
    getBasePath: function() {
        const path = window.location.pathname;
        if (path.includes('/produtos/') || path.includes('/colaboradores/') || path.includes('/movimentacoes/')) {
            return '../';
        }
        return '';
    },
    
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
            
            const dadosFiltrados = filtroFunction ? filtroFunction(dados) : dados;
            
            if (dadosFiltrados.length === 0) {
                if (emptyElement) emptyElement.classList.remove('d-none');
                return;
            }
            
            tabela.innerHTML = '';
            
            dadosFiltrados.forEach(item => {
                const tr = document.createElement('tr');
                
                if (item.hasOwnProperty('ativo') && !item.ativo) {
                    tr.classList.add('table-secondary');
                }
                
                tr.innerHTML = renderFunction(item);
                tabela.appendChild(tr);
            });
            
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
    
    notifications: {
        show: function(message, type = 'info', duration = 5000) {
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
            
            const notification = document.createElement('div');
            notification.className = `alert alert-${type} alert-dismissible fade show`;
            notification.role = 'alert';
            notification.innerHTML = `
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            `;
            
            container.appendChild(notification);
            
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
    
    handleError: function(error, defaultMessage = 'Ocorreu um erro na operação') {
        console.error('Erro:', error);
        
        let message = defaultMessage;
        if (error && error.message) {
            message = error.message;
        }
        
        this.notifications.error(message);
        
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
            return dataB - dataA;
        });
    }
};