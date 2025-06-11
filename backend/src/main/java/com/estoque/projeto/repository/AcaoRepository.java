package com.estoque.projeto.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.estoque.projeto.entity.AcaoEntity;

@Repository
public interface AcaoRepository extends JpaRepository<AcaoEntity, Long> {
    Page<AcaoEntity> findAllByOrderByIdDesc(Pageable pageable);
}