package com.nativatec.cuestionarios.dto;

public class VerificarCodigoRequest {
    private String email;
    private String codigo;

    public VerificarCodigoRequest() {
    }

    public VerificarCodigoRequest(String email, String codigo) {
        this.email = email;
        this.codigo = codigo;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}

