package com.nativatec.cuestionarios.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "eventos_seguridad")
public class EventoSeguridad {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "intento_id", nullable = false)
    @JsonBackReference
    private IntentoEvaluacion intento;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false, length = 40)
    private TipoEventoSeguridad tipoEvento;

    @Column(length = 255)
    private String detalle;

    @Column(name = "occurred_at", nullable = false)
    private LocalDateTime occurredAt;

    public EventoSeguridad() {
    }

    public EventoSeguridad(IntentoEvaluacion intento, TipoEventoSeguridad tipoEvento, String detalle) {
        this.intento = intento;
        this.tipoEvento = tipoEvento;
        this.detalle = detalle;
    }

    @PrePersist
    protected void onCreate() {
        if (occurredAt == null) {
            occurredAt = LocalDateTime.now();
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public IntentoEvaluacion getIntento() {
        return intento;
    }

    public void setIntento(IntentoEvaluacion intento) {
        this.intento = intento;
    }

    public TipoEventoSeguridad getTipoEvento() {
        return tipoEvento;
    }

    public void setTipoEvento(TipoEventoSeguridad tipoEvento) {
        this.tipoEvento = tipoEvento;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public void setOccurredAt(LocalDateTime occurredAt) {
        this.occurredAt = occurredAt;
    }

    public enum TipoEventoSeguridad {
        CAMBIO_PESTANA,
        SALIDA_PANTALLA_COMPLETA,
        PERDIDA_FOCO,
        RECONEXION
    }
}

