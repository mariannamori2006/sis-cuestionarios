package com.nativatec.cuestionarios.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notificaciones")
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String mensaje;

    @Column(nullable = false, length = 50)
    private String tipo; // ENTREGA, REVISION_PENDIENTE, MODO_SEGURO, FECHA_LIMITE, SISTEMA

    @Column(nullable = false)
    private Boolean leido = false;

    @Column(name = "cuestionario_id")
    private UUID cuestionarioId;

    @Column(name = "sesion_id")
    private UUID sesionId;

    @Column(name = "intento_id")
    private UUID intentoId;

    @Column(length = 255)
    private String enlace;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Notificacion() {
    }

    public Notificacion(Usuario usuario, String titulo, String mensaje, String tipo, UUID cuestionarioId, UUID intentoId, String enlace) {
        this.usuario = usuario;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.cuestionarioId = cuestionarioId;
        this.intentoId = intentoId;
        this.enlace = enlace;
        this.leido = false;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (leido == null) {
            leido = false;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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

    public UUID getSesionId() {
        return sesionId;
    }

    public void setSesionId(UUID sesionId) {
        this.sesionId = sesionId;
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

