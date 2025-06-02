package com.estoque.projeto.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.estoque.projeto.entity.GestorEntity;
import com.estoque.projeto.repository.GestorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GestorService {
    private final GestorRepository gestorRepository;
    
    public List<GestorEntity> listarTodos() {
        return gestorRepository.findAll();
    }
    
    public Optional<GestorEntity> buscarPorId(Integer id) {
        return gestorRepository.findById(id);
    }
    
    public GestorEntity salvar(GestorEntity gestor) {
        return gestorRepository.save(gestor);
    }
    
    public GestorEntity atualizar(Integer id, GestorEntity gestor) {
        if (!gestorRepository.existsById(id)) {
            throw new RuntimeException("Gestor não encontrado");
        }
        gestor.setUserId(id);
        return gestorRepository.save(gestor);
    }
    
    public Optional<GestorEntity> login(String email, String senha) {
        return gestorRepository.findByEmailGestorAndSenhaGestor(email, senha);
    }
}