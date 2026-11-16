package com.nativatec.cuestionarios.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotificacionDTO {
    private UUID id;
    private String titulo;
    private String mensaje;
    private String tipo;
    private Boolean leido;
    private UUID cuestionarioId;
    private UUID intentoId;
    private String enlace;
    private LocalDateTime createdAt;

    public NotificacionDTO() {
    }

    public NotificacionDTO(UUID id, String titulo, String mensaje, String tipo, Boolean leido, UUID cuestionarioId, UUID intentoId, String enlace, LocalDateTime createdAt) {
        this.id = id;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.leido = leido;
        this.cuestionarioId = cuestionarioId;
        this.intentoId = intentoId;
        this.enlace = enlace;
        this.createdAt = createdAt;
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

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Boolean getLeido() {
        return leido;
    }

    public void setLeido(Boolean leido) {
        this.leido = leido;
    }

    public UUID getCuestionarioId() {
        return cuestionarioId;
    }

    public void setCuestionarioId(UUID cuestionarioId) {
        this.cuestionarioId = cuestionarioId;
    }

    public UUID getIntentoId() {
        return intentoId;
    }

    public void setIntentoId(UUID intentoId) {
        this.intentoId = intentoId;
    }

    public String getEnlace() {
        return enlace;
    }

    public void setEnlace(String enlace) {
        this.enlace = enlace;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

