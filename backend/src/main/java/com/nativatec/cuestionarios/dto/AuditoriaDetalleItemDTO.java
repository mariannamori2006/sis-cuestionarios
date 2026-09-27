package com.nativatec.cuestionarios.dto;

import java.util.UUID;

public class AuditoriaDetalleItemDTO {
    private UUID preguntaId;
    private String enunciado;
    private String tipo;
    private Integer orden;
    private String respuestaAlumno;
    private String respuestaCorrecta;
    private Boolean esCorrecta;
    private Boolean esEscrita;

    public AuditoriaDetalleItemDTO() {
    }

    public AuditoriaDetalleItemDTO(UUID preguntaId, String enunciado, String tipo, Integer orden,
                                  String respuestaAlumno, String respuestaCorrecta, Boolean esCorrecta, Boolean esEscrita) {
        this.preguntaId = preguntaId;
        this.enunciado = enunciado;
        this.tipo = tipo;
        this.orden = orden;
        this.respuestaAlumno = respuestaAlumno;
        this.respuestaCorrecta = respuestaCorrecta;
        this.esCorrecta = esCorrecta;
        this.esEscrita = esEscrita;
    }

    public UUID getPreguntaId() {
        return preguntaId;
    }

    public void setPreguntaId(UUID preguntaId) {
        this.preguntaId = preguntaId;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public String getRespuestaAlumno() {
        return respuestaAlumno;
    }

    public void setRespuestaAlumno(String respuestaAlumno) {
        this.respuestaAlumno = respuestaAlumno;
    }

    public String getRespuestaCorrecta() {
        return respuestaCorrecta;
    }

    public void setRespuestaCorrecta(String respuestaCorrecta) {
        this.respuestaCorrecta = respuestaCorrecta;
    }

    public Boolean getEsCorrecta() {
        return esCorrecta;
    }

    public void setEsCorrecta(Boolean esCorrecta) {
        this.esCorrecta = esCorrecta;
    }

    public Boolean getEsEscrita() {
        return esEscrita;
    }

    public void setEsEscrita(Boolean esEscrita) {
        this.esEscrita = esEscrita;
    }
}
