package com.estoque.projeto.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.estoque.projeto.entity.GestorEntity;

@Repository
public interface GestorRepository extends JpaRepository<GestorEntity, Integer> {
    Optional<GestorEntity> findByEmailGestorAndSenhaGestor(String email, String senha);
}