const Components = {
    renderSidebar: function() {
        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        const activeMenu = this.getActiveMenu();
        const isColaborador = usuario.tipo === 'COLABORADOR';
        const basePath = this.getBasePath();
        const dashboardPath = `${basePath}dashboard.html`;

        return `
        <aside class="sidebar">
            <div class="sidebar-header">
                <h1 class="sidebar-logo" id="empresaLogo">${usuario.empresa || 'Estoque'}</h1>
                <button class="sidebar-toggle d-lg-none" id="sidebarToggle">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
            <div class="sidebar-user">
                <div class="sidebar-user-info">
                    <div class="sidebar-user-avatar">
                        <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="sidebar-user-details">
                        <h6 id="usuarioNome">${usuario.nome || 'Usuário'}</h6>
                        <span class="sidebar-user-role" id="usuarioTipo">${usuario.tipo === 'GESTOR' ? 'Gestor' : 'Colaborador'}</span>
                    </div>
                </div>
            </div>
            <nav class="sidebar-nav">
                <ul class="sidebar-menu">
                    <li class="sidebar-menu-item${activeMenu === 'dashboard' ? ' active' : ''}">
                        <a href="${dashboardPath}" class="sidebar-menu-link">
                            <i class="bi bi-grid-1x2"></i>
                            <span>Dashboard</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item${activeMenu === 'produtos' ? ' active' : ''}">
                        <a href="${basePath}produtos/listar.html" class="sidebar-menu-link">
                            <i class="bi bi-box-seam"></i>
                            <span>Produtos</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item${activeMenu === 'colaboradores' ? ' active' : ''} gestor-only">
                        <a href="${basePath}colaboradores/listar.html" class="sidebar-menu-link">
                            <i class="bi bi-people"></i>
                            <span>Colaboradores</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item${activeMenu === 'movimentacao' ? ' active' : ''}">
                        <a href="${basePath}movimentacao/listar.html" class="sidebar-menu-link">
                            <i class="bi bi-arrow-left-right"></i>
                            <span>Movimentações</span>
                        </a>
                    </li>
                    <li class="sidebar-menu-item${activeMenu === 'auditoria' ? ' active' : ''} gestor-only">
                        <a href="${basePath}auditoria/listar.html" class="sidebar-menu-link">
                            <i class="bi bi-journal-text"></i>
                            <span>Auditoria</span>
                        </a>
                    </li>
                </ul>
            </nav>
            <div class="sidebar-footer">
                <button class="btn btn-outline-light btn-sm btn-block btn-logout">
                    <i class="bi bi-box-arrow-right"></i> Sair
                </button>
            </div>
        </aside>`;
    },

    renderHeader: function(searchPlaceholder = 'Buscar...', showFilterInativos = false, showSearch = true) {
        return `
        <header class="header">
            <div class="header-container">
                <button class="menu-toggle d-lg-none" id="menuToggle">
                    <i class="bi bi-list"></i>
                </button>
                ${showSearch ? `
                <div class="header-search">
                    <div class="input-group">
                        <span class="input-group-text bg-transparent border-end-0">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" class="form-control border-start-0" placeholder="${searchPlaceholder}" id="searchInput">
                    </div>
                </div>` : ''}
                <div class="header-actions">
                    ${showFilterInativos ? `
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="mostrarInativos">
                        <label class="form-check-label" for="mostrarInativos">Mostrar inativos</label>
                    </div>` : ''}
                    <button class="btn btn-icon btn-reload">
                        <i class="bi bi-arrow-clockwise"></i>
                    </button>
                </div>
            </div>
        </header>`;
    },

    getActiveMenu: function() {
        const path = window.location.pathname.toLowerCase();
        if (path.includes('/produtos/') || path.includes('produtoscolaborador')) return 'produtos';
        if (path.includes('/colaboradores/')) return 'colaboradores';
        if (path.includes('/movimentacao/')) return 'movimentacao';
        if (path.includes('/auditoria/')) return 'auditoria';
        return 'dashboard';
    },

    getBasePath: function() {
        const path = window.location.pathname;
        if (path.includes('/produtos/') || 
            path.includes('/colaboradores/') || 
            path.includes('/movimentacao/') || 
            path.includes('/auditoria/') ||
            path.includes('/painelcolaborador/')) {
            return '../';
        }
        return '';
    },

    init: function() {
        const sidebarContainer = document.querySelector('.sidebar-container');
        if (sidebarContainer) {
            sidebarContainer.innerHTML = this.renderSidebar();
        }

        const headerArea = document.querySelector('.header-area');
        if (headerArea) {
            const activeMenu = this.getActiveMenu();
            const searchPlaceholder = activeMenu === 'produtos' ? 'Buscar produtos...' : 
                                      activeMenu === 'colaboradores' ? 'Buscar colaboradores...' : 
                                      activeMenu === 'movimentacao' ? 'Buscar movimentações...' : 'Buscar...';
            const showFilterInativos = activeMenu === 'produtos' || activeMenu === 'colaboradores';
            const showSearch = activeMenu !== 'dashboard';
            headerArea.innerHTML = this.renderHeader(searchPlaceholder, showFilterInativos, showSearch);
        }

        this.initEventListeners();

        const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
        if (usuario?.tipo !== 'GESTOR') {
            document.querySelectorAll('.gestor-only').forEach(el => {
                el.style.display = 'none';
            });
        }

        document.querySelectorAll('.sidebar-menu-link').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelector('.sidebar')?.classList.remove('show');
            });
        });
    },

    initEventListeners: function() {
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                document.querySelector('.sidebar').classList.toggle('show');
            });
        }

        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', function() {
                document.querySelector('.sidebar').classList.remove('show');
            });
        }

        const logoutBtn = document.querySelector('.btn-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                if (confirm('Deseja realmente sair?')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('tipoToken');
                    localStorage.removeItem('usuario');
                    window.location.href = Components.getBasePath() + 'index.html';
                }
            });
        }

        const reloadBtn = document.querySelector('.btn-reload');
        if (reloadBtn) {
            reloadBtn.addEventListener('click', function() {
                location.reload();
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    Components.init();
});
