package com.nativatec.cuestionarios.dto;

import java.util.UUID;

public class CuestionarioEstadisticaItemDTO {
    private UUID id;
    private String titulo;
    private String materia;
    private Long totalRespuestas;
    private Integer totalPreguntas;
    private String fechaCreacion;

    public CuestionarioEstadisticaItemDTO() {
    }

    public CuestionarioEstadisticaItemDTO(UUID id, String titulo, String materia, Long totalRespuestas, Integer totalPreguntas, String fechaCreacion) {
        this.id = id;
        this.titulo = titulo;
        this.materia = materia;
        this.totalRespuestas = totalRespuestas;
        this.totalPreguntas = totalPreguntas;
        this.fechaCreacion = fechaCreacion;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getMateria() {
        return materia;
    }

    public void setMateria(String materia) {
        this.materia = materia;
    }

    public Long getTotalRespuestas() {
        return totalRespuestas;
    }

    public void setTotalRespuestas(Long totalRespuestas) {
        this.totalRespuestas = totalRespuestas;
    }

    public Integer getTotalPreguntas() {
        return totalPreguntas;
    }

    public void setTotalPreguntas(Integer totalPreguntas) {
        this.totalPreguntas = totalPreguntas;
    }

    public String getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(String fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
