const Utils = {
    API_URL: 'http://localhost:8080/api',
    
    formatarMoeda(valor) {
        return 'R$ ' + parseFloat(valor).toFixed(2);
    },
    
    formatarData(data) {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    },
    
    validarAutenticacao() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = this.getBasePath() + 'index.html';
            return false;
        }
        return true;
    },
    
    getHeaders(includeContentType = true) {
        const token = localStorage.getItem('token');
        const tipoToken = localStorage.getItem('tipoToken');
        const headers = {
            'Authorization': `${tipoToken} ${token}`
        };
        if (includeContentType) headers['Content-Type'] = 'application/json';
        return headers;
    },
    
    async fetchAPI(endpoint, method = 'GET', data = null) {
        const url = endpoint.startsWith('http') ? endpoint : this.API_URL + endpoint;
        const publicEndpoints = ['/login', '/gestores/login', '/colaboradores/login', '/gestores'];
        const isPublicEndpoint = publicEndpoints.some(publicPath => endpoint.includes(publicPath));
        const token = localStorage.getItem('token');
        if (!token && !isPublicEndpoint) throw new Error('Usuário não autenticado');

        const options = {
            method,
            headers: this.getHeaders(true)
        };

        if (data && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            let errorMessage = `Erro ao processar requisição: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch {}
            throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        return contentType && contentType.includes('application/json') ? await response.json() : await response.text();
    },
    
    showAlert(message) {
        alert(message);
    },
    
    confirm(message) {
        return window.confirm(message);
    },
    
    getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/produtos/') || path.includes('/colaboradores/') || path.includes('/movimentacoes/')) {
            return '../';
        }
        return '';
    },
    
    async carregarDados(endpoint, tabelaId, renderFunction, filtroFunction = null, configObj = {}) {
        if (!this.validarAutenticacao()) return;

        const loadingElement = document.getElementById(configObj.loadingId || 'carregando');
        const emptyElement = document.getElementById(configObj.emptyId || 'nenhum');
        if (loadingElement) loadingElement.classList.remove('d-none');
        if (emptyElement) emptyElement.classList.add('d-none');

        try {
            const dados = await this.fetchAPI(endpoint);
            if (loadingElement) loadingElement.classList.add('d-none');

            const dadosFiltrados = filtroFunction ? filtroFunction(dados) : dados;
            if (dadosFiltrados.length === 0) {
                if (emptyElement) emptyElement.classList.remove('d-none');
                return;
            }

            const tabela = document.getElementById(tabelaId);
            tabela.innerHTML = '';
            dadosFiltrados.forEach(item => {
                const tr = document.createElement('tr');
                if ('ativo' in item && !item.ativo) tr.classList.add('table-secondary');
                tr.innerHTML = renderFunction(item);
                tabela.appendChild(tr);
            });

            if (configObj.callback) configObj.callback(dadosFiltrados);
        } catch (error) {
            if (loadingElement) loadingElement.classList.add('d-none');
            this.showAlert('Erro ao carregar dados. ' + error.message, 'error');
        }
    },
    
    notifications: {
        show(message, type = 'info', duration = 5000) {
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
                setTimeout(() => notification.remove(), 300);
            }, duration);
            
            return notification;
        },
        
        error(message, duration = 5000) {
            return this.show(message, 'danger', duration);
        },
        
        success(message, duration = 5000) {
            return this.show(message, 'success', duration);
        },
        
        warning(message, duration = 5000) {
            return this.show(message, 'warning', duration);
        },
        
        info(message, duration = 5000) {
            return this.show(message, 'info', duration);
        }
    },
    
    handleError(error, defaultMessage = 'Ocorreu um erro na operação') {
        let message = error?.message || defaultMessage;
        this.notifications.error(message);

        if (error?.status === 401 || /autenticação|token/.test(error?.message || '')) {
            localStorage.removeItem('token');
            localStorage.removeItem('tipoToken');
            localStorage.removeItem('usuario');
            setTimeout(() => window.location.href = this.getBasePath() + 'index.html', 2000);
        }

        return error;
    },
    
    ordenarPorDataDecrescente(array, campoData = 'dataHora') {
        return array.sort((a, b) => new Date(b[campoData] || 0) - new Date(a[campoData] || 0));
    }
};
