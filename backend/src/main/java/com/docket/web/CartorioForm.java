package com.docket.web;

import com.docket.cartorios.dto.CartorioRequest;
import com.docket.cartorios.dto.CartorioResponse;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Espelho mutável de {@link CartorioRequest}, para binding de formulário com
 * re-exibição de erro — um record imutável não serve para isso.
 *
 * <p><strong>Sem anotações de validação aqui.</strong> As regras ficam no record,
 * e o controller valida o objeto convertido, devolvendo violações aos campos
 * deste form. Duplicar constraints deixaria as duas cópias divergirem — como
 * já aconteceu com mensagens.
 */
public class CartorioForm {

    private String nome;

    private String cep;

    private String rua;

    private String numero;

    private String complemento;

    private String bairro;

    private String cidade;

    private String uf;

    private Set<Long> documentoIds = new HashSet<>();

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getRua() {
        return rua;
    }

    public void setRua(String rua) {
        this.rua = rua;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getComplemento() {
        return complemento;
    }

    public void setComplemento(String complemento) {
        this.complemento = complemento;
    }

    public String getBairro() {
        return bairro;
    }

    public void setBairro(String bairro) {
        this.bairro = bairro;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getUf() {
        return uf;
    }

    public void setUf(String uf) {
        this.uf = uf;
    }

    public Set<Long> getDocumentoIds() {
        return documentoIds;
    }

    public void setDocumentoIds(Set<Long> documentoIds) {
        this.documentoIds = documentoIds != null ? documentoIds : new HashSet<>();
    }

    public CartorioRequest toRequest() {
        return new CartorioRequest(
                nome, cep, rua, numero, complemento, bairro, cidade, uf, documentoIds);
    }

    public static CartorioForm from(CartorioResponse response) {
        CartorioForm form = new CartorioForm();
        form.setNome(response.nome());
        form.setCep(response.cep());
        form.setRua(response.rua());
        form.setNumero(response.numero());
        form.setComplemento(response.complemento());
        form.setBairro(response.bairro());
        form.setCidade(response.cidade());
        form.setUf(response.uf());
        form.setDocumentoIds(
                response.documentos().stream().map(d -> d.id()).collect(Collectors.toSet()));
        return form;
    }
}
