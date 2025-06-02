package com.estoque.projeto.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.estoque.projeto.dto.LoginRequest;
import com.estoque.projeto.entity.GestorEntity;
import com.estoque.projeto.service.GestorService;
import com.estoque.projeto.service.LogAuditoriaService;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/gestores")
@RequiredArgsConstructor
public class GestorController {
    private final GestorService gestorService;
    private final LogAuditoriaService logAuditoriaService;
    
    @GetMapping
    public ResponseEntity<List<GestorEntity>> listarTodos() {
        return ResponseEntity.ok(gestorService.listarTodos());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<GestorEntity> buscarPorId(@PathVariable Integer id) {
        return gestorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<GestorEntity> criar(@RequestBody GestorEntity gestor) {
        GestorEntity novoGestor = gestorService.salvar(gestor);
        
        logAuditoriaService.registrarLog(
                "CRIAR_GESTOR",
                "Criação de novo gestor: " + novoGestor.getNomeGestor(),
                (long) novoGestor.getUserId(),
                novoGestor,
                null
        );
        
        return new ResponseEntity<>(novoGestor, HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<GestorEntity> atualizar(@PathVariable Integer id, @RequestBody GestorEntity gestor) {
        try {
            GestorEntity gestorAtualizado = gestorService.atualizar(id, gestor);

            logAuditoriaService.registrarLog(
                    "ATUALIZAR_GESTOR",
                    "Atualização do gestor: " + gestorAtualizado.getNomeGestor(),
                    (long) gestorAtualizado.getUserId(),
                    gestorAtualizado,
                    null
            );
            
            return ResponseEntity.ok(gestorAtualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<GestorEntity> login(@RequestBody LoginRequest request, HttpSession session) {
        return gestorService.login(request.getEmail(), request.getSenha())
                .map(gestor -> {
                    session.setAttribute("USUARIO_LOGADO", gestor);
                    
                    logAuditoriaService.registrarLog(
                            "LOGIN_GESTOR",
                            "Login do gestor: " + gestor.getNomeGestor(),
                            (long) gestor.getUserId(),
                            gestor,
                            null
                    );
                    return ResponseEntity.ok(gestor);
                })
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}