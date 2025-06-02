package com.estoque.projeto.repository;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.estoque.projeto.entity.LogAuditoriaEntity;

@Repository
public interface LogAuditoriaRepository extends JpaRepository<LogAuditoriaEntity, Long> {
    
    Page<LogAuditoriaEntity> findByTipoAcaoContainingOrderByDataHoraDesc(String tipoAcao, Pageable pageable);
    
    Page<LogAuditoriaEntity> findByDataHoraBetweenOrderByDataHoraDesc(
            LocalDateTime inicio, LocalDateTime fim, Pageable pageable);
    
    Page<LogAuditoriaEntity> findByGestorUserIdOrderByDataHoraDesc(Integer gestorId, Pageable pageable);
    
    Page<LogAuditoriaEntity> findByColaboradorUserIdOrderByDataHoraDesc(Integer colaboradorId, Pageable pageable);
}