package com.nativatec.cuestionarios.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ActividadRecienteDTO {
    private UUID intentoId;
    private String nombreAlumno;
    private String iniciales;
    private String colorAvatar;
    private String cuestionarioTitulo;
    private Double calificacion;
    private String notaTexto;
    private String tiempoRelativo;
    private LocalDateTime fechaHora;

    public ActividadRecienteDTO() {
    }

    public ActividadRecienteDTO(UUID intentoId, String nombreAlumno, String iniciales, String colorAvatar,
                               String cuestionarioTitulo, Double calificacion, String notaTexto,
                               String tiempoRelativo, LocalDateTime fechaHora) {
        this.intentoId = intentoId;
        this.nombreAlumno = nombreAlumno;
        this.iniciales = iniciales;
        this.colorAvatar = colorAvatar;
        this.cuestionarioTitulo = cuestionarioTitulo;
        this.calificacion = calificacion;
        this.notaTexto = notaTexto;
        this.tiempoRelativo = tiempoRelativo;
        this.fechaHora = fechaHora;
    }

    public UUID getIntentoId() {
        return intentoId;
    }

    public void setIntentoId(UUID intentoId) {
        this.intentoId = intentoId;
    }

    public String getNombreAlumno() {
        return nombreAlumno;
    }

    public void setNombreAlumno(String nombreAlumno) {
        this.nombreAlumno = nombreAlumno;
    }

    public String getIniciales() {
        return iniciales;
    }

    public void setIniciales(String iniciales) {
        this.iniciales = iniciales;
    }

    public String getColorAvatar() {
        return colorAvatar;
    }

    public void setColorAvatar(String colorAvatar) {
        this.colorAvatar = colorAvatar;
    }

    public String getCuestionarioTitulo() {
        return cuestionarioTitulo;
    }

    public void setCuestionarioTitulo(String cuestionarioTitulo) {
        this.cuestionarioTitulo = cuestionarioTitulo;
    }

    public Double getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(Double calificacion) {
        this.calificacion = calificacion;
    }

    public String getNotaTexto() {
        return notaTexto;
    }

    public void setNotaTexto(String notaTexto) {
        this.notaTexto = notaTexto;
    }

    public String getTiempoRelativo() {
        return tiempoRelativo;
    }

    public void setTiempoRelativo(String tiempoRelativo) {
        this.tiempoRelativo = tiempoRelativo;
    }

    public LocalDateTime getFechaHora() {
        return fechaHora;
    }

    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
}
