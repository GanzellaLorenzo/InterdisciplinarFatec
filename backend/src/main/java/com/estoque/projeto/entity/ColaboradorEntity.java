package com.estoque.projeto.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name= "colaborador")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ColaboradorEntity {
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name= "idColaborador")
    private int userId;

    @Column(name= "nome", nullable= false)
    private String nomeColaborador;

    @Column(name= "email", nullable= false)
    private String emailColaborador;

    @Column(name= "senha", nullable= false)
    private String senhaColaborador;
    
    @Column(name = "ativo", nullable = false)
    private boolean ativo = true;
    
    @ManyToOne
    @JoinColumn(name = "gestor_id", nullable = false)
    private GestorEntity gestor;
}
