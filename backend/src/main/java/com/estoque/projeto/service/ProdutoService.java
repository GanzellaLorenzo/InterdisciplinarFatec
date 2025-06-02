package com.estoque.projeto.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.estoque.projeto.entity.ProdutoEntity;
import com.estoque.projeto.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;

    public ProdutoEntity incluir(ProdutoEntity produto) {
        return produtoRepository.save(produto);
    }

    public ProdutoEntity editar(int id, ProdutoEntity produto) {
        if(!produtoRepository.existsById(id)) {
            return null;
        }
        return produtoRepository.save(produto);
    }

    public List<ProdutoEntity> listarTodos() {
        return produtoRepository.findAll();
    }

    public Optional<ProdutoEntity> buscarId(Integer prodId) {
        return produtoRepository.findById(prodId);
    }

    public void excluir(Integer prodId) {
        Optional<ProdutoEntity> produto = buscarId(prodId);
        if (produto.isPresent()) {
            ProdutoEntity prod = produto.get();
            prod.setAtivo(false);
            produtoRepository.save(prod);
        }
    }
    

}
