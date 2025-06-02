package com.estoque.projeto.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estoque.projeto.entity.AcaoEntity;
import com.estoque.projeto.entity.GestorEntity;
import com.estoque.projeto.entity.ProdutoEntity;
import com.estoque.projeto.entity.enums.TipoAcao;
import com.estoque.projeto.service.AcaoService;
import com.estoque.projeto.service.LogAuditoriaService;
import com.estoque.projeto.service.ProdutoService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/acoes")
@RequiredArgsConstructor
public class AcaoController {

    private final AcaoService acaoService;
    private final LogAuditoriaService logAuditoriaService;
    private final ProdutoService produtoService;
    
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
    public ResponseEntity<List<AcaoEntity>> listarTodas() {
        return ResponseEntity.ok(acaoService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcaoEntity> buscarPorId(@PathVariable Long id) {
        return acaoService.buscarPorId(id)
                .map(acao -> ResponseEntity.ok(acao))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AcaoEntity> registrarAcao(@RequestBody AcaoEntity acao, HttpServletRequest request) {
        try {
            ProdutoEntity produtoCompleto = produtoService.buscarId(acao.getProduto().getProdId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
            
            acao.setProduto(produtoCompleto);
            
            AcaoEntity acaoRegistrada = acaoService.registrarAcao(acao);
            
            try {
                GestorEntity usuarioLogado = getUsuarioLogado(request);
                String tipoLog = acao.getAcao() == TipoAcao.ENTRADA ? "ENTRADA_ESTOQUE" : "SAIDA_ESTOQUE";
                
                String descricao = String.format("%s de %d unidades do produto %s", 
                        acao.getAcao() == TipoAcao.ENTRADA ? "Entrada" : "Saída",
                        acao.getQuantidade(),
                        produtoCompleto.getProdNome());
                
                logAuditoriaService.registrarLog(
                        tipoLog,
                        descricao,
                        acaoRegistrada.getId(),
                        usuarioLogado,
                        null
                );
            } catch (RuntimeException e) {
                System.out.println("Aviso: " + e.getMessage() + 
                    ". A movimentação foi registrada, mas o log de auditoria não foi criado.");
            }
            
            return new ResponseEntity<>(acaoRegistrada, HttpStatus.CREATED);
            
        } catch (RuntimeException e) {
            System.out.println("Erro na movimentação: " + e.getMessage());
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }
}