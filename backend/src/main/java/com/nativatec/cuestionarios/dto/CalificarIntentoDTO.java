package com.nativatec.cuestionarios.dto;

public class CalificarIntentoDTO {
    private Double calificacion;

    public CalificarIntentoDTO() {
    }

    public CalificarIntentoDTO(Double calificacion) {
        this.calificacion = calificacion;
    }

    public Double getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Double calificacion) {
        this.calificacion = calificacion;
    }
}
