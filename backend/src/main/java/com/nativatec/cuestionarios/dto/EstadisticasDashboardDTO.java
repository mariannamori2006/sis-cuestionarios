package com.nativatec.cuestionarios.dto;

public class EstadisticasDashboardDTO {
    private Double promedioGeneral;
    private Long totalCuestionarios;
    private Long totalRespuestas;
    private Long alumnosUnicos;
    private Double tasaAprobacion;
    private Long totalAprobados;
    private Long totalDesaprobados;

    public EstadisticasDashboardDTO() {
    }

    public EstadisticasDashboardDTO(Double promedioGeneral, Long totalCuestionarios, Long totalRespuestas, Long alumnosUnicos) {
        this.promedioGeneral = promedioGeneral;
        this.totalCuestionarios = totalCuestionarios;
        this.totalRespuestas = totalRespuestas;
        this.alumnosUnicos = alumnosUnicos;
        this.tasaAprobacion = 0.0;
        this.totalAprobados = 0L;
        this.totalDesaprobados = 0L;
    }

    public EstadisticasDashboardDTO(Double promedioGeneral, Long totalCuestionarios, Long totalRespuestas, Long alumnosUnicos,
                                    Double tasaAprobacion, Long totalAprobados, Long totalDesaprobados) {
        this.promedioGeneral = promedioGeneral;
        this.totalCuestionarios = totalCuestionarios;
        this.totalRespuestas = totalRespuestas;
        this.alumnosUnicos = alumnosUnicos;
        this.tasaAprobacion = tasaAprobacion != null ? tasaAprobacion : 0.0;
        this.totalAprobados = totalAprobados != null ? totalAprobados : 0L;
        this.totalDesaprobados = totalDesaprobados != null ? totalDesaprobados : 0L;
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

    public Double getTasaAprobacion() {
        return tasaAprobacion;
    }

    public void setTasaAprobacion(Double tasaAprobacion) {
        this.tasaAprobacion = tasaAprobacion;
    }

    public Long getTotalAprobados() {
        return totalAprobados;
    }

    public void setTotalAprobados(Long totalAprobados) {
        this.totalAprobados = totalAprobados;
    }

    public Long getTotalDesaprobados() {
        return totalDesaprobados;
    }

    public void setTotalDesaprobados(Long totalDesaprobados) {
        this.totalDesaprobados = totalDesaprobados;
    }
}
