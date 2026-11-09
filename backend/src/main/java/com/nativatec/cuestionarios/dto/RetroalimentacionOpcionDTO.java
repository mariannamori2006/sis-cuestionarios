package com.nativatec.cuestionarios.dto;

import java.util.UUID;

public class RetroalimentacionOpcionDTO {
    private UUID id;
    private String texto;
    private Boolean esCorrecta;
    private Boolean fueSeleccionada;

    public RetroalimentacionOpcionDTO() {
    }

    public RetroalimentacionOpcionDTO(UUID id, String texto, Boolean esCorrecta, Boolean fueSeleccionada) {
        this.id = id;
        this.texto = texto;
        this.esCorrecta = esCorrecta != null ? esCorrecta : false;
        this.fueSeleccionada = fueSeleccionada != null ? fueSeleccionada : false;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public Boolean getEsCorrecta() {
        return esCorrecta;
    }

    public void setEsCorrecta(Boolean esCorrecta) {
        this.esCorrecta = esCorrecta;
    }

    public Boolean getFueSeleccionada() {
        return fueSeleccionada;
    }

    public void setFueSeleccionada(Boolean fueSeleccionada) {
        this.fueSeleccionada = fueSeleccionada;
    }
}
