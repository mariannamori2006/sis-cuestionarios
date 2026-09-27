package com.nativatec.cuestionarios.dto;

import java.util.UUID;

public class ResultadoEvaluacionDTO {
    private UUID intentoId;
    private Double calificacion;
    private String notaFormateada;
    private Integer aciertos;
    private Integer totalPreguntas;
    private String mensaje;
    private Boolean requiereRevision = false;

    public ResultadoEvaluacionDTO() {
    }

    public ResultadoEvaluacionDTO(UUID intentoId, Double calificacion, String notaFormateada, Integer aciertos, Integer totalPreguntas, String mensaje) {
        this(intentoId, calificacion, notaFormateada, aciertos, totalPreguntas, mensaje, false);
    }

    public ResultadoEvaluacionDTO(UUID intentoId, Double calificacion, String notaFormateada, Integer aciertos, Integer totalPreguntas, String mensaje, Boolean requiereRevision) {
        this.intentoId = intentoId;
        this.calificacion = calificacion;
        this.notaFormateada = notaFormateada;
        this.aciertos = aciertos;
        this.totalPreguntas = totalPreguntas;
        this.mensaje = mensaje;
        this.requiereRevision = requiereRevision != null ? requiereRevision : false;
    }

    public UUID getIntentoId() {
        return intentoId;
    }

    public void setIntentoId(UUID intentoId) {
        this.intentoId = intentoId;
    }

    public Double getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Double calificacion) {
        this.calificacion = calificacion;
    }

    public String getNotaFormateada() {
        return notaFormateada;
    }

    public void setNotaFormateada(String notaFormateada) {
        this.notaFormateada = notaFormateada;
    }

    public Integer getAciertos() {
        return aciertos;
    }

    public void setAciertos(Integer aciertos) {
        this.aciertos = aciertos;
    }

    public Integer getTotalPreguntas() {
        return totalPreguntas;
    }

    public void setTotalPreguntas(Integer totalPreguntas) {
        this.totalPreguntas = totalPreguntas;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Boolean getRequiereRevision() {
        return requiereRevision;
    }

    public void setRequiereRevision(Boolean requiereRevision) {
        this.requiereRevision = requiereRevision;
    }
}
