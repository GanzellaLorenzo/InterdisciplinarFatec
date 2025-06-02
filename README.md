# Sistema de Gestão de Estoque

Um sistema completo fullstack para gerenciamento de estoque, produtos e colaboradores, com controle de acesso diferenciado entre gestores e colaboradores.

## 📋 Sobre o Projeto

Este sistema foi desenvolvido como projeto interdisciplinar da FATEC, oferecendo uma solução completa para gestão de estoques com controle de entradas e saídas, histórico de movimentações e auditoria detalhada de todas as operações.

### Funcionalidades Principais

- **Gestão de Produtos**: Cadastro, edição, ativação/desativação e listagem de produtos
- **Controle de Estoque**: Registro de entradas e saídas com atualizações automáticas do estoque
- **Gestão de Usuários**: Cadastro e gerenciamento de colaboradores (pelo gestor)
- **Auditoria**: Registro detalhado de todas as alterações e movimentações realizadas
- **Dashboard**: Visão geral com estatísticas e informações relevantes
- **Controle de Acesso**: Permissões diferenciadas para gestores e colaboradores

## 🚀 Tecnologias Utilizadas

### Backend
- **Java 17** 
- **Spring Boot 3.4.5**
- **Spring Data JPA**
- **PostgreSQL**
- **Lombok**
- **Maven**

### Frontend
- **HTML5**
- **CSS3**
- **JavaScript (Vanilla)**
- **Bootstrap 5**
- **Bootstrap Icons**

## 🔧 Instalação e Execução

### Pré-requisitos
- Java 17
- PostgreSQL
- Maven

### Backend

1. Configure o banco de dados PostgreSQL:
   ```sql
   CREATE DATABASE estoque_db;
   ```

2. Configure as credenciais no arquivo `application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/estoque_db
   spring.datasource.username=seu_usuario
   spring.datasource.password=sua_senha
   ```

3. Execute a aplicação Spring Boot:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
   A API estará disponível em http://localhost:8080/api

### Frontend

1. O frontend pode ser executado diretamente abrindo os arquivos HTML em um navegador ou utilizando um servidor local como Live Server (extensão do VS Code).

2. Acesse a aplicação através do arquivo `index.html` na pasta frontend.

## 👥 Perfis de Usuário

### Gestor
- Acesso completo ao sistema
- Gerenciamento de produtos (CRUD)
- Gerenciamento de colaboradores (CRUD)
- Visualização de histórico de auditoria
- Dashboard gerencial

### Colaborador
- Visualização de produtos
- Registro de entradas e saídas no estoque
- Visualização limitada de histórico

## 🔒 Autenticação

O sistema utiliza autenticação básica com email e senha, diferenciando entre gestores e colaboradores. 
Para testar o sistema, você pode criar um gestor através da tela de cadastro e posteriormente adicionar colaboradores.

## 📊 Principais Telas

- **Login**: Autenticação de usuários
- **Dashboard**: Visão geral e estatísticas
- **Produtos**: Listagem, cadastro e edição de produtos
- **Colaboradores**: Gerenciamento de usuários colaboradores
- **Auditoria**: Histórico de operações e alterações

## 📜 Licença

Este projeto é para fins educacionais como parte do currículo da FATEC.

## 🤝 Contribuições

Projeto desenvolvido como atividade interdisciplinar. Contribuições são bem-vindas através de pull requests.

---

Desenvolvido como projeto interdisciplinar da FATEC
