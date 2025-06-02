package com.estoque.projeto.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.estoque.projeto.entity.EstoqueEntity;

@Repository
public interface EstoqueRepository extends JpaRepository<EstoqueEntity,Integer>{

}
