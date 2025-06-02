# Sistema de Controle de Estoque

Um sistema web completo para gerenciamento de estoque, controle de produtos, movimentações e auditoria.

## 📋 Sobre o Projeto

Este sistema foi desenvolvido para gerenciar o estoque de produtos de uma empresa, permitindo o controle de entradas e saídas, cadastro de produtos e colaboradores, além de um sistema completo de auditoria para rastreamento de ações.

### ✨ Principais Recursos

- Dashboard com visão geral do estoque
- Gerenciamento completo de produtos
- Controle de entrada e saída de produtos
- Gestão de colaboradores (perfil de gestor)
- Sistema de auditoria para rastreamento de movimentações
- Diferentes níveis de acesso (gestor e colaborador)
- Interface responsiva para desktop e dispositivos móveis

## 🚀 Tecnologias Utilizadas

- HTML5
- CSS3
- JavaScript (ES6+)
- Bootstrap 5
- APIs RESTful
- Fetch API

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js (para servir os arquivos estáticos)
- Backend API em execução (Java Spring Boot)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/GanzellaLorenzo/EstoqueFacilFatec.git
cd controle-estoque
```

2. Configure a URL da API:
   - Abra o arquivo `js/utils.js`
   - Atualize a constante `API_URL` com o endereço do seu backend

3. Execute o projeto (usando um servidor local, como o Live Server do VS Code ou http-server):
```bash
# Usando http-server
npx http-server
```

## 📱 Funcionalidades

### Módulo de Produtos
- Cadastro de produtos
- Listagem com filtros
- Edição e desativação
- Controle de estoque

### Módulo de Movimentações
- Registro de entradas e saídas
- Histórico de movimentações
- Validação de estoque disponível

### Módulo de Auditoria
- Registro detalhado de todas as ações
- Filtros por tipo de ação, usuário e período
- Visualização de detalhes de cada operação

### Módulo de Colaboradores (Perfil Gestor)
- Cadastro de colaboradores
- Gerenciamento de acesso
- Ativação/desativação de contas

## 👥 Perfis de Usuário

### Gestor
- Acesso completo ao sistema
- Cadastro e gerenciamento de colaboradores
- Visualização de relatórios gerenciais
- Gerenciamento completo de produtos

### Colaborador
- Visualização de produtos
- Registro de movimentações
- Visualização de histórico de auditoria

## 📝 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
