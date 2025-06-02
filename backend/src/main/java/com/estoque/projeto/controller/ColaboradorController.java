package com.estoque.projeto.controller;

import java.util.List;

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

import com.estoque.projeto.dto.LoginRequest;
import com.estoque.projeto.entity.ColaboradorEntity;
import com.estoque.projeto.service.ColaboradorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/colaboradores")
@RequiredArgsConstructor
public class ColaboradorController {
    private final ColaboradorService colaboradorService;
    
    @GetMapping
    public ResponseEntity<List<ColaboradorEntity>> listarTodos() {
        return ResponseEntity.ok(colaboradorService.listarTodos());
    }
    
    @GetMapping("/gestor/{gestorId}")
    public ResponseEntity<List<ColaboradorEntity>> listarPorGestor(@PathVariable Integer gestorId) {
        return ResponseEntity.ok(colaboradorService.listarPorGestor(gestorId));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ColaboradorEntity> buscarPorId(@PathVariable Integer id) {
        return colaboradorService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping
    public ResponseEntity<ColaboradorEntity> criar(@RequestBody ColaboradorEntity colaborador) {
        return new ResponseEntity<>(colaboradorService.salvar(colaborador), HttpStatus.CREATED);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ColaboradorEntity> atualizar(@PathVariable Integer id, @RequestBody ColaboradorEntity colaborador) {
        try {
            return ResponseEntity.ok(colaboradorService.atualizar(id, colaborador));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> excluir(@PathVariable Integer id) {
        try {
            colaboradorService.excluir(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ColaboradorEntity> login(@RequestBody LoginRequest request) {
        return colaboradorService.login(request.getEmail(), request.getSenha())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
    }
}