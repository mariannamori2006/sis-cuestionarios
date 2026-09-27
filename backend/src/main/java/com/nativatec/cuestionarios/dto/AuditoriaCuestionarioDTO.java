package com.nativatec.cuestionarios.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AuditoriaCuestionarioDTO {
    private UUID cuestionarioId;
    private String titulo;
    private String materia;
    private Integer totalParticipantes;
    private Double promedio;
    private List<AuditoriaIntentoItemDTO> intentos = new ArrayList<>();

    public AuditoriaCuestionarioDTO() {
    }

    public AuditoriaCuestionarioDTO(UUID cuestionarioId, String titulo, String materia,
                                   Integer totalParticipantes, Double promedio,
                                   List<AuditoriaIntentoItemDTO> intentos) {
        this.cuestionarioId = cuestionarioId;
        this.titulo = titulo;
        this.materia = materia;
        this.totalParticipantes = totalParticipantes;
        this.promedio = promedio;
        this.intentos = intentos != null ? intentos : new ArrayList<>();
    }

    public UUID getCuestionarioId() {
        return cuestionarioId;
    }

    public void setCuestionarioId(UUID cuestionarioId) {
        this.cuestionarioId = cuestionarioId;
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

    public Integer getTotalParticipantes() {
        return totalParticipantes;
    }

    public void setTotalParticipantes(Integer totalParticipantes) {
        this.totalParticipantes = totalParticipantes;
    }

    public Double getPromedio() {
        return promedio;
    }

    public void setPromedio(Double promedio) {
        this.promedio = promedio;
    }

    public List<AuditoriaIntentoItemDTO> getIntentos() {
        return intentos;
    }

    public void setIntentos(List<AuditoriaIntentoItemDTO> intentos) {
        this.intentos = intentos;
    }
}
