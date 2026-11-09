package com.nativatec.cuestionarios.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class RetroalimentacionPreguntaDTO {
    private UUID preguntaId;
    private String enunciado;
    private String tipo;
    private Integer orden;
    private String imagenUrl;
    private String respuestaAlumno;
    private String respuestaCorrecta;
    private Boolean esCorrecta;
    private Boolean esEscrita;
    private String explicacion;
    private Double puntosAsignados;
    private Double puntosObtenidos;
    private List<RetroalimentacionOpcionDTO> opciones = new ArrayList<>();

    public RetroalimentacionPreguntaDTO() {
    }

    public RetroalimentacionPreguntaDTO(UUID preguntaId, String enunciado, String tipo, Integer orden,
                                       String imagenUrl, String respuestaAlumno, String respuestaCorrecta,
                                       Boolean esCorrecta, Boolean esEscrita, String explicacion,
                                       List<RetroalimentacionOpcionDTO> opciones) {
        this(preguntaId, enunciado, tipo, orden, imagenUrl, respuestaAlumno, respuestaCorrecta, esCorrecta, esEscrita, explicacion, null, null, opciones);
    }

    public RetroalimentacionPreguntaDTO(UUID preguntaId, String enunciado, String tipo, Integer orden,
                                       String imagenUrl, String respuestaAlumno, String respuestaCorrecta,
                                       Boolean esCorrecta, Boolean esEscrita, String explicacion,
                                       Double puntosAsignados, Double puntosObtenidos,
                                       List<RetroalimentacionOpcionDTO> opciones) {
        this.preguntaId = preguntaId;
        this.enunciado = enunciado;
        this.tipo = tipo;
        this.orden = orden;
        this.imagenUrl = imagenUrl;
        this.respuestaAlumno = respuestaAlumno;
        this.respuestaCorrecta = respuestaCorrecta;
        this.esCorrecta = esCorrecta;
        this.esEscrita = esEscrita != null ? esEscrita : false;
        this.explicacion = explicacion;
        this.puntosAsignados = puntosAsignados;
        this.puntosObtenidos = puntosObtenidos;
        this.opciones = opciones != null ? opciones : new ArrayList<>();
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

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
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

    public List<RetroalimentacionOpcionDTO> getOpciones() {
        return opciones;
    }

    public void setOpciones(List<RetroalimentacionOpcionDTO> opciones) {
        this.opciones = opciones;
    }
}
