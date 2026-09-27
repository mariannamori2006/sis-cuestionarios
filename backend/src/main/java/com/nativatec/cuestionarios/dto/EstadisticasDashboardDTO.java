package com.nativatec.cuestionarios.dto;

public class EstadisticasDashboardDTO {
    private Double promedioGeneral;
    private Long totalCuestionarios;
    private Long totalRespuestas;
    private Long alumnosUnicos;

    public EstadisticasDashboardDTO() {
    }

    public EstadisticasDashboardDTO(Double promedioGeneral, Long totalCuestionarios, Long totalRespuestas, Long alumnosUnicos) {
        this.promedioGeneral = promedioGeneral;
        this.totalCuestionarios = totalCuestionarios;
        this.totalRespuestas = totalRespuestas;
        this.alumnosUnicos = alumnosUnicos;
    }

    public Double getPromedioGeneral() {
        return promedioGeneral;
    }

    public void setPromedioGeneral(Double promedioGeneral) {
        this.promedioGeneral = promedioGeneral;
    }

    public Long getTotalCuestionarios() {
        return totalCuestionarios;
    }

    public void setTotalCuestionarios(Long totalCuestionarios) {
        this.totalCuestionarios = totalCuestionarios;
    }

    public Long getTotalRespuestas() {
        return totalRespuestas;
    }

    public void setTotalRespuestas(Long totalRespuestas) {
        this.totalRespuestas = totalRespuestas;
    }

    public Long getAlumnosUnicos() {
        return alumnosUnicos;
    }

    public void setAlumnosUnicos(Long alumnosUnicos) {
        this.alumnosUnicos = alumnosUnicos;
    }
}
