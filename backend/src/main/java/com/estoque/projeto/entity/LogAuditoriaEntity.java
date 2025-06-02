package com.estoque.projeto.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "log_auditoria")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LogAuditoriaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "tipo_acao", nullable = false)
    private String tipoAcao; // LOGIN, LOGOUT, CRIAR_PRODUTO, EDITAR_PRODUTO, ENTRADA_ESTOQUE, SAIDA_ESTOQUE
    
    @Column(name = "descricao")
    private String descricao;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "data_hora", nullable = false)
    private LocalDateTime dataHora;
    
    @Column(name = "ip_usuario")
    private String ipUsuario;
    
    @Column(name = "id_registro")
    private Long idRegistro;
    
    @ManyToOne
    @JoinColumn(name = "gestor_id")
    private GestorEntity gestor;
    
    @ManyToOne
    @JoinColumn(name = "colaborador_id")
    private ColaboradorEntity colaborador;
}