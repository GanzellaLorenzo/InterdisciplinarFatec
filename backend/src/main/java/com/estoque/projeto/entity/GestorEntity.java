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
@Table(name= "gestor")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class GestorEntity {

    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    @Column(name= "idgestor")
    private int userId;

    @Column(name= "empresa", nullable= false)
    private String empresaGestor;

    @Column(name= "nome", nullable= false)
    private String nomeGestor;

    @Column(name= "email", nullable= false)
    private String emailGestor;

    @Column(name= "senha", nullable= false)
    private String senhaGestor;

}
