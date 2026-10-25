package com.nativatec.cuestionarios.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class EstadoDisponibilidadDTO {
    private UUID cuestionarioId;
    private boolean disponible;
    private String codigoEstado; // "DISPONIBLE", "NO_INICIADO", "FINALIZADO", "LIMITE_INTENTOS_ALCANZADO"
    private String mensaje;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private Integer limiteIntentos;
    private int intentosRealizados;
    private Integer intentosRestantes;
    private Double mejorNota;
    private String tipoCalificacionIntentos;

    public EstadoDisponibilidadDTO() {
    }

    public EstadoDisponibilidadDTO(UUID cuestionarioId, boolean disponible, String codigoEstado, String mensaje,
                                   LocalDateTime fechaInicio, LocalDateTime fechaFin, Integer limiteIntentos,
                                   int intentosRealizados, Integer intentosRestantes, Double mejorNota,
                                   String tipoCalificacionIntentos) {
        this.cuestionarioId = cuestionarioId;
        this.disponible = disponible;
        this.codigoEstado = codigoEstado;
        this.mensaje = mensaje;
        this.fechaInicio = fechaInicio;
        this.fechaFin = fechaFin;
        this.limiteIntentos = limiteIntentos;
        this.intentosRealizados = intentosRealizados;
        this.intentosRestantes = intentosRestantes;
        this.mejorNota = mejorNota;
        this.tipoCalificacionIntentos = tipoCalificacionIntentos;
    }

    public UUID getCuestionarioId() {
        return cuestionarioId;
    }

    public void setCuestionarioId(UUID cuestionarioId) {
        this.cuestionarioId = cuestionarioId;
    }

    public boolean isDisponible() {
        return disponible;
    }

    public void setDisponible(boolean disponible) {
        this.disponible = disponible;
    }

    public String getCodigoEstado() {
        return codigoEstado;
    }

    public void setCodigoEstado(String codigoEstado) {
        this.codigoEstado = codigoEstado;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFechaInicio() {
        return fechaInicio;
    }

    public void setFechaInicio(LocalDateTime fechaInicio) {
        this.fechaInicio = fechaInicio;
    }

    public LocalDateTime getFechaFin() {
        return fechaFin;
    }

    public void setFechaFin(LocalDateTime fechaFin) {
        this.fechaFin = fechaFin;
    }

    public Integer getLimiteIntentos() {
        return limiteIntentos;
    }

    public void setLimiteIntentos(Integer limiteIntentos) {
        this.limiteIntentos = limiteIntentos;
    }

    public int getIntentosRealizados() {
        return intentosRealizados;
    }

    public void setIntentosRealizados(int intentosRealizados) {
        this.intentosRealizados = intentosRealizados;
    }

    public Integer getIntentosRestantes() {
        return intentosRestantes;
    }

    public void setIntentosRestantes(Integer intentosRestantes) {
        this.intentosRestantes = intentosRestantes;
    }

    public Double getMejorNota() {
        return mejorNota;
    }

    public void setMejorNota(Double mejorNota) {
        this.mejorNota = mejorNota;
    }

    public String getTipoCalificacionIntentos() {
        return tipoCalificacionIntentos;
    }

    public void setTipoCalificacionIntentos(String tipoCalificacionIntentos) {
        this.tipoCalificacionIntentos = tipoCalificacionIntentos;
    }
}
