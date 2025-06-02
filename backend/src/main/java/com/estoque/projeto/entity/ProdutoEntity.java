package com.estoque.projeto.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "produto")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ProdutoEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idprod")
    private Integer prodId;
    
    @Column(name = "nome", nullable = false)
    private String prodNome;
    
    @Column(name = "descricao")
    private String prodDescricao;
    
    @Column(name = "precocompra")
    private Double prodPrecoCompra;
    
    @Column(name = "precovenda", nullable = false)
    private Double prodPrecoVenda;
    
    @Column(name = "quantidade", nullable = false)
    private Integer quantidade;
    
    @Column(name = "ativo", nullable = false)
    private boolean ativo = true;
}
