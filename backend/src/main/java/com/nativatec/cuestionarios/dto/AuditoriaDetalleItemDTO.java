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
    private String imagenUrl;
    private String explicacion;
    private Double puntosAsignados;
    private Double puntosObtenidos;

    public AuditoriaDetalleItemDTO() {
    }

    public AuditoriaDetalleItemDTO(UUID preguntaId, String enunciado, String tipo, Integer orden,
                                  String respuestaAlumno, String respuestaCorrecta, Boolean esCorrecta, Boolean esEscrita) {
        this(preguntaId, enunciado, tipo, orden, respuestaAlumno, respuestaCorrecta, esCorrecta, esEscrita, null, null, null, null);
    }

    public AuditoriaDetalleItemDTO(UUID preguntaId, String enunciado, String tipo, Integer orden,
                                  String respuestaAlumno, String respuestaCorrecta, Boolean esCorrecta, Boolean esEscrita,
                                  String imagenUrl) {
        this(preguntaId, enunciado, tipo, orden, respuestaAlumno, respuestaCorrecta, esCorrecta, esEscrita, imagenUrl, null, null, null);
    }

    public AuditoriaDetalleItemDTO(UUID preguntaId, String enunciado, String tipo, Integer orden,
                                  String respuestaAlumno, String respuestaCorrecta, Boolean esCorrecta, Boolean esEscrita,
                                  String imagenUrl, String explicacion) {
        this(preguntaId, enunciado, tipo, orden, respuestaAlumno, respuestaCorrecta, esCorrecta, esEscrita, imagenUrl, explicacion, null, null);
    }

    public AuditoriaDetalleItemDTO(UUID preguntaId, String enunciado, String tipo, Integer orden,
                                  String respuestaAlumno, String respuestaCorrecta, Boolean esCorrecta, Boolean esEscrita,
                                  String imagenUrl, String explicacion, Double puntosAsignados, Double puntosObtenidos) {
        this.preguntaId = preguntaId;
        this.enunciado = enunciado;
        this.tipo = tipo;
        this.orden = orden;
        this.respuestaAlumno = respuestaAlumno;
        this.respuestaCorrecta = respuestaCorrecta;
        this.esCorrecta = esCorrecta;
        this.esEscrita = esEscrita;
        this.imagenUrl = imagenUrl;
        this.explicacion = explicacion;
        this.puntosAsignados = puntosAsignados;
        this.puntosObtenidos = puntosObtenidos;
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

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getExplicacion() {
        return explicacion;
    }

    public void setExplicacion(String explicacion) {
        this.explicacion = explicacion;
    }

    public Double getPuntosAsignados() {
        return puntosAsignados;
    }

    public void setPuntosAsignados(Double puntosAsignados) {
        this.puntosAsignados = puntosAsignados;
    }

    public Double getPuntosObtenidos() {
        return puntosObtenidos;
    }

    public void setPuntosObtenidos(Double puntosObtenidos) {
        this.puntosObtenidos = puntosObtenidos;
    }
}
