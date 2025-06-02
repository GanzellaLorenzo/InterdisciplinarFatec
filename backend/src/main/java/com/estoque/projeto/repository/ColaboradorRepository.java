package com.estoque.projeto.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.estoque.projeto.entity.ColaboradorEntity;

@Repository
public interface ColaboradorRepository extends JpaRepository<ColaboradorEntity, Integer> {
    List<ColaboradorEntity> findByGestorUserIdAndAtivoTrue(Integer gestorId);
    Optional<ColaboradorEntity> findByEmailColaboradorAndSenhaColaborador(String email, String senha);
}