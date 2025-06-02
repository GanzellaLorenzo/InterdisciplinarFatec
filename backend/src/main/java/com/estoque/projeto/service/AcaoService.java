package com.estoque.projeto.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.estoque.projeto.entity.AcaoEntity;
import com.estoque.projeto.entity.ProdutoEntity;
import com.estoque.projeto.entity.enums.TipoAcao;
import com.estoque.projeto.repository.AcaoRepository;
import com.estoque.projeto.repository.ProdutoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AcaoService {

    private final AcaoRepository acaoRepository;
    private final ProdutoRepository produtoRepository;

    public List<AcaoEntity> listarTodas() {
        return acaoRepository.findAll();
    }

    public Optional<AcaoEntity> buscarPorId(Long id) {
        return acaoRepository.findById(id);
    }

    @Transactional
    public AcaoEntity registrarAcao(AcaoEntity acao) {
        if (acao.getQuantidade() <= 0) {
            throw new RuntimeException("A quantidade deve ser maior que zero");
        }

        ProdutoEntity produto = produtoRepository.findById(acao.getProduto().getProdId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (acao.getAcao() == TipoAcao.ENTRADA) {
            produto.setQuantidade(produto.getQuantidade() + acao.getQuantidade());
        } else if (acao.getAcao() == TipoAcao.SAIDA) {
            if (produto.getQuantidade() < acao.getQuantidade()) {
                throw new RuntimeException("Estoque insuficiente. Disponível: " + produto.getQuantidade());
            }
            produto.setQuantidade(produto.getQuantidade() - acao.getQuantidade());
        }

        produtoRepository.save(produto);

        return acaoRepository.save(acao);
    }
}