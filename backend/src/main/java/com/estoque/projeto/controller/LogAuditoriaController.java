package com.estoque.projeto.controller;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.estoque.projeto.entity.LogAuditoriaEntity;
import com.estoque.projeto.service.LogAuditoriaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogAuditoriaController {

    private final LogAuditoriaService logAuditoriaService;
    
    @GetMapping
    public ResponseEntity<Page<LogAuditoriaEntity>> buscarLogs(
            Pageable pageable,
            @RequestParam(required = false) String tipoAcao,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dataFim,
            @RequestParam(required = false) Integer gestorId,
            @RequestParam(required = false) Integer colaboradorId) {
        
        Page<LogAuditoriaEntity> logs;
        
        if (tipoAcao != null && !tipoAcao.isEmpty()) {
            logs = logAuditoriaService.buscarLogsPorTipo(tipoAcao, pageable);
        } else if (dataInicio != null && dataFim != null) {
            logs = logAuditoriaService.buscarLogsPorPeriodo(dataInicio, dataFim, pageable);
        } else if (gestorId != null) {
            logs = logAuditoriaService.buscarLogsPorGestor(gestorId, pageable);
        } else if (colaboradorId != null) {
            logs = logAuditoriaService.buscarLogsPorColaborador(colaboradorId, pageable);
        } else {
            logs = logAuditoriaService.buscarLogs(pageable);
        }
        
        return ResponseEntity.ok(logs);
    }
}
