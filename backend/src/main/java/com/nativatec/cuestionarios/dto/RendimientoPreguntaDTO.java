package com.nativatec.cuestionarios.dto;

import java.util.UUID;

public class RendimientoPreguntaDTO {
    private UUID preguntaId;
    private UUID cuestionarioId;
    private String cuestionarioTitulo;
    private String materia;
    private String enunciado;
    private Integer orden;
    private String tipo;
    private long totalRespuestas;
    private long respuestasCorrectas;
    private long respuestasIncorrectas;
    private double tasaAciertos;
    private String dificultad;

    public RendimientoPreguntaDTO() {
    }

    public RendimientoPreguntaDTO(UUID preguntaId, UUID cuestionarioId, String cuestionarioTitulo,
                                  String materia, String enunciado, Integer orden, String tipo,
                                  long totalRespuestas, long respuestasCorrectas, long respuestasIncorrectas,
                                  double tasaAciertos, String dificultad) {
        this.preguntaId = preguntaId;
        this.cuestionarioId = cuestionarioId;
        this.cuestionarioTitulo = cuestionarioTitulo;
        this.materia = materia;
        this.enunciado = enunciado;
        this.orden = orden;
        this.tipo = tipo;
        this.totalRespuestas = totalRespuestas;
        this.respuestasCorrectas = respuestasCorrectas;
        this.respuestasIncorrectas = respuestasIncorrectas;
        this.tasaAciertos = tasaAciertos;
        this.dificultad = dificultad;
    }

    public UUID getPreguntaId() {
        return preguntaId;
    }

    public void setPreguntaId(UUID preguntaId) {
        this.preguntaId = preguntaId;
    }

    public UUID getCuestionarioId() {
        return cuestionarioId;
    }

    public void setCuestionarioId(UUID cuestionarioId) {
        this.cuestionarioId = cuestionarioId;
    }

    public String getCuestionarioTitulo() {
        return cuestionarioTitulo;
    }

    public void setCuestionarioTitulo(String cuestionarioTitulo) {
        this.cuestionarioTitulo = cuestionarioTitulo;
    }

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public long getTotalRespuestas() {
        return totalRespuestas;
    }

    public void setTotalRespuestas(long totalRespuestas) {
        this.totalRespuestas = totalRespuestas;
    }

    public long getRespuestasCorrectas() {
        return respuestasCorrectas;
    }

    public void setRespuestasCorrectas(long respuestasCorrectas) {
        this.respuestasCorrectas = respuestasCorrectas;
    }

    public long getRespuestasIncorrectas() {
        return respuestasIncorrectas;
    }

    public void setRespuestasIncorrectas(long respuestasIncorrectas) {
        this.respuestasIncorrectas = respuestasIncorrectas;
    }

    public double getTasaAciertos() {
        return tasaAciertos;
    }

    public void setTasaAciertos(double tasaAciertos) {
        this.tasaAciertos = tasaAciertos;
    }

    public String getDificultad() {
        return dificultad;
    }

    public void setDificultad(String dificultad) {
        this.dificultad = dificultad;
    }
}
