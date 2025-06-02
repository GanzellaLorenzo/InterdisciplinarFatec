package com.estoque.projeto.service;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.estoque.projeto.entity.ColaboradorEntity;
import com.estoque.projeto.entity.GestorEntity;
import com.estoque.projeto.entity.LogAuditoriaEntity;
import com.estoque.projeto.repository.LogAuditoriaRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LogAuditoriaService {

    private final LogAuditoriaRepository logAuditoriaRepository;
    
    public LogAuditoriaEntity registrarLog(String tipoAcao, String descricao, 
                                           Long idRegistro, GestorEntity gestor, 
                                           ColaboradorEntity colaborador) {
        
        LogAuditoriaEntity log = LogAuditoriaEntity.builder()
                .tipoAcao(tipoAcao)
                .descricao(descricao)
                .dataHora(LocalDateTime.now())
                .ipUsuario(getClientIp())
                .idRegistro(idRegistro)
                .gestor(gestor)
                .colaborador(colaborador)
                .build();
        
        return logAuditoriaRepository.save(log);
    }
    
    public Page<LogAuditoriaEntity> buscarLogs(Pageable pageable) {
        return logAuditoriaRepository.findAll(pageable);
    }
    
    public Page<LogAuditoriaEntity> buscarLogsPorTipo(String tipoAcao, Pageable pageable) {
        return logAuditoriaRepository.findByTipoAcaoContainingOrderByDataHoraDesc(tipoAcao, pageable);
    }
    
    public Page<LogAuditoriaEntity> buscarLogsPorPeriodo(LocalDateTime inicio, LocalDateTime fim, Pageable pageable) {
        return logAuditoriaRepository.findByDataHoraBetweenOrderByDataHoraDesc(inicio, fim, pageable);
    }
    
    public Page<LogAuditoriaEntity> buscarLogsPorGestor(Integer gestorId, Pageable pageable) {
        return logAuditoriaRepository.findByGestorUserIdOrderByDataHoraDesc(gestorId, pageable);
    }
    
    public Page<LogAuditoriaEntity> buscarLogsPorColaborador(Integer colaboradorId, Pageable pageable) {
        return logAuditoriaRepository.findByColaboradorUserIdOrderByDataHoraDesc(colaboradorId, pageable);
    }
    
    private String getClientIp() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                String ipAddress = request.getHeader("X-Forwarded-For");
                if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                    ipAddress = request.getHeader("Proxy-Client-IP");
                }
                if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                    ipAddress = request.getHeader("WL-Proxy-Client-IP");
                }
                if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
                    ipAddress = request.getRemoteAddr();
                }
                return ipAddress;
            }
        } catch (Exception e) {
        }
        return "desconhecido";
    }
}