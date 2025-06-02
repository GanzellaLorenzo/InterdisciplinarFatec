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
@Table(name= "estoque")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class EstoqueEntity {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @Column(name= "idestoque")
    private int estoqueId;

    @Column(name= "nome", length= 200, nullable= false)
    private String nome;

}
