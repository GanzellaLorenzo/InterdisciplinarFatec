package com.estoque.projeto.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estoque.projeto.entity.GestorEntity;
import com.estoque.projeto.entity.ProdutoEntity;
import com.estoque.projeto.service.LogAuditoriaService;
import com.estoque.projeto.service.ProdutoService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/produtos")
@RequiredArgsConstructor
public class ProdutoController {
    private final ProdutoService produtoService;
    private final LogAuditoriaService logAuditoriaService;
    
    private GestorEntity getUsuarioLogado(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new RuntimeException("Usuário não autenticado");
        }
        
        GestorEntity gestor = (GestorEntity) session.getAttribute("USUARIO_LOGADO");
        if (gestor == null) {
            throw new RuntimeException("Usuário não autenticado");
        }
        
        return gestor;
    }

    @GetMapping
    public ResponseEntity<List<ProdutoEntity>> listarTodos() {
        List<ProdutoEntity> lista = produtoService.listarTodos();
        return ResponseEntity.ok().body(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutoEntity> getProdutoPorId(@PathVariable int id) {
        Optional<ProdutoEntity> user = produtoService.buscarId(id);
        return user.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PostMapping
    public ResponseEntity<ProdutoEntity> incluir(@RequestBody ProdutoEntity produto, HttpServletRequest request) {
        ProdutoEntity novo = produtoService.incluir(produto);
        if (novo != null) {
            try {
                GestorEntity usuarioLogado = getUsuarioLogado(request);
                
                logAuditoriaService.registrarLog(
                        "CRIAR_PRODUTO",
                        "Criação do produto: " + novo.getProdNome(),
                        (long) novo.getProdId(),
                        usuarioLogado,
                        null
                );
            } catch (RuntimeException e) {
                System.out.println("Aviso: " + e.getMessage() + ". O produto foi salvo, mas o log de auditoria não foi registrado.");
            }
            
            return new ResponseEntity<>(novo, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProdutoEntity> editar(@PathVariable int id, @RequestBody ProdutoEntity produto, HttpServletRequest request) {
        produto.setProdId(id);
        ProdutoEntity atualizado = produtoService.editar(id, produto);
        if (atualizado != null) {
            try {
                GestorEntity usuarioLogado = getUsuarioLogado(request);
                logAuditoriaService.registrarLog(
                        "EDITAR_PRODUTO",
                        "Edição do produto: " + atualizado.getProdNome(),
                        (long) atualizado.getProdId(),
                        usuarioLogado,
                        null
                );
            } catch (RuntimeException e) {
                System.out.println("Aviso: " + e.getMessage() + ". O produto foi atualizado, mas o log de auditoria não foi registrado.");
            }
            
            return new ResponseEntity<>(atualizado, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable int id, HttpServletRequest request) {
        Optional<ProdutoEntity> produto = produtoService.buscarId(id);
        if (produto.isPresent()) {
            produtoService.excluir(id);
            
            try {
                GestorEntity usuarioLogado = getUsuarioLogado(request);
                logAuditoriaService.registrarLog(
                        "EXCLUIR_PRODUTO",
                        "Exclusão do produto: " + produto.get().getProdNome(),
                        (long) id,
                        usuarioLogado,
                        null
                );
            } catch (RuntimeException e) {
                System.out.println("Aviso: " + e.getMessage() + ". O produto foi excluído, mas o log de auditoria não foi registrado.");
            }
        }
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
