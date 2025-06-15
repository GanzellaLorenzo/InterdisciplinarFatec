package com.estoque.projeto.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.estoque.projeto.entity.ColaboradorEntity;
import com.estoque.projeto.repository.ColaboradorRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ColaboradorService {
    private final ColaboradorRepository colaboradorRepository;
    
    public List<ColaboradorEntity> listarTodos() {
        return colaboradorRepository.findAll();
    }
    
    public List<ColaboradorEntity> listarPorGestor(Integer gestorId) {
        return colaboradorRepository.findByGestorUserIdAndAtivoTrue(gestorId);
    }
    
    public Optional<ColaboradorEntity> buscarPorId(Integer id) {
        return colaboradorRepository.findById(id);
    }
    
    public ColaboradorEntity salvar(ColaboradorEntity colaborador) {
        return colaboradorRepository.save(colaborador);
    }
    
    public ColaboradorEntity atualizar(Integer id, ColaboradorEntity colaboradorAtualizado) {
        return colaboradorRepository.findById(id)
            .map(colaboradorExistente -> {
                if (colaboradorAtualizado.getNomeColaborador() != null) {
                    colaboradorExistente.setNomeColaborador(colaboradorAtualizado.getNomeColaborador());
                }
                if (colaboradorAtualizado.getEmailColaborador() != null) {
                    colaboradorExistente.setEmailColaborador(colaboradorAtualizado.getEmailColaborador());
                }
                if (colaboradorAtualizado.getSenhaColaborador() != null) {
                    colaboradorExistente.setSenhaColaborador(colaboradorAtualizado.getSenhaColaborador());
                }
                colaboradorExistente.setAtivo(colaboradorAtualizado.isAtivo());
                
                return colaboradorRepository.save(colaboradorExistente);
            })
            .orElseThrow(() -> new RuntimeException("Colaborador não encontrado"));
    }
    
    public void excluir(Integer id) {
        ColaboradorEntity colaborador = buscarPorId(id)
                .orElseThrow(() -> new RuntimeException("Colaborador não encontrado"));
        colaborador.setAtivo(false);
        colaboradorRepository.save(colaborador);
    }
    
    public Optional<ColaboradorEntity> login(String email, String senha) {
        return colaboradorRepository.findByEmailColaboradorAndSenhaColaborador(email, senha);
    }
}